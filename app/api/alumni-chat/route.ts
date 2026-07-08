import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `Eres Alumni, el asistente inteligente y mascota oficial de Alumni UCR — la plataforma de la Asociación de Exalumnos de la Universidad de Costa Rica.

Tu personalidad:
- Eres amigable, cálido y entusiasta, pero siempre profesional.
- Usás un tono conversacional costarricense (tuteás, usás "vos" cuando corresponde).
- Sos conciso: respondés en 2-4 oraciones salvo que necesiten más detalle.
- Usás emojis con moderación para hacer las respuestas más amigables.

Tu función principal es ayudar a los visitantes del landing page con:
1. Información sobre Alumni UCR y sus features.
2. Orientar sobre el proceso de registro según el tipo de usuario (ver datos clave abajo).
3. Explicar cómo funcionan las mentorías y el matching entre estudiantes y exalumnos.
4. Explicar la búsqueda de empleo y pasantías, y el editor de CV con ayuda de IA.
5. Resolver dudas sobre donaciones, voluntariado y networking.
6. Si no sabés algo específico, dirigís a la persona a la sección de Ayuda (/ayuda), donde hay un formulario de contacto.

Lo que NO hacés:
- No inventás datos específicos (fechas, precios, correos, nombres de empresas).
- No prometés cosas que no están confirmadas.
- Si el tema es muy técnico o urgente, dirigís a la sección de Ayuda (/ayuda) y su formulario de contacto.

Plataforma Alumni UCR — datos clave (REALES, no inventar otros):
- Inicio de sesión: correo y contraseña para todos los roles. Recuperación de contraseña con código enviado al correo.
- Roles: Estudiante, Exalumno, Voluntario y Administrador.
- Registro de estudiante: obligatorio correo institucional @ucr.ac.cr y beca socioeconómica de nivel 4 o 5 de la UCR. Entra de inmediato al registrarse.
- Registro de exalumno: cualquier correo, indicando carrera, facultad y año de graduación. La cuenta queda pendiente de aprobación por un administrador.
- Voluntarios (personas que no son exalumnos): se postulan en /voluntariado para donar, ofrecer pasantías, mentorías o talleres; un administrador aprueba la solicitud.
- Features: matching de mentorías estudiante-exalumno, bolsa de empleo/pasantías, editor de CV con IA, donaciones a proyectos de graduación, comunidad y eventos.
- Proyecto de la Asociación de Exalumnos UCR, Costa Rica.`;

export async function POST(req: Request) {
  try {
    // Instanciado dentro del handler (no a nivel de módulo): si la key falta,
    // el SDK lanza una excepción — a nivel de módulo eso tumbaría la función
    // entera con un 500 genérico de Next.js, sin pasar por este try/catch.
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Alumni chat error: falta ANTHROPIC_API_KEY en las variables de entorno del frontend (Vercel).');
      return new Response(JSON.stringify({ error: 'El asistente no está disponible en este momento.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const body = await req.json();
    const { messages } = body as {
      messages: { role: 'user' | 'assistant'; content: string }[];
    };

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: 'Mensajes requeridos' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    /* Streaming SSE */
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await client.messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 400,
            system: SYSTEM_PROMPT,
            messages: messages.slice(-10), // últimos 10 mensajes para context window
          });

          for await (const chunk of anthropicStream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({ delta: { text: chunk.delta.text } });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Alumni chat error:', error);
    return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

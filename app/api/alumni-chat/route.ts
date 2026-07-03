import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Eres Alumni, el asistente inteligente y mascota oficial de Alumni UCR — la plataforma de la Asociación de Exalumnos de la Universidad de Costa Rica.

Tu personalidad:
- Eres amigable, cálido y entusiasta, pero siempre profesional.
- Usás un tono conversacional costarricense (tuteás, usás "vos" cuando corresponde).
- Sos conciso: respondés en 2-4 oraciones salvo que necesiten más detalle.
- Usás emojis con moderación para hacer las respuestas más amigables.

Tu función principal es ayudar a los visitantes del landing page con:
1. Información sobre Alumni UCR y sus features.
2. Orientar sobre el proceso de registro (Magic Link, sin contraseñas).
3. Explicar cómo funciona la búsqueda de empleo y pasantías (RF-10/RF-13).
4. Guiar sobre el editor de CV y la adaptación con IA (RF-11/RF-12).
5. Resolver dudas sobre membresías, networking y mentorías.
6. Si no sabés algo específico, decís que lo derivarás al equipo y pedís el email.

Lo que NO hacés:
- No inventás datos específicos (fechas, precios, nombres de empresas).
- No prometés cosas que no están confirmadas.
- Si el tema es muy técnico o urgente, dirigís al correo alumni@ucr.ac.cr.

Plataforma Alumni UCR — datos clave:
- Autenticación: Magic Link (sin contraseñas, solo email).
- Roles: Estudiante, Empresa, Admin.
- Features: Posiciones de empleo/pasantía, Editor de CV, Adaptación de CV con IA, Sistema de aplicaciones con seguimiento.
- Stack: Next.js, Supabase, Claude AI.
- Proyecto de la Asociación de Exalumnos UCR, Costa Rica.`;

export async function POST(req: Request) {
  try {
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

import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

// IA de "Sugerir mejora" del asistente de Proyecto de Graduación.
// Alcance ESTRICTO: solo mejora redacción de 4 campos (planteamiento del
// problema, justificación, objetivo general, objetivos específicos). No
// inventa información nueva — solo reescribe lo que el estudiante ya escribió
// en un tono más académico, preservando la idea original.

const CAMPOS_PERMITIDOS = ['planteamientoProblema', 'justificacion', 'objetivoGeneral', 'objetivoEspecifico'] as const;
type CampoPermitido = typeof CAMPOS_PERMITIDOS[number];

const ETIQUETAS: Record<CampoPermitido, string> = {
  planteamientoProblema: 'planteamiento del problema',
  justificacion: 'justificación',
  objetivoGeneral: 'objetivo general',
  objetivoEspecifico: 'un objetivo específico',
};

export async function POST(req: Request) {
  try {
    // Instanciado dentro del handler, no a nivel de módulo: si la key falta,
    // el SDK explota al importar, tumbando la función con un 500 genérico
    // de Next.js en vez de un error diagnosticable (bug real que ya
    // encontramos y arreglamos en app/api/alumni-chat/route.ts).
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'El asistente de IA no está disponible en este momento.' }, { status: 500 });
    }
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const body = await req.json();
    const { campo, texto } = body as { campo: CampoPermitido; texto: string };

    if (!CAMPOS_PERMITIDOS.includes(campo)) {
      return NextResponse.json({ error: 'La IA solo puede sugerir mejoras en planteamiento del problema, justificación u objetivos.' }, { status: 400 });
    }
    if (!texto || !texto.trim()) {
      return NextResponse.json({ error: 'Escribí primero un texto para poder sugerir una mejora.' }, { status: 400 });
    }

    const prompt = `Eres un asesor metodológico de proyectos de graduación de la Universidad de Costa Rica.

Un estudiante escribió el siguiente texto para la sección "${ETIQUETAS[campo]}" de su propuesta de proyecto de graduación:

"""
${texto.trim()}
"""

Tu tarea:
- Mejorar la redacción y darle un tono más académico y formal.
- Mantener EXACTAMENTE la misma idea e intención del estudiante.
- NO inventar datos, cifras, referencias ni información que el estudiante no haya escrito.
- Si el texto ya es breve, no lo alargues innecesariamente.

Responde ÚNICAMENTE con el texto mejorado, sin comillas, sin explicaciones, sin títulos.`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const bloque = message.content.find((b) => b.type === 'text');
    const sugerencia = bloque && bloque.type === 'text' ? bloque.text.trim() : '';

    if (!sugerencia) {
      return NextResponse.json({ error: 'No se pudo generar una sugerencia en este momento.' }, { status: 500 });
    }

    return NextResponse.json({ sugerencia });
  } catch (error) {
    console.error('Error en /api/proyecto-graduacion/sugerir:', error);
    return NextResponse.json({ error: 'No se pudo generar la sugerencia en este momento.' }, { status: 500 });
  }
}

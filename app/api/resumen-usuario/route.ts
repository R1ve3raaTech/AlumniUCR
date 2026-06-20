import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { usuario } = body;

    if (!usuario) {
      return NextResponse.json({ error: 'Datos de usuario requeridos' }, { status: 400 });
    }

    const prompt = `Eres un asistente administrativo de la plataforma "Conectando Talento UCR", una red universitaria de alumni de la Universidad de Costa Rica.

Genera un resumen profesional y conciso (máximo 3 oraciones) del siguiente perfil de usuario para el administrador de la plataforma. El resumen debe destacar el rol, estado de la cuenta y cualquier información relevante de manera clara y directa. Usa un tono institucional pero amigable.

Datos del usuario:
- Nombre: ${usuario.nombre || 'No especificado'}
- Correo: ${usuario.correo_electronico || 'No especificado'}
- Rol: ${usuario.rol || 'No especificado'}
- Estado: ${usuario.estado || 'No especificado'}
- Fecha de registro: ${usuario.created_at || 'No especificada'}

Responde ÚNICAMENTE con el resumen, sin títulos ni formato adicional.`;

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 200,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const resumen = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({ resumen });
  } catch (error) {
    console.error('Error generando resumen con Claude:', error);
    return NextResponse.json(
      { error: 'No se pudo generar el resumen en este momento.' },
      { status: 500 }
    );
  }
}

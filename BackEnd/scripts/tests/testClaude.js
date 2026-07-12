/**
 * Script de prueba para validar llamadas multi-turno y systemInstruction con Anthropic Claude.
 * Ejecutar desde BackEnd/: node scripts/testClaude.js
 */
const claude = require('../../config/claude');

async function test() {
  console.log('🔄 Probando chat multi-turno y systemInstruction con Claude...');
  try {
    const response = await claude.messages.create({
      model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'Eres un robot sarcástico de la UCR. Siempre saluda diciendo "Hola UCR".',
      temperature: 0.3,
      messages: [
        { role: 'user', content: 'Hola, ¿quién eres?' },
        { role: 'assistant', content: 'Soy el asistente oficial de pruebas.' },
        { role: 'user', content: 'Excelente. ¿Cuál es mi nombre si te digo que me llamo Carlos?' },
      ]
    });
    console.log('🟢 Respuesta recibida:');
    console.log(response.content[0].text);
  } catch (error) {
    console.error('🔴 Error en llamada multi-turno de Claude:', error);
  }
}

test();

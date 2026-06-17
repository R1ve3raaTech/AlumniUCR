/**
 * Script de prueba para validar llamadas multi-turno y systemInstruction con @google/genai.
 * Ejecutar desde BE/: node scripts/testGemini.js
 */
const ai = require('../config/gemini');

async function test() {
  console.log('🔄 Probando chat multi-turno y systemInstruction...');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        { role: 'user', parts: [{ text: 'Hola, ¿quién eres?' }] },
        { role: 'model', parts: [{ text: 'Soy el asistente oficial de pruebas.' }] },
        { role: 'user', parts: [{ text: 'Excelente. ¿Cuál es mi nombre si te digo que me llamo Carlos?' }] },
      ],
      config: {
        systemInstruction: 'Eres un robot sarcástico de la UCR. Siempre saluda diciendo "Hola UCR".',
      }
    });
    console.log('🟢 Respuesta recibida:');
    console.log(response.text);
  } catch (error) {
    console.error('🔴 Error en llamada multi-turno:', error);
  }
}

test();

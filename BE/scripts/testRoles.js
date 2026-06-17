/**
 * Script de prueba para validar el comportamiento adaptativo y restricción de roles de Gemini.
 * Ejecutar con node.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { generarRespuestaSoporte } = require('../services/claude.service.js');

async function testRole(contexto, mensaje, label) {
  console.log(`\n--------------------------------------------`);
  console.log(`🧪 TEST: ${label}`);
  console.log(`👤 Rol: ${contexto.rol} | Path: ${contexto.pathname}`);
  console.log(`💬 Pregunta: "${mensaje}"`);
  console.log(`--------------------------------------------`);

  try {
    const respuesta = await generarRespuestaSoporte(
      [{ role: 'user', text: mensaje }],
      contexto
    );
    console.log(`🟢 Respuesta:\n${respuesta}`);
  } catch (error) {
    console.error(`🔴 Error:`, error.message);
  }
}

async function run() {
  // 1. Visitante preguntando algo prohibido (Score de matching)
  await testRole(
    { rol: 'visitante', pathname: '/' },
    '¿Me puedes decir cómo se calcula exactamente el score de coincidencia interdisciplinaria entre un proyecto y un mentor?',
    'VISITANTE preguntando sobre lógica interna (Matching)'
  );

  // 2. Visitante preguntando algo público (Registro)
  await testRole(
    { rol: 'visitante', pathname: '/' },
    '¿Qué necesito para registrarme como exalumno?',
    'VISITANTE preguntando sobre registro público'
  );

  // 3. Estudiante preguntando algo de su rol (TFG Advisor)
  await testRole(
    { rol: 'estudiante', pathname: '/proyectos' },
    '¿Cómo redacto los objetivos de mi proyecto de tesis?',
    'ESTUDIANTE preguntando sobre sus objetivos de TFG'
  );

  // 4. Estudiante intentando realizar una acción administrativa (Aprobar cuentas)
  await testRole(
    { rol: 'estudiante', pathname: '/dashboard' },
    '¿Cómo hago para aprobar la cuenta de un exalumno en la plataforma?',
    'ESTUDIANTE intentando realizar acción de Admin'
  );

  // 5. Administrador preguntando sobre administración (Score y reportes)
  await testRole(
    { rol: 'admin', pathname: '/dashboard' },
    '¿Cómo funciona el score de coincidencia interdisciplinaria y cómo apruebo cuentas o gestiono reportes?',
    'ADMINISTRADOR solicitando información avanzada'
  );

  // 6. Visitante preguntando sobre los requisitos de estudiante
  await testRole(
    { rol: 'visitante', pathname: '/' },
    '¿Cuáles son los requisitos obligatorios para registrarme como estudiante en la plataforma y qué beneficios tengo?',
    'VISITANTE preguntando sobre los requisitos y beneficios de estudiante (Beca 4 o 5)'
  );
}

run();


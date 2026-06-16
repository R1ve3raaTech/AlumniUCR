/**
 * Script de prueba para el endpoint Express /api/gemini/chat con Contextos Dinámicos.
 * Ejecutar mientras el servidor BE está corriendo: node scripts/testChatEndpoint.js
 */
async function testChatEndpoint(contexto, mensajeTest, nombreContexto) {
  const PORT = process.env.PORT || 5000;
  const url = `http://localhost:${PORT}/api/gemini/chat`;
  console.log(`\n======================================================`);
  console.log(`🔄 Probando Contexto: ${nombreContexto}`);
  console.log(`   Rol: ${contexto.rol} | Path: ${contexto.pathname}`);
  console.log(`   Pregunta: "${mensajeTest}"`);
  console.log(`======================================================`);

  const payload = {
    historial: [
      { role: 'user', text: mensajeTest }
    ],
    contexto: contexto
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('🟢 Código de Estado:', response.status);
    console.log('🟢 Respuesta del Servidor:');
    console.log(data.respuesta);
  } catch (error) {
    console.error('🔴 Error al conectar con el servidor Express:', error.message);
  }
}

async function runAllTests() {
  // 1. Caso Estudiante en Proyectos (TFG Advisor)
  await testChatEndpoint(
    { rol: 'estudiante', pathname: '/proyectos' },
    '¿Cómo puedo escribir el objetivo general de mi tesis de grado?',
    'TFG Advisor (Estudiante en Proyectos)'
  );

  // 2. Caso Exalumno en Dashboard
  await testChatEndpoint(
    { rol: 'exalumno', pathname: '/dashboard' },
    '¿Qué tengo que hacer para que me aprueben como mentor?',
    'Exalumno/Mentor en Dashboard'
  );

  // 3. Caso Administrador
  await testChatEndpoint(
    { rol: 'admin', pathname: '/dashboard' },
    '¿Cómo calcula la plataforma el score de coincidencia interdisciplinaria?',
    'Administrador'
  );
}

runAllTests();

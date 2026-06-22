// Almacén de reportes (denuncias / quejas / sugerencias) que envían los
// estudiantes sobre estudiantes o exalumnos. Persiste en un archivo JSON local
// (igual que consultas/voluntarios). Los lee el administrador en su panel.
//
// Para migrar a Postgres: crear la tabla `reportes_anomalias` y reemplazar
// estas funciones por consultas con el cliente service_role.

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'reportes-anomalias.json');

const leerTodo = async () => {
  try {
    const raw = await fs.readFile(FILE, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
};

const guardarTodo = async (lista) => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(lista, null, 2), 'utf8');
};

/** Lista los reportes, del más reciente al más antiguo. */
const listar = async () => {
  const lista = await leerTodo();
  return [...lista].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
};

/** Reportes de un usuario (su historial). */
const listarPorUsuario = async (idUsuario) => {
  const lista = await listar();
  return lista.filter((r) => r.reportado_por === idUsuario);
};

/** Crea un reporte nuevo en estado 'nueva'. */
const crear = async (datos) => {
  const lista = await leerTodo();
  const reporte = {
    id: crypto.randomUUID(),
    tipo: datos.tipo, // Denuncia | Queja | Sugerencia
    persona_tipo: datos.persona_tipo || '', // Estudiante | Exalumno | General
    persona_nombre: datos.persona_nombre || '',
    persona_identificador: datos.persona_identificador || '',
    motivo: datos.motivo || '',
    descripcion: datos.descripcion,
    anonimo: Boolean(datos.anonimo),
    // Se guarda quién reportó para auditoría del admin; al reportado NO se le revela.
    reportado_por: datos.reportado_por || null,
    reportado_por_nombre: datos.reportado_por_nombre || '',
    estado: 'nueva', // nueva | en_revision | resuelta
    created_at: new Date().toISOString(),
  };
  lista.push(reporte);
  await guardarTodo(lista);
  return reporte;
};

/** Cambia el estado de un reporte (admin). */
const marcar = async (id, estado) => {
  const lista = await leerTodo();
  const idx = lista.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  lista[idx] = { ...lista[idx], estado, updated_at: new Date().toISOString() };
  await guardarTodo(lista);
  return lista[idx];
};

module.exports = { listar, listarPorUsuario, crear, marcar };

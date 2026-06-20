// Almacén de consultas de soporte enviadas desde el Centro de Ayuda por
// personas visitantes (sin sesión). Persiste en un archivo JSON local, igual
// que el store de voluntarios.
//
// Para migrarlo a Postgres: crear la tabla `consultas_soporte`
// (ver BE/db/consultas_soporte.sql) y reemplazar estas funciones por consultas
// con el cliente service_role.

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'consultas-soporte.json');

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

/** Lista las consultas, de la más reciente a la más antigua. */
const listar = async () => {
  const lista = await leerTodo();
  return [...lista].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
};

/** Crea una consulta nueva en estado 'nueva'. */
const crear = async (datos) => {
  const lista = await leerTodo();
  const ahora = new Date().toISOString();
  const consulta = {
    id: crypto.randomUUID(),
    nombre: datos.nombre,
    apellidos: datos.apellidos,
    cedula: datos.cedula,
    telefono: datos.telefono,
    mensaje: datos.mensaje,
    estado: 'nueva', // nueva | atendida
    created_at: ahora,
    updated_at: ahora,
  };
  lista.push(consulta);
  await guardarTodo(lista);
  return consulta;
};

/** Cambia el estado de una consulta (p. ej. 'atendida'). */
const actualizarEstado = async (id, estado) => {
  const lista = await leerTodo();
  const i = lista.findIndex((c) => c.id === id);
  if (i === -1) return null;
  lista[i] = { ...lista[i], estado: estado || 'atendida', updated_at: new Date().toISOString() };
  await guardarTodo(lista);
  return lista[i];
};

module.exports = { listar, crear, actualizarEstado };

// Almacén de solicitudes de contacto (exalumno → estudiante) del RF-03.
// Persiste en archivo JSON (mismo patrón que voluntarios.store) para no requerir
// cambios de esquema en producción. Migrable a una tabla cuando se desee.

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'solicitudes-contacto.json');

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

const listar = () => leerTodo();

/** Crea una solicitud (evita duplicar una pendiente/aceptada del mismo par). */
const crear = async ({ id_estudiante, id_exalumno, nombre_exalumno, mensaje }) => {
  const lista = await leerTodo();
  const existente = lista.find(
    (s) => s.id_estudiante === id_estudiante && s.id_exalumno === id_exalumno && s.estado !== 'rechazada',
  );
  if (existente) return existente;

  const ahora = new Date().toISOString();
  const solicitud = {
    id: crypto.randomUUID(),
    id_estudiante,
    id_exalumno,
    nombre_exalumno,
    mensaje: mensaje || '',
    estado: 'pendiente',
    created_at: ahora,
    updated_at: ahora,
  };
  lista.push(solicitud);
  await guardarTodo(lista);
  return solicitud;
};

/** El estudiante responde su solicitud (aceptada | rechazada). */
const responder = async (id, idEstudiante, estado) => {
  const lista = await leerTodo();
  const i = lista.findIndex((s) => s.id === id && s.id_estudiante === idEstudiante);
  if (i === -1) return null;
  lista[i] = { ...lista[i], estado, updated_at: new Date().toISOString() };
  await guardarTodo(lista);
  return lista[i];
};

module.exports = { listar, crear, responder };

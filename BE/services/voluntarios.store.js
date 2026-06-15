// Almacén de solicitudes de voluntarios/colaboradores externos (opción "Otros"
// del registro). Persiste en un archivo JSON local.
//
// NOTA: se usa un store en archivo porque la creación de la tabla en Supabase
// no estaba disponible al implementar la función. Para migrarlo a Postgres,
// crear la tabla `solicitudes_voluntarios` (ver BE/db/solicitudes_voluntarios.sql)
// y reemplazar estas funciones por consultas con el cliente service_role.

const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'solicitudes-voluntarios.json');

// Lee el arreglo completo; si el archivo no existe, devuelve [].
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

// Guarda el arreglo completo, creando la carpeta si hace falta.
const guardarTodo = async (lista) => {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(lista, null, 2), 'utf8');
};

/** Lista las solicitudes, de la más reciente a la más antigua. */
const listar = async () => {
  const lista = await leerTodo();
  return [...lista].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
};

/** Crea una solicitud nueva en estado 'pendiente'. */
const crear = async (datos) => {
  const lista = await leerTodo();
  const ahora = new Date().toISOString();
  const solicitud = {
    id: crypto.randomUUID(),
    nombre: datos.nombre,
    correo_electronico: datos.correo_electronico,
    telefono: datos.telefono,
    organizacion: datos.organizacion,
    area_colaboracion: datos.area_colaboracion,
    disponibilidad: datos.disponibilidad,
    mensaje: datos.mensaje,
    estado: 'pendiente',
    acceso_proyectos: false,
    acceso_mentorias: false,
    acceso_estudiantes: false,
    created_at: ahora,
    updated_at: ahora,
  };
  lista.push(solicitud);
  await guardarTodo(lista);
  return solicitud;
};

/**
 * Actualiza los accesos otorgados por el administrador y marca la solicitud
 * como 'aprobado' (o 'rechazado' si no se otorga ningún acceso y se indica).
 */
const actualizarAccesos = async (id, { acceso_proyectos, acceso_mentorias, acceso_estudiantes, estado }) => {
  const lista = await leerTodo();
  const i = lista.findIndex((s) => s.id === id);
  if (i === -1) return null;

  lista[i] = {
    ...lista[i],
    acceso_proyectos: Boolean(acceso_proyectos),
    acceso_mentorias: Boolean(acceso_mentorias),
    acceso_estudiantes: Boolean(acceso_estudiantes),
    estado: estado || 'aprobado',
    updated_at: new Date().toISOString(),
  };
  await guardarTodo(lista);
  return lista[i];
};

module.exports = { listar, crear, actualizarAccesos };

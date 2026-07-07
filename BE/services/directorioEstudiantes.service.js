// Directorio de estudiantes (RF-03) y solicitudes de contacto.
//
// Reglas de privacidad:
//   - Solo aparecen estudiantes con perfil completo (información académica +
//     proyecto de graduación).
//   - El nivel de beca NO se expone en el directorio.
//   - La beca y el correo de contacto se revelan al exalumno SOLO cuando el
//     estudiante acepta su solicitud de contacto.

const supabase = require('../config/supabase');
const contacto = require('./contacto.store');
const { enviarCorreoNuevoContacto } = require('./email.service');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const cargarDatos = async () => {
  const [
    usuarios, info, carrUsu, carreras, facultades, proyectos, areasProy, areasCat, habilidades, becas,
  ] = await Promise.all([
    supabase.from('usuarios').select('id,nombre,correo_electronico,id_rol,estado').eq('id_rol', 1).eq('estado', 'activo'),
    supabase.from('informacion_estudiante').select('*'),
    supabase.from('carreras_usuario').select('id_usuario,id_carrera,ano_graduacion'),
    supabase.from('carreras').select('id,nombre,id_facultad'),
    supabase.from('facultades').select('id,nombre'),
    supabase.from('proyecto_graduacion').select('id,id_estudiante,titulo_proyecto,descripcion,porcentaje_avance,proyecto_finalizado'),
    supabase.from('areas_interes_proyecto').select('id_proyecto,id_area_tematica'),
    supabase.from('areas_interes').select('id,nombre'),
    supabase.from('habilidades_estudiante').select('id_usuario,tecnicas'),
    supabase.from('beca_socioeconomica').select('id,nombre'),
  ]);

  return {
    usuarios: usuarios.data || [],
    infoPorUsuario: new Map((info.data || []).map((i) => [i.id_usuario, i])),
    carrUsu: carrUsu.data || [],
    carreraNombre: new Map((carreras.data || []).map((c) => [c.id, c.nombre])),
    carreraFacultad: new Map((carreras.data || []).map((c) => [c.id, c.id_facultad])),
    facultadNombre: new Map((facultades.data || []).map((f) => [f.id, f.nombre])),
    proyectoPorEstudiante: new Map((proyectos.data || []).map((p) => [p.id_estudiante, p])),
    areasProy: areasProy.data || [],
    areaNombre: new Map((areasCat.data || []).map((a) => [a.id, a.nombre])),
    habilidadPorUsuario: new Map((habilidades.data || []).map((h) => [h.id_usuario, h.tecnicas])),
    becaNombre: new Map((becas.data || []).map((b) => [b.id, b.nombre])),
  };
};

const perfilCompleto = (info, proyecto) =>
  Boolean(info) &&
  Boolean(proyecto) &&
  info.perfil_completo === true &&
  info.pausado === false;

// Construye la tarjeta pública de un estudiante (sin beca ni correo).
const tarjetaEstudiante = (u, d) => {
  const info = d.infoPorUsuario.get(u.id);
  const proyecto = d.proyectoPorEstudiante.get(u.id);
  if (!perfilCompleto(info, proyecto)) return null;
  if (info.pausado) return null;                 // RF-03: estudiante pausado no aparece (no recibe contactos)
  if (proyecto.proyecto_finalizado) return null; // RF-05: proyecto finalizado no aparece en el directorio activo

  const carrerasIds = d.carrUsu.filter((c) => c.id_usuario === u.id).map((c) => c.id_carrera);
  const facultades = [...new Set(carrerasIds.map((c) => d.facultadNombre.get(d.carreraFacultad.get(c))).filter(Boolean))];
  const areas = d.areasProy
    .filter((a) => a.id_proyecto === proyecto.id)
    .map((a) => d.areaNombre.get(a.id_area_tematica))
    .filter(Boolean);

  return {
    id: u.id,
    nombre: u.nombre,
    carreras: carrerasIds.map((c) => d.carreraNombre.get(c)).filter(Boolean),
    facultades,
    proyecto: { titulo: proyecto.titulo_proyecto, avance: proyecto.porcentaje_avance },
    areas,
    habilidades: d.habilidadPorUsuario.get(u.id) || '',
    busca: {
      financiamiento: !!info.busca_financiamiento,
      mentoria: !!info.busca_mentoria,
      empleo: !!info.busca_empleo,
      pasantia: !!info.busca_pasantia,
    },
    // beca y correo NO se incluyen aquí (privados).
  };
};

// Directorio público (sin sesión): solo las tarjetas públicas de los proyectos.
// Nunca incluye beca, correo ni estado de solicitud (eso exige sesión de
// exalumno). Lo usa la página pública /proyectos.
const obtenerDirectorioPublico = async () => {
  const d = await cargarDatos();
  return d.usuarios
    .map((u) => {
      const card = tarjetaEstudiante(u, d);
      return card ? { ...card, solicitud: null } : null;
    })
    .filter(Boolean);
};

// Directorio para un exalumno: cada estudiante incluye el estado de su solicitud
// y, si fue aceptada, se revelan la beca y el correo de contacto.
const obtenerDirectorioParaExalumno = async (idExalumno) => {
  const d = await cargarDatos();
  const solicitudes = await contacto.listar();

  return d.usuarios
    .map((u) => {
      const card = tarjetaEstudiante(u, d);
      if (!card) return null;
      // Puede haber más de una solicitud por par (p. ej. rechazada y luego
      // re-solicitada): se prioriza la aceptada y, en su defecto, la más
      // reciente, en vez de la primera en orden de inserción.
      const delPar = solicitudes.filter((s) => s.id_estudiante === u.id && s.id_exalumno === idExalumno);
      const sol =
        delPar.find((s) => s.estado === 'aceptada') ||
        delPar.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1))[0];
      const estadoSolicitud = sol ? sol.estado : null;
      const aceptada = estadoSolicitud === 'aceptada';
      const info = d.infoPorUsuario.get(u.id);
      return {
        ...card,
        solicitud: estadoSolicitud, // null | pendiente | aceptada | rechazada
        // Revelado condicional (RF-03): solo si el estudiante aceptó.
        beca: aceptada ? d.becaNombre.get(info.id_beca) || 'Sin beca' : null,
        correo: aceptada ? u.correo_electronico : null,
      };
    })
    .filter(Boolean);
};

// Solicitud de contacto creada por un exalumno/voluntario hacia un estudiante.
const crearSolicitud = async ({ idEstudiante, idExalumno, nombreExalumno, rolExalumno, mensaje }) => {
  const d = await cargarDatos();
  const u = d.usuarios.find((x) => x.id === idEstudiante);
  if (!u) {
    const err = new Error('El estudiante indicado no existe o no está disponible.');
    err.statusCode = 404;
    throw err;
  }

  // ¿Ya había una solicitud del par? Solo se notifica al estudiante cuando la
  // solicitud es nueva o se reactiva una rechazada (no en clics repetidos).
  const previa = (await contacto.listar()).find(
    (s) => s.id_estudiante === idEstudiante && s.id_exalumno === idExalumno,
  );

  const solicitud = await contacto.crear({
    id_estudiante: idEstudiante,
    id_exalumno: idExalumno,
    nombre_exalumno: nombreExalumno,
    mensaje,
  });

  if (!previa || previa.estado === 'rechazada') {
    // Fire-and-forget: el correo no bloquea ni tumba la solicitud si falla.
    enviarCorreoNuevoContacto({
      nombre_remitente: nombreExalumno,
      correo_destinatario: u.correo_electronico,
      nombre_destinatario: u.nombre,
      rol_remitente: rolExalumno || 'exalumno',
      aceptar_url: `${FRONTEND_URL}/perfil-estudiante`,
    }).catch(() => {});
  }

  return solicitud;
};

// Solicitudes recibidas por un estudiante (para aceptar/rechazar).
const solicitudesRecibidas = async (idEstudiante) => {
  const solicitudes = await contacto.listar();
  return solicitudes
    .filter((s) => s.id_estudiante === idEstudiante)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
};

const responderSolicitud = async (id, idEstudiante, aceptar) =>
  contacto.responder(id, idEstudiante, aceptar ? 'aceptada' : 'rechazada');

module.exports = {
  obtenerDirectorioPublico,
  obtenerDirectorioParaExalumno,
  crearSolicitud,
  solicitudesRecibidas,
  responderSolicitud,
};

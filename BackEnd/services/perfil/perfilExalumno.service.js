// Perfil del Exalumno (RF-02). Fuente única que alimenta el dashboard, el
// matching interdisciplinario y el directorio público. Escribe en las tablas
// relacionales: informacion_exalumno, carreras_usuario, areas_interes_exalumno
// y sectores_exalumno. Usa el cliente service_role.

const supabase = require('../../config/supabase');

const ID_SEDE_POR_DEFECTO = 1; // Sede Rodrigo Facio (carreras_usuario.id_sede NOT NULL)

// Campos obligatorios del RF-02 para calcular el porcentaje de completitud.
// La foto NO es obligatoria. Los checkboxes de apoyo no cuentan (siempre tienen
// valor); sí cuentan sus campos condicionales.
const calcularCompletitud = (info, carreras, areas, sectores) => {
  const requeridos = [];
  const add = (ok) => requeridos.push(Boolean(ok));

  add(info?.pais);
  add(info?.ciudad);
  add(info?.url_linkedin);
  add(info?.biografia);
  add(carreras.length > 0);
  add(info?.escuela_facultad || carreras.length > 0);
  add(info?.anio_graduacion);
  add(info?.empresa);
  add(info?.cargo);
  add(sectores.length > 0);
  add(Number.isFinite(info?.anos_experiencia));
  add(areas.length > 0);
  if (info?.ofrece_mentoria) add(info?.horas_disponibles_mes > 0);
  if (info?.ofrece_donacion) add(info?.monto_maximo_donacion > 0 && info?.moneda);

  const total = requeridos.length;
  const cumplidos = requeridos.filter(Boolean).length;
  const porcentaje = total === 0 ? 0 : Math.round((cumplidos / total) * 100);
  return { porcentaje, completo: porcentaje === 100 };
};

// Catálogos para los selects del formulario.
const obtenerCatalogos = async () => {
  const [sectores, areas, facultades, carreras] = await Promise.all([
    supabase.from('sectores').select('id,nombre').order('nombre'),
    supabase.from('areas_interes').select('id,nombre').order('nombre'),
    supabase.from('facultades').select('id,nombre').order('nombre'),
    supabase.from('carreras').select('id,nombre,id_facultad').order('nombre'),
  ]);
  return {
    sectores: sectores.data || [],
    areas: areas.data || [],
    facultades: facultades.data || [],
    carreras: carreras.data || [],
  };
};

// Lee el metadata (escuela/facultad, año) del usuario de Auth como respaldo.
const leerMetadata = async (userId) => {
  try {
    const { data } = await supabase.auth.admin.getUserById(userId);
    return data?.user?.user_metadata || {};
  } catch {
    return {};
  }
};

const obtenerPerfil = async (userId) => {
  const [usuarioRes, infoRes, carrerasRes, areasRes, sectoresRes, meta] = await Promise.all([
    supabase.from('usuarios').select('id,nombre,correo_electronico,estado').eq('id', userId).maybeSingle(),
    supabase.from('informacion_exalumno').select('*').eq('id_usuario', userId).maybeSingle(),
    supabase.from('carreras_usuario').select('id_carrera,ano_graduacion').eq('id_usuario', userId),
    supabase.from('areas_interes_exalumno').select('id_area_tematica').eq('id_exalumno', userId),
    supabase.from('sectores_exalumno').select('id_sector').eq('id_exalumno', userId),
    leerMetadata(userId),
  ]);

  const info = infoRes.data || {};
  const carreras = (carrerasRes.data || []).map((c) => c.id_carrera);
  const areas = (areasRes.data || []).map((a) => a.id_area_tematica);
  const sectores = (sectoresRes.data || []).map((s) => s.id_sector);
  const anioGraduacion =
    (carrerasRes.data || [])[0]?.ano_graduacion ?? meta.anio_graduacion ?? null;
  const escuelaFacultad = meta.escuela_facultad || null;

  const infoCompletitud = { ...info, anio_graduacion: anioGraduacion, escuela_facultad: escuelaFacultad };
  const completitud = calcularCompletitud(infoCompletitud, carreras, areas, sectores);

  return {
    usuario: usuarioRes.data || null,
    perfil: {
      foto_perfil: info.foto_perfil || '',
      pais: info.pais || '',
      ciudad: info.ciudad || '',
      url_linkedin: info.url_linkedin || '',
      biografia: info.biografia || '',
      empresa: info.empresa || '',
      cargo: info.cargo || '',
      anos_experiencia: info.anos_experiencia ?? '',
      ofrece_mentoria: info.ofrece_mentoria || false,
      horas_disponibles_mes: info.horas_disponibles_mes ?? '',
      ofrece_empleo: info.ofrece_empleo || false,
      ofrece_pasantia: info.ofrece_pasantia || false,
      ofrece_colaboracion: info.ofrece_colaboracion || false,
      ofrece_donacion: info.ofrece_donacion || false,
      monto_maximo_donacion: info.monto_maximo_donacion ?? '',
      moneda: info.moneda || 'CRC',
      escuela_facultad: escuelaFacultad || '',
      anio_graduacion: anioGraduacion ?? '',
      carreras,
      areas,
      sectores,
    },
    completitud,
  };
};

// Reemplaza por completo las filas de una tabla puente para el usuario.
const reemplazarPuente = async (tabla, columnaUsuario, userId, filas) => {
  await supabase.from(tabla).delete().eq(columnaUsuario, userId);
  if (filas.length > 0) {
    const { error } = await supabase.from(tabla).insert(filas);
    if (error) throw error;
  }
};

const guardarPerfil = async (userId, d) => {
  // 1. Datos personales/profesionales/apoyo en informacion_exalumno.
  const fila = {
    id_usuario: userId,
    foto_perfil: d.foto_perfil || null,
    pais: d.pais,
    ciudad: d.ciudad,
    url_linkedin: d.url_linkedin,
    biografia: d.biografia,
    empresa: d.empresa,
    cargo: d.cargo,
    anos_experiencia: d.anos_experiencia,
    ofrece_mentoria: d.ofrece_mentoria,
    horas_disponibles_mes: d.ofrece_mentoria ? d.horas_disponibles_mes : null,
    ofrece_empleo: d.ofrece_empleo,
    ofrece_pasantia: d.ofrece_pasantia,
    ofrece_colaboracion: d.ofrece_colaboracion,
    ofrece_donacion: d.ofrece_donacion,
    monto_maximo_donacion: d.ofrece_donacion ? d.monto_maximo_donacion : null,
    moneda: d.ofrece_donacion ? d.moneda : null,
    estado: true,
  };
  const { error: infoError } = await supabase
    .from('informacion_exalumno')
    .upsert(fila, { onConflict: 'id_usuario' });
  if (infoError) throw infoError;

  // 2. Tablas puente (reemplazo completo).
  await reemplazarPuente('areas_interes_exalumno', 'id_exalumno', userId,
    (d.areas || []).map((id) => ({ id_exalumno: userId, id_area_tematica: id })));
  await reemplazarPuente('sectores_exalumno', 'id_exalumno', userId,
    (d.sectores || []).map((id) => ({ id_exalumno: userId, id_sector: id })));
  await reemplazarPuente('carreras_usuario', 'id_usuario', userId,
    (d.carreras || []).map((id) => ({
      id_carrera: id,
      id_usuario: userId,
      id_sede: ID_SEDE_POR_DEFECTO,
      ano_graduacion: d.anio_graduacion,
    })));

  // 3. Espejo en user_metadata (mantiene el dashboard consistente).
  try {
    const meta = await leerMetadata(userId);
    await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...meta,
        escuela_facultad: d.escuela_facultad,
        anio_graduacion: d.anio_graduacion,
      },
    });
  } catch {
    /* no bloquea el guardado */
  }

  return obtenerPerfil(userId);
};

// Directorio público: solo exalumnos con perfil al 100%. No expone el monto de
// donación (privado: solo el propio exalumno y el admin).
const obtenerDirectorio = async () => {
  const [usuariosRes, infoRes, carrUsuRes, carrerasRes, facultadesRes, areasCat, areasExa, sectoresCat, sectoresExa] =
    await Promise.all([
      supabase.from('usuarios').select('id,nombre,id_rol,estado').eq('id_rol', 2).eq('estado', 'activo'),
      supabase.from('informacion_exalumno').select('*').eq('estado', true),
      supabase.from('carreras_usuario').select('id_usuario,id_carrera,ano_graduacion'),
      supabase.from('carreras').select('id,nombre,id_facultad'),
      supabase.from('facultades').select('id,nombre'),
      supabase.from('areas_interes').select('id,nombre'),
      supabase.from('areas_interes_exalumno').select('id_exalumno,id_area_tematica'),
      supabase.from('sectores').select('id,nombre'),
      supabase.from('sectores_exalumno').select('id_exalumno,id_sector'),
    ]);

  const carreraNombre = new Map((carrerasRes.data || []).map((c) => [c.id, c.nombre]));
  const carreraFacultad = new Map((carrerasRes.data || []).map((c) => [c.id, c.id_facultad]));
  const facultadNombre = new Map((facultadesRes.data || []).map((f) => [f.id, f.nombre]));
  const areaNombre = new Map((areasCat.data || []).map((a) => [a.id, a.nombre]));
  const sectorNombre = new Map((sectoresCat.data || []).map((s) => [s.id, s.nombre]));
  const infoPorUsuario = new Map((infoRes.data || []).map((i) => [i.id_usuario, i]));

  const carrerasPorUsuario = new Map();
  const anioPorUsuario = new Map();
  for (const cu of carrUsuRes.data || []) {
    if (!carrerasPorUsuario.has(cu.id_usuario)) carrerasPorUsuario.set(cu.id_usuario, []);
    carrerasPorUsuario.get(cu.id_usuario).push(cu.id_carrera);
    if (cu.ano_graduacion) anioPorUsuario.set(cu.id_usuario, cu.ano_graduacion);
  }
  const areasPorUsuario = new Map();
  for (const ae of areasExa.data || []) {
    if (!areasPorUsuario.has(ae.id_exalumno)) areasPorUsuario.set(ae.id_exalumno, []);
    areasPorUsuario.get(ae.id_exalumno).push(ae.id_area_tematica);
  }
  const sectoresPorUsuario = new Map();
  for (const se of sectoresExa.data || []) {
    if (!sectoresPorUsuario.has(se.id_exalumno)) sectoresPorUsuario.set(se.id_exalumno, []);
    sectoresPorUsuario.get(se.id_exalumno).push(se.id_sector);
  }

  const directorio = [];
  for (const u of usuariosRes.data || []) {
    const info = infoPorUsuario.get(u.id) || {};
    const carreras = carrerasPorUsuario.get(u.id) || [];
    const areas = areasPorUsuario.get(u.id) || [];
    const sectores = sectoresPorUsuario.get(u.id) || [];
    const meta = {}; // el directorio no necesita metadata para completitud base
    const infoComp = {
      ...info,
      anio_graduacion: anioPorUsuario.get(u.id),
      escuela_facultad: carreras.length > 0 ? 'ok' : null,
    };
    const { completo } = calcularCompletitud(infoComp, carreras, areas, sectores);
    if (!completo) continue; // RF-02: solo aparecen perfiles al 100%

    const facultades = [...new Set(carreras.map((c) => facultadNombre.get(carreraFacultad.get(c))).filter(Boolean))];
    directorio.push({
      id: u.id,
      nombre: u.nombre,
      foto_perfil: info.foto_perfil || null,
      pais: info.pais || '',
      ciudad: info.ciudad || '',
      anio_graduacion: anioPorUsuario.get(u.id) || null,
      carreras: carreras.map((c) => carreraNombre.get(c)).filter(Boolean),
      facultades,
      sectores: sectores.map((s) => sectorNombre.get(s)).filter(Boolean),
      areas: areas.map((a) => areaNombre.get(a)).filter(Boolean),
      apoyo: {
        mentoria: !!info.ofrece_mentoria,
        empleo: !!info.ofrece_empleo,
        pasantia: !!info.ofrece_pasantia,
        colaboracion: !!info.ofrece_colaboracion,
        donacion: !!info.ofrece_donacion,
      },
      // NOTA: monto_maximo_donacion y moneda NO se exponen (privados).
    });
  }
  return directorio;
};

module.exports = { obtenerCatalogos, obtenerPerfil, guardarPerfil, obtenerDirectorio };

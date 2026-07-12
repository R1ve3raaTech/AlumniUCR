/**
 * Seed del EXALUMNO DE DEMO "Gustavo Machado" — perfil COMPLETO (100%).
 *
 * A diferencia de seedExalumno.js (que solo crea el usuario base), este seed
 * deja el perfil al 100% reutilizando el mismo camino de guardado del backend
 * (perfilExalumno.service.guardarPerfil), de modo que Gustavo APARECE en el
 * directorio público y se ve completo en todas las pantallas de exalumno.
 *
 * Es idempotente: si el usuario ya existe, reasegura su contraseña y reescribe
 * su perfil. No toca a ningún otro usuario (no se solapa con Roberto Soto).
 *
 * La foto vive en el FE: public/images/gustavo-machado.jpg (ver FOTO).
 *
 * Uso:  node scripts/seedGustavoExalumno.js   (desde la carpeta BackEnd/)
 * Requiere SUPABASE_SECRET_KEY (service_role) en BackEnd/.env.local
 */
require('dotenv').config({ path: '.env.local' });
const supabase = require('../../config/supabase');
const { obtenerCatalogos, guardarPerfil } = require('../../services/perfil/perfilExalumno.service');

const GUSTAVO = {
  correo: 'gustavomachado@gmail.com',
  contrasena: 'Gustavo2026',
  nombre: 'Gustavo Machado',
};
const ID_ROL_EXALUMNO = 2;
const FOTO = '/images/gustavo-machado.png'; // archivo en FE public/images

// ─── Helpers de catálogo (elige por nombre, con respaldo) ──────────────────
const buscar = (lista, claves) => {
  for (const k of claves) {
    const m = lista.find((x) => (x.nombre || '').toLowerCase().includes(k));
    if (m) return m;
  }
  return lista[0] || null;
};
const buscarVarios = (lista, gruposDeClaves, max) => {
  const ids = [];
  for (const claves of gruposDeClaves) {
    const m = buscar(lista, claves);
    if (m && !ids.includes(m.id)) ids.push(m.id);
    if (ids.length >= max) break;
  }
  if (ids.length === 0 && lista[0]) ids.push(lista[0].id);
  return ids;
};

const buscarAuthUserPorCorreo = async (correo) => {
  const porPagina = 1000;
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: porPagina });
    if (error) throw error;
    const encontrado = data.users.find((u) => u.email === correo);
    if (encontrado) return encontrado;
    if (data.users.length < porPagina) return null;
  }
};

const seed = async () => {
  // 1. Usuario en Auth (idempotente).
  let authUser;
  const { data, error } = await supabase.auth.admin.createUser({
    email: GUSTAVO.correo,
    password: GUSTAVO.contrasena,
    email_confirm: true,
  });
  if (error) {
    if (!/already|registered|exists/i.test(error.message || '')) throw error;
    authUser = await buscarAuthUserPorCorreo(GUSTAVO.correo);
    if (!authUser) throw error;
    await supabase.auth.admin.updateUserById(authUser.id, {
      password: GUSTAVO.contrasena,
      email_confirm: true,
    });
    console.log('ℹ️  El usuario ya existía en Auth; se actualizó la contraseña.');
  } else {
    authUser = data.user;
    console.log('✅ Usuario creado en Supabase Auth.');
  }
  const userId = authUser.id;

  // 2. Perfil base en `usuarios` (rol exalumno, activo).
  const { error: perfilError } = await supabase.from('usuarios').upsert(
    {
      id: userId,
      nombre: GUSTAVO.nombre,
      correo_electronico: GUSTAVO.correo,
      id_rol: ID_ROL_EXALUMNO,
      confirmado: true,
      estado: 'activo',
    },
    { onConflict: 'id' },
  );
  if (perfilError) throw perfilError;

  // 3. Catálogos reales → elegir carrera/facultad/sectores/áreas por nombre.
  const cat = await obtenerCatalogos();
  const carrera = buscar(cat.carreras, ['computación', 'computacion', 'informática', 'informatica', 'software', 'sistemas', 'tecnolog']);
  if (!carrera) throw new Error('No hay carreras en el catálogo.');
  const facultad = (cat.facultades.find((f) => f.id === carrera.id_facultad) || {}).nombre || '';
  const sectores = buscarVarios(cat.sectores, [
    ['tecnolog', 'tic', 'software', 'informát', 'informat', 'telecom'],
    ['innovac', 'investigac', 'consultor'],
  ], 2);
  const areas = buscarVarios(cat.areas, [
    ['tecnolog', 'computac', 'software', 'digital'],
    ['inteligencia artificial', 'ciencia de datos', 'datos', 'innovac'],
    ['emprend', 'negocio'],
  ], 3);

  // 4. Datos completos del perfil (Gustavo: líder tecnológico, mentor activo).
  const d = {
    foto_perfil: FOTO,
    pais: 'Costa Rica',
    ciudad: 'San José',
    url_linkedin: 'https://www.linkedin.com/in/gustavo-machado',
    biografia:
      'Líder en tecnología con más de 15 años impulsando la transformación digital en Costa Rica y la región. Apasionado por la nube, el desarrollo de software y la inteligencia artificial aplicada. Como exalumno de la UCR, mi objetivo es devolver a la comunidad acompañando a la próxima generación de talento.',
    empresa: 'TechFlow Solutions',
    cargo: 'Director de Tecnología (CTO)',
    anos_experiencia: 15,
    ofrece_mentoria: true,
    horas_disponibles_mes: 8,
    ofrece_empleo: true,
    ofrece_pasantia: true,
    ofrece_colaboracion: true,
    ofrece_donacion: true,
    monto_maximo_donacion: 500,
    moneda: 'USD',
    areas,
    sectores,
    carreras: [carrera.id],
    anio_graduacion: 2008,
    escuela_facultad: facultad,
  };

  await guardarPerfil(userId, d);

  console.log('✅ Perfil de Gustavo Machado completado al 100%:', {
    id: userId,
    correo: GUSTAVO.correo,
    carrera: carrera.nombre,
    facultad,
    sectores: sectores.length,
    areas: areas.length,
    foto: FOTO,
  });
};

seed()
  .then(() => {
    console.log('🟢 Seed de Gustavo Machado completado.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('🔴 Error en el seed de Gustavo:', err.message);
    process.exit(1);
  });

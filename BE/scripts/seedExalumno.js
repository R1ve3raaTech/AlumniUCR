/**
 * Seed de usuario exalumno con credenciales fijas (datos comprobados).
 *
 * Crea (o reutiliza) el usuario en Supabase Auth y asegura su perfil en la
 * tabla `usuarios` con rol Exalumno (id_rol = 2). Es idempotente: si el usuario
 * ya existe en Auth, solo actualiza la contraseña y reasegura el perfil.
 *
 * Uso:   node scripts/seedExalumno.js   (ejecutar desde la carpeta BE/)
 * Requiere SUPABASE_SECRET_KEY (service_role) en BE/.env.local
 */
require('dotenv').config({ path: '.env.local' });
const supabase = require('../config/supabase');

const EXALUMNO = {
  correo: 'robertoso@gmail.com',
  contrasena: 'Robertos2026',
  nombre: 'Roberto Soto',
};
const ID_ROL_EXALUMNO = 2;

/**
 * Busca un usuario en Supabase Auth por correo paginando la lista
 * (el Admin API no permite filtrar por email directamente).
 */
const buscarAuthUserPorCorreo = async (correo) => {
  const porPagina = 1000;
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: porPagina });
    if (error) throw error;

    const encontrado = data.users.find((u) => u.email === correo);
    if (encontrado) return encontrado;
    if (data.users.length < porPagina) return null; // No hay más páginas
  }
};

const seedExalumno = async () => {
  // 1. Crear el usuario en Auth (o recuperarlo si ya existe).
  let authUser;
  const { data, error } = await supabase.auth.admin.createUser({
    email: EXALUMNO.correo,
    password: EXALUMNO.contrasena,
    email_confirm: true, // Confirma el correo sin enviar email
  });

  if (error) {
    const yaExiste = /already|registered|exists/i.test(error.message || '');
    if (!yaExiste) throw error;

    authUser = await buscarAuthUserPorCorreo(EXALUMNO.correo);
    if (!authUser) throw error;

    // Reasegura la contraseña y la confirmación del correo.
    await supabase.auth.admin.updateUserById(authUser.id, {
      password: EXALUMNO.contrasena,
      email_confirm: true,
    });
    console.log('ℹ️  El usuario ya existía en Auth; se actualizó la contraseña.');
  } else {
    authUser = data.user;
    console.log('✅ Usuario creado en Supabase Auth.');
  }

  // 2. Asegurar el perfil en `usuarios` con rol Exalumno (upsert por id).
  const { data: perfil, error: perfilError } = await supabase
    .from('usuarios')
    .upsert(
      {
        id: authUser.id,
        nombre: EXALUMNO.nombre,
        correo_electronico: EXALUMNO.correo,
        id_rol: ID_ROL_EXALUMNO,
        confirmado: true,
        estado: 'activo',
      },
      { onConflict: 'id' },
    )
    .select('*, roles(nombre)')
    .single();

  if (perfilError) throw perfilError;

  console.log('✅ Perfil de exalumno asegurado:', {
    id: perfil.id,
    correo: perfil.correo_electronico,
    rol: perfil.roles?.nombre,
  });
};

seedExalumno()
  .then(() => {
    console.log('🟢 Seed de exalumno completado.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('🔴 Error en el seed de exalumno:', err.message);
    process.exit(1);
  });

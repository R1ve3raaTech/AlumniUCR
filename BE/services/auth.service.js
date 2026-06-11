const supabase = require('../config/supabase');

// Mapa de rol (string del endpoint) -> id_rol en la tabla 'roles'
// (1 = Estudiante, 2 = Exalumno).
const ROLES = { estudiante: 1, exalumno: 2 };

const registerUser = async (correo, contrasena, rol) => {
  // 1. Registrar en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
  });
  if (authError) throw authError;

  // 2. Insertar el perfil en la tabla 'usuarios' usando el UUID de Auth.
  //    Las columnas reales son correo_electronico e id_rol (FK a 'roles').
  //    'nombre' es obligatorio: se inicializa con la parte local del correo
  //    y el usuario lo completa luego en su perfil. 'confirmado' y 'estado'
  //    se omiten porque la base de datos tiene valores por defecto.
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .insert([
      {
        id: authData.user.id, // Vincula con el Auth de Supabase
        nombre: correo.split('@')[0],
        correo_electronico: correo,
        id_rol: ROLES[rol] ?? ROLES.estudiante,
      },
    ])
    .select()
    .single();
  if (userError) throw userError;

  return { auth: authData.user, perfil: userData };
};

const loginUser = async (correo, contrasena) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });
  if (error) throw error;

  return {
    token: data.session.access_token,
    user: data.user,
  };
};

module.exports = { registerUser, loginUser };
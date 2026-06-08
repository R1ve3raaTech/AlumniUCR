const supabase = require('../config/supabase');

const registerUser = async (correo, contrasena, rol) => {
  // 1. Registrar en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
  });
  if (authError) throw authError;

  // 2. Insertar en tu tabla personalizada 'usuarios' usando el UUID generado
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .insert([
      {
        id: authData.user.id, // Vincula con el Auth de Supabase
        correo,
        rol,
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
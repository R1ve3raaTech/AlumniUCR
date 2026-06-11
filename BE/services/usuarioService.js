const supabase = require('../config/supabase');

const TABLA = 'usuarios';

// ======================================================
// OBTENER TODOS LOS USUARIOS
// ======================================================

const obtenerUsuarios = async () => {
    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw new Error(error.message);
    return data;
};

// ======================================================
// OBTENER USUARIO POR ID
// ======================================================

const obtenerUsuarioPorId = async (id) => {
    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// ======================================================
// CREAR USUARIO
// ======================================================

const crearUsuario = async (usuarioData) => {
    const nuevoUsuario = {
        nombre:              usuarioData.nombre,
        id_rol:              usuarioData.id_rol,
        correo_electronico:  usuarioData.correo_electronico,
        confirmado:          usuarioData.confirmado || false,
        estado:              usuarioData.estado || 'activo'
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoUsuario])
        .select();

    if (error) throw new Error(error.message);
    return data[0];
};

// ======================================================
// ACTUALIZAR USUARIO
// ======================================================

const actualizarUsuario = async (id, usuarioData) => {
    const { data, error } = await supabase
        .from(TABLA)
        .update(usuarioData)
        .eq('id', id)
        .select();

    if (error) throw new Error(error.message);
    return data[0];
};

// ======================================================
// ELIMINAR USUARIO
// ======================================================

const eliminarUsuario = async (id) => {
    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);
    return { mensaje: 'Usuario eliminado correctamente' };
};

// ======================================================
// BUSCAR USUARIOS POR NOMBRE
// ======================================================

const buscarUsuariosPorNombre = async (nombre) => {
    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('nombre', `%${nombre}%`);

    if (error) throw new Error(error.message);
    return data;
};

// ======================================================
// BUSCAR USUARIO POR CORREO
// ======================================================

const obtenerUsuarioPorCorreo = async (correoElectronico) => {
    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('correo_electronico', correoElectronico)
        .single();

    if (error) throw new Error(error.message);
    return data;
};

// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    buscarUsuariosPorNombre,
    obtenerUsuarioPorCorreo
};

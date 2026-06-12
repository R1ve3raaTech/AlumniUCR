const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'usuarios';

// ======================================================
// OBTENER TODOS LOS USUARIOS
// ======================================================

const obtenerUsuarios = async () => {
    const { data, error } = await supabase
        .from(TABLA)
        .select('*, roles(nombre)');

    if (error) throw mapDbError(error);
    return data;
};

// ======================================================
// OBTENER USUARIO POR ID
// ======================================================

const obtenerUsuarioPorId = async (id) => {
    const { data, error } = await supabase
        .from(TABLA)
        .select('*, roles(nombre)')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);
    return data; // null si no existe -> el controller responde 404
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
        .select()
        .single();

    if (error) throw mapDbError(error);
    return data;
};

// ======================================================
// ACTUALIZAR USUARIO
// ======================================================

const actualizarUsuario = async (id, usuarioData) => {
    const datosActualizar = { ...usuarioData, updated_at: new Date() };

    const { data, error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq('id', id)
        .select()
        .single();

    if (error) throw mapDbError(error);
    return data;
};

// ======================================================
// ELIMINAR USUARIO
// ======================================================

const eliminarUsuario = async (id) => {
    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);
    return { mensaje: 'Usuario eliminado correctamente' };
};

// ======================================================
// BUSCAR USUARIOS POR NOMBRE
// ======================================================

const buscarUsuariosPorNombre = async (nombre) => {
    const { data, error } = await supabase
        .from(TABLA)
        .select('*, roles(nombre)')
        .ilike('nombre', `%${nombre}%`);

    if (error) throw mapDbError(error);
    return data;
};

// ======================================================
// BUSCAR USUARIO POR CORREO
// ======================================================

const obtenerUsuarioPorCorreo = async (correoElectronico) => {
    const { data, error } = await supabase
        .from(TABLA)
        .select('*, roles(nombre)')
        .eq('correo_electronico', correoElectronico)
        .maybeSingle();

    if (error) throw mapDbError(error);
    return data; // null si no existe -> el controller responde 404
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

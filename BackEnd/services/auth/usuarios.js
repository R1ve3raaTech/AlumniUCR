const supabase = require('../../config/supabase');

const TABLA = 'usuarios';


// ======================================================
// OBTENER TODOS LOS USUARIOS
// ======================================================

const obtenerUsuarios = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER USUARIO POR ID
// ======================================================

const obtenerUsuarioPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('Id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// CREAR USUARIO
// ======================================================

const crearUsuario = async (usuarioData) => {

    const nuevoUsuario = {
        Nombre: usuarioData.Nombre,
        IdRol: usuarioData.IdRol,
        CorreoElectronico: usuarioData.CorreoElectronico,
        Contrasena: usuarioData.Contrasena,
        Confirmado: usuarioData.Confirmado,
        Estado: usuarioData.Estado
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoUsuario])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR USUARIO
// ======================================================

const actualizarUsuario = async (id, usuarioData) => {

    const datosActualizar = {
        ...usuarioData,
        UpdatedAt: new Date()
    };

    const { data, error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq('Id', id)
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ELIMINAR USUARIO
// ======================================================

const eliminarUsuario = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Usuario eliminado correctamente'
    };
};


// ======================================================
// BUSCAR USUARIOS POR NOMBRE
// ======================================================

const buscarUsuariosPorNombre = async (nombre) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('Nombre', `%${nombre}%`);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// BUSCAR USUARIO POR CORREO
// ======================================================

const obtenerUsuarioPorCorreo = async (correoElectronico) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('CorreoElectronico', correoElectronico)
        .single();

    if (error) {
        throw new Error(error.message);
    }

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
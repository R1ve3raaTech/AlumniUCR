const supabase = require('../config/supabase');

const TABLA = 'roles';


// ======================================================
// OBTENER TODOS LOS ROLES
// ======================================================

const obtenerRoles = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER ROL POR ID
// ======================================================

const obtenerRolPorId = async (id) => {

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
// CREAR ROL
// ======================================================

const crearRol = async (rolData) => {

    const nuevoRol = {
        Nombre: rolData.Nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoRol])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR ROL
// ======================================================

const actualizarRol = async (id, rolData) => {

    const datosActualizar = {
        ...rolData,
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
// ELIMINAR ROL
// ======================================================

const eliminarRol = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Rol eliminado correctamente'
    };
};


// ======================================================
// BUSCAR ROLES POR NOMBRE
// ======================================================

const buscarRolesPorNombre = async (nombre) => {

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
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerRoles,
    obtenerRolPorId,
    crearRol,
    actualizarRol,
    eliminarRol,
    buscarRolesPorNombre
};
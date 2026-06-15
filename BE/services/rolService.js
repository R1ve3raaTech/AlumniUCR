const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'roles';


// ======================================================
// OBTENER TODOS LOS ROLES
// ======================================================

const obtenerRoles = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER ROL POR ID
// ======================================================

const obtenerRolPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR ROL
// ======================================================

const crearRol = async (rolData) => {

    const nuevoRol = {
        nombre: rolData.nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoRol])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR ROL
// ======================================================

const actualizarRol = async (id, rolData) => {

    const datosActualizar = Object.assign({}, rolData, {
        updated_at: new Date()
    });

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
// ELIMINAR ROL
// ======================================================

const eliminarRol = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

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
        .ilike('nombre', `%${nombre}%`);

    if (error) throw mapDbError(error);

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

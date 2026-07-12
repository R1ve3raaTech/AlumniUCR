const supabase = require('../../config/supabase');

const TABLA = 'tipo_proyecto';


// ======================================================
// OBTENER TODOS LOS TIPOS DE PROYECTO
// ======================================================

const obtenerTiposProyecto = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER TIPO DE PROYECTO POR ID
// ======================================================

const obtenerTipoProyectoPorId = async (id) => {

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
// CREAR TIPO DE PROYECTO
// ======================================================

const crearTipoProyecto = async (tipoProyectoData) => {

    const nuevoTipoProyecto = {
        Nombre: tipoProyectoData.Nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoTipoProyecto])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR TIPO DE PROYECTO
// ======================================================

const actualizarTipoProyecto = async (id, tipoProyectoData) => {

    const datosActualizar = {
        ...tipoProyectoData,
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
// ELIMINAR TIPO DE PROYECTO
// ======================================================

const eliminarTipoProyecto = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Tipo de proyecto eliminado correctamente'
    };
};


// ======================================================
// BUSCAR TIPOS DE PROYECTO POR NOMBRE
// ======================================================

const buscarTiposProyectoPorNombre = async (nombre) => {

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
    obtenerTiposProyecto,
    obtenerTipoProyectoPorId,
    crearTipoProyecto,
    actualizarTipoProyecto,
    eliminarTipoProyecto,
    buscarTiposProyectoPorNombre
};
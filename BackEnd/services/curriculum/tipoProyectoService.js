const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'tipo_proyecto';


// ======================================================
// OBTENER TODOS LOS TIPOS DE PROYECTO
// ======================================================

const obtenerTiposProyecto = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER TIPO DE PROYECTO POR ID
// ======================================================

const obtenerTipoProyectoPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR TIPO DE PROYECTO
// ======================================================

const crearTipoProyecto = async (tipoProyectoData) => {

    const nuevoTipoProyecto = {
        nombre: tipoProyectoData.nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoTipoProyecto])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR TIPO DE PROYECTO
// ======================================================

const actualizarTipoProyecto = async (id, tipoProyectoData) => {

    const datosActualizar = Object.assign({}, tipoProyectoData, {
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
// ELIMINAR TIPO DE PROYECTO
// ======================================================

const eliminarTipoProyecto = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

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
        .ilike('nombre', `%${nombre}%`);

    if (error) throw mapDbError(error);

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

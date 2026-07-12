const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'beca_socioeconomica';


// ======================================================
// OBTENER TODAS LAS BECAS
// ======================================================

const obtenerBecasSocioeconomicas = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// OBTENER BECA POR ID
// ======================================================

const obtenerBecaSocioeconomicaPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// CREAR BECA
// ======================================================

const crearBecaSocioeconomica = async (becaData) => {

    const nuevaBeca = {
        nombre: becaData.nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaBeca])
        .select()
        .single();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// ACTUALIZAR BECA
// ======================================================

const actualizarBecaSocioeconomica = async (id, becaData) => {

    const datosActualizar = Object.assign({}, becaData, {
        updated_at: new Date()
    });

    const { data, error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// ELIMINAR BECA
// ======================================================

const eliminarBecaSocioeconomica = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) {
        throw mapDbError(error);
    }

    return {
        mensaje: 'Beca socioeconómica eliminada correctamente'
    };
};


// ======================================================
// BUSCAR BECA POR NOMBRE
// ======================================================

const buscarBecaPorNombre = async (nombre) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('nombre', `%${nombre}%`);

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerBecasSocioeconomicas,
    obtenerBecaSocioeconomicaPorId,
    crearBecaSocioeconomica,
    actualizarBecaSocioeconomica,
    eliminarBecaSocioeconomica,
    buscarBecaPorNombre
};

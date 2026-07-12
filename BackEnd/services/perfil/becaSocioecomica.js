const supabase = require('../../config/supabase');

const TABLA = 'beca_socioeconomica';


// ======================================================
// OBTENER TODAS LAS BECAS
// ======================================================

const obtenerBecasSocioeconomicas = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
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
        .eq('Id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// CREAR BECA
// ======================================================

const crearBecaSocioeconomica = async (becaData) => {

    const nuevaBeca = {
        Nombre: becaData.Nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaBeca])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR BECA
// ======================================================

const actualizarBecaSocioeconomica = async (id, becaData) => {

    const datosActualizar = {
        ...becaData,
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
// ELIMINAR BECA
// ======================================================

const eliminarBecaSocioeconomica = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
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
    obtenerBecasSocioeconomicas,
    obtenerBecaSocioeconomicaPorId,
    crearBecaSocioeconomica,
    actualizarBecaSocioeconomica,
    eliminarBecaSocioeconomica,
    buscarBecaPorNombre
};
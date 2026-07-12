const supabase = require('../../config/supabase');

const TABLA = 'tipo_pago';


// ======================================================
// OBTENER TODOS LOS TIPOS DE PAGO
// ======================================================

const obtenerTiposPago = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER TIPO DE PAGO POR ID
// ======================================================

const obtenerTipoPagoPorId = async (id) => {

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
// CREAR TIPO DE PAGO
// ======================================================

const crearTipoPago = async (tipoPagoData) => {

    const nuevoTipoPago = {
        Descripcion: tipoPagoData.Descripcion
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoTipoPago])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR TIPO DE PAGO
// ======================================================

const actualizarTipoPago = async (id, tipoPagoData) => {

    const datosActualizar = {
        ...tipoPagoData,
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
// ELIMINAR TIPO DE PAGO
// ======================================================

const eliminarTipoPago = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Tipo de pago eliminado correctamente'
    };
};


// ======================================================
// BUSCAR TIPOS DE PAGO POR DESCRIPCIÓN
// ======================================================

const buscarTiposPagoPorDescripcion = async (descripcion) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('Descripcion', `%${descripcion}%`);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerTiposPago,
    obtenerTipoPagoPorId,
    crearTipoPago,
    actualizarTipoPago,
    eliminarTipoPago,
    buscarTiposPagoPorDescripcion
};
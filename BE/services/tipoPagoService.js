const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'tipo_pago';


// ======================================================
// OBTENER TODOS LOS TIPOS DE PAGO
// ======================================================

const obtenerTiposPago = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER TIPO DE PAGO POR ID
// ======================================================

const obtenerTipoPagoPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR TIPO DE PAGO
// ======================================================

const crearTipoPago = async (tipoPagoData) => {

    const nuevoTipoPago = {
        descripcion: tipoPagoData.descripcion
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoTipoPago])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR TIPO DE PAGO
// ======================================================

const actualizarTipoPago = async (id, tipoPagoData) => {

    const datosActualizar = Object.assign({}, tipoPagoData, {
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
// ELIMINAR TIPO DE PAGO
// ======================================================

const eliminarTipoPago = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

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
        .ilike('descripcion', `%${descripcion}%`);

    if (error) throw mapDbError(error);

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

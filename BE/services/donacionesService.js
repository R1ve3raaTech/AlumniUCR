const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'donaciones';


// ======================================================
// OBTENER TODAS LAS DONACIONES
// ======================================================

const obtenerDonaciones = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER DONACIÓN POR ID
// ======================================================

const obtenerDonacionPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR DONACIÓN
// ======================================================

const crearDonacion = async (donacionData) => {

    const nuevaDonacion = {
        id_usuario_exalumno: donacionData.id_usuario_exalumno,
        id_tipo_pago: donacionData.id_tipo_pago,
        monto: donacionData.monto,
        id_proyecto: donacionData.id_proyecto,
        moneda: donacionData.moneda,
        fecha_hora_transferencia: donacionData.fecha_hora_transferencia,
        numero_referencia: donacionData.numero_referencia,
        comprobante: donacionData.comprobante,
        mensaje: donacionData.mensaje,
        estado: donacionData.estado
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaDonacion])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR DONACIÓN
// ======================================================

const actualizarDonacion = async (id, donacionData) => {

    const datosActualizar = Object.assign({}, donacionData, { updated_at: new Date() });

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
// ELIMINAR DONACIÓN
// ======================================================

const eliminarDonacion = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return {
        mensaje: 'Donación eliminada correctamente'
    };
};


// ======================================================
// OBTENER DONACIONES POR USUARIO
// ======================================================

const obtenerDonacionesPorUsuario = async (idUsuarioExalumno) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_usuario_exalumno', idUsuarioExalumno);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER DONACIONES POR PROYECTO
// ======================================================

const obtenerDonacionesPorProyecto = async (idProyecto) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_proyecto', idProyecto);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER DONACIONES POR ESTADO
// ======================================================

const obtenerDonacionesPorEstado = async (estado) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('estado', estado);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerDonaciones,
    obtenerDonacionPorId,
    crearDonacion,
    actualizarDonacion,
    eliminarDonacion,
    obtenerDonacionesPorUsuario,
    obtenerDonacionesPorProyecto,
    obtenerDonacionesPorEstado
};

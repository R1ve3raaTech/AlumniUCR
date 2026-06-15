const supabase = require('../config/supabase');

const TABLA = 'donaciones';


// ======================================================
// OBTENER TODAS LAS DONACIONES
// ======================================================

const obtenerDonaciones = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER DONACIÓN POR ID
// ======================================================

const obtenerDonacionPorId = async (id) => {

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
// CREAR DONACIÓN
// ======================================================

const crearDonacion = async (donacionData) => {

    const nuevaDonacion = {
        IdUsuarioExalumno: donacionData.IdUsuarioExalumno,
        IdTipoPago: donacionData.IdTipoPago,
        Monto: donacionData.Monto,
        IdProyecto: donacionData.IdProyecto,
        Moneda: donacionData.Moneda,
        FechaHoraTransferencia: donacionData.FechaHoraTransferencia,
        NumeroReferencia: donacionData.NumeroReferencia,
        Comprobante: donacionData.Comprobante,
        Mensaje: donacionData.Mensaje,
        Estado: donacionData.Estado
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaDonacion])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR DONACIÓN
// ======================================================

const actualizarDonacion = async (id, donacionData) => {

    const datosActualizar = {
        ...donacionData,
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
// ELIMINAR DONACIÓN
// ======================================================

const eliminarDonacion = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

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
        .eq('IdUsuarioExalumno', idUsuarioExalumno);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER DONACIONES POR PROYECTO
// ======================================================

const obtenerDonacionesPorProyecto = async (idProyecto) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('IdProyecto', idProyecto);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER DONACIONES POR ESTADO
// ======================================================

const obtenerDonacionesPorEstado = async (estado) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('Estado', estado);

    if (error) {
        throw new Error(error.message);
    }

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
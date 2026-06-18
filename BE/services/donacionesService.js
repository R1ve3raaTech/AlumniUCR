const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');
const {
    enviarCorreoNuevaDonacion,
    enviarCorreoConfirmacionDonacion,
    enviarCorreoRechazoDonacion,
} = require('./email.service');

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

    // RF-08: notificar al admin de nueva donación pendiente (no bloqueante)
    try {
        const [exalumnoRes, proyectoRes, tipoPagoRes] = await Promise.all([
            supabase.from('usuarios').select('nombre').eq('id', donacionData.id_usuario_exalumno).maybeSingle(),
            supabase.from('proyecto_graduacion').select('titulo_proyecto').eq('id', donacionData.id_proyecto).maybeSingle(),
            supabase.from('tipo_pago').select('descripcion').eq('id', donacionData.id_tipo_pago).maybeSingle(),
        ]);
        await enviarCorreoNuevaDonacion({
            nombre_exalumno: exalumnoRes.data?.nombre || 'Exalumno',
            monto: donacionData.monto,
            moneda: donacionData.moneda,
            metodo_pago: tipoPagoRes.data?.descripcion || 'No especificado',
            proyecto_titulo: proyectoRes.data?.titulo_proyecto || 'Fondo general',
        });
    } catch (emailErr) {
        console.warn('⚠️ No se pudo notificar al admin de la nueva donación:', emailErr.message);
    }

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
// CONFIRMAR DONACIÓN (admin) — RF-07
// ======================================================

const confirmarDonacion = async (id, idAdmin) => {

    // Leer donación con datos relacionados para el email
    const { data: donacion, error: errorLectura } = await supabase
        .from(TABLA)
        .select(`
            id, monto, moneda, mensaje, estado,
            id_usuario_exalumno,
            id_proyecto
        `)
        .eq('id', id)
        .maybeSingle();

    if (errorLectura) throw mapDbError(errorLectura);
    if (!donacion) { const err = new Error('Donación no encontrada'); err.statusCode = 404; throw err; }
    if (donacion.estado !== 'pendiente') { const err = new Error('Solo se pueden confirmar donaciones en estado pendiente'); err.statusCode = 400; throw err; }

    const { data, error } = await supabase
        .from(TABLA)
        .update({ estado: 'confirmada', confirmado_por: idAdmin, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw mapDbError(error);

    // RF-07: notificar al exalumno y al estudiante (no bloqueante)
    try {
        const [exalumnoRes, proyectoRes] = await Promise.all([
            supabase.from('usuarios').select('nombre, correo_electronico').eq('id', donacion.id_usuario_exalumno).maybeSingle(),
            supabase.from('proyecto_graduacion').select('titulo_proyecto, id_estudiante').eq('id', donacion.id_proyecto).maybeSingle(),
        ]);
        let estudianteRes = null;
        if (proyectoRes.data?.id_estudiante) {
            estudianteRes = await supabase.from('usuarios').select('nombre, correo_electronico').eq('id', proyectoRes.data.id_estudiante).maybeSingle();
        }
        if (exalumnoRes.data && estudianteRes?.data) {
            await enviarCorreoConfirmacionDonacion({
                correo_exalumno: exalumnoRes.data.correo_electronico,
                nombre_exalumno: exalumnoRes.data.nombre,
                correo_estudiante: estudianteRes.data.correo_electronico,
                nombre_estudiante: estudianteRes.data.nombre,
                monto: donacion.monto,
                moneda: donacion.moneda,
                proyecto_titulo: proyectoRes.data?.titulo_proyecto || 'Fondo general',
                mensaje: donacion.mensaje,
            });
        }
    } catch (emailErr) {
        console.warn('⚠️ No se pudieron enviar correos de confirmación de donación:', emailErr.message);
    }

    return data;
};


// ======================================================
// RECHAZAR DONACIÓN (admin) — RF-07
// ======================================================

const rechazarDonacion = async (id, idAdmin, motivo_rechazo) => {

    if (!motivo_rechazo) { const err = new Error('El motivo de rechazo es obligatorio'); err.statusCode = 400; throw err; }

    const { data: donacion, error: errorLectura } = await supabase
        .from(TABLA)
        .select('id, monto, moneda, estado, id_usuario_exalumno')
        .eq('id', id)
        .maybeSingle();

    if (errorLectura) throw mapDbError(errorLectura);
    if (!donacion) { const err = new Error('Donación no encontrada'); err.statusCode = 404; throw err; }
    if (donacion.estado !== 'pendiente') { const err = new Error('Solo se pueden rechazar donaciones en estado pendiente'); err.statusCode = 400; throw err; }

    const { data, error } = await supabase
        .from(TABLA)
        .update({ estado: 'rechazada', motivo_rechazo, confirmado_por: idAdmin, updated_at: new Date() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw mapDbError(error);

    // RF-07: notificar al exalumno con el motivo (no bloqueante)
    try {
        const { data: exalumno } = await supabase.from('usuarios').select('nombre, correo_electronico').eq('id', donacion.id_usuario_exalumno).maybeSingle();
        if (exalumno) {
            await enviarCorreoRechazoDonacion({
                correo_exalumno: exalumno.correo_electronico,
                nombre_exalumno: exalumno.nombre,
                monto: donacion.monto,
                moneda: donacion.moneda,
                motivo_rechazo,
            });
        }
    } catch (emailErr) {
        console.warn('⚠️ No se pudo enviar correo de rechazo de donación:', emailErr.message);
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
    obtenerDonacionesPorEstado,
    confirmarDonacion,
    rechazarDonacion,
};

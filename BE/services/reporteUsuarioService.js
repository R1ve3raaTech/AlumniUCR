const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');
const { enviarCorreoSuspensionAutomatica } = require('./email.service');

const TABLA = 'reportes_usuarios';
const LIMITE_REPORTES_SUSPENSION = 3;


// ======================================================
// OBTENER TODOS LOS REPORTES
// ======================================================

async function obtenerReportesUsuarios() {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER REPORTE POR ID
// ======================================================

async function obtenerReportePorId(id) {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR REPORTE — RF-09
// Al llegar a 3 reportes → suspensión automática + email admin
// ======================================================

async function crearReporteUsuario(reporteData) {

    const nuevoReporte = {
        id_usuario_reportado: reporteData.id_usuario_reportado,
        id_usuario_emisor: reporteData.id_usuario_emisor,
        motivo: reporteData.motivo,
        descripcion: reporteData.descripcion || null,
        resuelto: false,
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoReporte])
        .select()
        .single();

    if (error) throw mapDbError(error);

    // RF-09: contar reportes activos del usuario reportado
    const { count } = await supabase
        .from(TABLA)
        .select('id', { count: 'exact', head: true })
        .eq('id_usuario_reportado', reporteData.id_usuario_reportado)
        .eq('resuelto', false);

    // Si llega a 3 → suspender automáticamente
    if (count >= LIMITE_REPORTES_SUSPENSION) {
        const { data: usuarioSuspendido } = await supabase
            .from('usuarios')
            .update({ estado: 'suspendido', updated_at: new Date() })
            .eq('id', reporteData.id_usuario_reportado)
            .neq('estado', 'suspendido')
            .select('id, nombre, correo_electronico')
            .maybeSingle();

        if (usuarioSuspendido) {
            try {
                await enviarCorreoSuspensionAutomatica({
                    nombre_usuario: usuarioSuspendido.nombre,
                    correo_usuario: usuarioSuspendido.correo_electronico,
                    id_usuario: usuarioSuspendido.id,
                    cantidad_reportes: count,
                });
            } catch (emailErr) {
                console.warn('⚠️ No se pudo notificar al admin de la suspensión:', emailErr.message);
            }
        }
    }

    return { ...data, total_reportes: count };
};


// ======================================================
// ACTUALIZAR REPORTE
// ======================================================

async function actualizarReporteUsuario(id, reporteData) {

    const datosActualizar = Object.assign({}, reporteData, { updated_at: new Date() });

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
// ELIMINAR REPORTE
// ======================================================

async function eliminarReporteUsuario(id) {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return {
        mensaje: 'Reporte eliminado correctamente'
    };
};


// ======================================================
// OBTENER REPORTES POR USUARIO REPORTADO
// ======================================================

async function obtenerReportesPorUsuarioReportado(idUsuarioReportado) {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_usuario_reportado', idUsuarioReportado);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER REPORTES POR USUARIO EMISOR
// ======================================================

async function obtenerReportesPorUsuarioEmisor(idUsuarioEmisor) {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_usuario_emisor', idUsuarioEmisor);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// BUSCAR REPORTES POR MOTIVO
// ======================================================

async function buscarReportesPorMotivo(motivo) {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('motivo', `%${motivo}%`);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerReportesUsuarios,
    obtenerReportePorId,
    crearReporteUsuario,
    actualizarReporteUsuario,
    eliminarReporteUsuario,
    obtenerReportesPorUsuarioReportado,
    obtenerReportesPorUsuarioEmisor,
    buscarReportesPorMotivo,
    reactivarUsuario,
    eliminarUsuarioPermanente,
};

// ======================================================
// REACTIVAR PERFIL (admin) — RF-09
// ======================================================

async function reactivarUsuario(idUsuario) {
    await supabase
        .from(TABLA)
        .update({ resuelto: true })
        .eq('id_usuario_reportado', idUsuario)
        .eq('resuelto', false);

    const { data, error } = await supabase
        .from('usuarios')
        .update({ estado: 'activo', updated_at: new Date() })
        .eq('id', idUsuario)
        .select()
        .single();

    if (error) throw mapDbError(error);
    return data;
};


// ======================================================
// ELIMINAR PERFIL PERMANENTEMENTE (admin) — RF-09
// ======================================================

async function eliminarUsuarioPermanente(idUsuario) {
    await supabase
        .from(TABLA)
        .update({ resuelto: true })
        .eq('id_usuario_reportado', idUsuario);

    const { data, error } = await supabase
        .from('usuarios')
        .update({ estado: 'rechazado', updated_at: new Date() })
        .eq('id', idUsuario)
        .select()
        .single();

    if (error) throw mapDbError(error);
    return data;
};

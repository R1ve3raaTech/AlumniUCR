// Servicio del Panel de Administración (RF-08).
// Cubre:
//   RF-08.1 — Matches con alerta de seguimiento (> 6 meses activos)
//   RF-08.2 — Donaciones con recordatorio (> 48 horas pendientes)
//   RF-08.3 — Dashboard de impacto (métricas generales)

const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');
const { enviarCorreoNuevaDonacion } = require('./email.service');


// ======================================================
// RF-08.1 — MATCHES CON ALERTA DE SEGUIMIENTO (> 6 meses)
// ======================================================

const obtenerMatchesConAlerta = async (filtros = {}) => {

    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);

    let query = supabase
        .from('matches_mentoria')
        .select(`
            id, score_match, estado, iniciado_por, resultado,
            notas_admin, created_at, updated_at,
            exalumno:usuarios!matches_mentoria_id_exalumno_fkey (
                id, nombre, correo_electronico,
                carreras:carreras_usuario(carreras(nombre)),
                info:informacion_exalumno(ofrece_mentoria, ofrece_empleo, ofrece_pasantia, ofrece_donacion)
            ),
            estudiante:usuarios!matches_mentoria_id_estudiante_fkey (
                id, nombre, correo_electronico,
                carreras:carreras_usuario(carreras(nombre)),
                info:informacion_estudiante(busca_mentoria, busca_empleo, busca_pasantia, busca_financiamiento)
            )
        `)
        .order('created_at', { ascending: false });

    if (filtros.estado) query = query.eq('estado', filtros.estado);
    if (filtros.fecha_desde) query = query.gte('created_at', filtros.fecha_desde);
    if (filtros.fecha_hasta) query = query.lte('created_at', filtros.fecha_hasta);

    const { data, error } = await query;
    if (error) throw mapDbError(error);

    // RF-08.1: marcar matches activos con más de 6 meses
    return (data || []).map(match => ({
        ...match,
        alerta_seguimiento: match.estado === 'activo' &&
            new Date(match.updated_at) < seisMesesAtras,
    }));
};


// ======================================================
// RF-08.2 — DONACIONES CON RECORDATORIO (> 48 horas pendientes)
// ======================================================

const obtenerDonacionesPendientes = async () => {

    const cuarentaYOchoHorasAtras = new Date();
    cuarentaYOchoHorasAtras.setHours(cuarentaYOchoHorasAtras.getHours() - 48);

    const { data, error } = await supabase
        .from('donaciones')
        .select(`
            id, monto, moneda, estado, created_at,
            comprobante, numero_referencia,
            usuarios!donaciones_id_usuario_exalumno_fkey (id, nombre, correo_electronico),
            proyecto_graduacion!donaciones_id_proyecto_fkey (id, titulo_proyecto),
            tipo_pago!donaciones_id_tipo_pago_fkey (descripcion)
        `)
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: true });

    if (error) throw mapDbError(error);

    return (data || []).map(d => ({
        ...d,
        alerta_48h: new Date(d.created_at) < cuarentaYOchoHorasAtras,
    }));
};


// RF-08.2: enviar recordatorio al admin de donaciones pendientes > 48h
const enviarRecordatorioDonacionesPendientes = async () => {

    const donaciones = await obtenerDonacionesPendientes();
    const vencidas = donaciones.filter(d => d.alerta_48h);

    if (!vencidas.length) return { recordatorios: 0 };

    let enviados = 0;
    for (const d of vencidas) {
        try {
            await enviarCorreoNuevaDonacion({
                nombre_exalumno: d.usuarios?.nombre || 'Exalumno',
                monto: d.monto,
                moneda: d.moneda,
                metodo_pago: d.tipo_pago?.descripcion || 'No especificado',
                proyecto_titulo: d.proyecto_graduacion?.titulo_proyecto || 'Fondo general',
            });
            enviados++;
        } catch (e) {
            console.warn(`⚠️ No se pudo enviar recordatorio para donación ${d.id}:`, e.message);
        }
    }

    return { recordatorios: enviados, total_vencidas: vencidas.length };
};


// ======================================================
// RF-08.3 — DASHBOARD DE IMPACTO (métricas generales)
// ======================================================

const obtenerDashboard = async () => {

    const [
        totalDonaciones,
        proyectosApoyados,
        matchesActivos,
        usuariosActivos,
        distribucionCarreras,
        distribucionSedes,
        donantesTotal,
    ] = await Promise.all([

        // Total donado (solo confirmadas)
        supabase.from('donaciones')
            .select('monto, moneda')
            .eq('estado', 'confirmada'),

        // Proyectos que recibieron al menos una donación confirmada
        supabase.from('donaciones')
            .select('id_proyecto')
            .eq('estado', 'confirmada'),

        // Matches activos
        supabase.from('matches_mentoria')
            .select('id', { count: 'exact', head: true })
            .eq('estado', 'activo'),

        // Usuarios activos por rol
        supabase.from('usuarios')
            .select('id_rol')
            .eq('estado', 'activo'),

        // Distribución por carrera
        supabase.from('carreras_usuario')
            .select('id_carrera, carreras(nombre)'),

        // Distribución por sede
        supabase.from('carreras_usuario')
            .select('id_sede, sedes_ucr(nombre)'),

        // Donantes (exalumnos que han donado)
        supabase.from('donaciones')
            .select('id_usuario_exalumno')
            .eq('estado', 'confirmada'),
    ]);

    // Calcular total donado por moneda
    const totalPorMoneda = {};
    (totalDonaciones.data || []).forEach(d => {
        if (!totalPorMoneda[d.moneda]) totalPorMoneda[d.moneda] = 0;
        totalPorMoneda[d.moneda] += d.monto;
    });

    // Proyectos únicos apoyados
    const proyectosUnicos = new Set((proyectosApoyados.data || []).map(d => d.id_proyecto));

    // Usuarios activos por rol
    const estudiantesActivos = (usuariosActivos.data || []).filter(u => u.id_rol === 1).length;
    const exalumnosActivos = (usuariosActivos.data || []).filter(u => u.id_rol === 2).length;

    // Distribución por carrera (top 10)
    const conteoCarreras = {};
    (distribucionCarreras.data || []).forEach(c => {
        const nombre = c.carreras?.nombre || 'Desconocida';
        conteoCarreras[nombre] = (conteoCarreras[nombre] || 0) + 1;
    });
    const topCarreras = Object.entries(conteoCarreras)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([carrera, cantidad]) => ({ carrera, cantidad }));

    // Distribución por sede
    const conteoSedes = {};
    (distribucionSedes.data || []).forEach(s => {
        const nombre = s.sedes_ucr?.nombre || 'Desconocida';
        conteoSedes[nombre] = (conteoSedes[nombre] || 0) + 1;
    });
    const distribucionPorSede = Object.entries(conteoSedes)
        .sort((a, b) => b[1] - a[1])
        .map(([sede, cantidad]) => ({ sede, cantidad }));

    // Donantes nuevos vs recurrentes
    const conteoDonantesPorId = {};
    (donantesTotal.data || []).forEach(d => {
        conteoDonantesPorId[d.id_usuario_exalumno] = (conteoDonantesPorId[d.id_usuario_exalumno] || 0) + 1;
    });
    const donantesNuevos = Object.values(conteoDonantesPorId).filter(v => v === 1).length;
    const donantesRecurrentes = Object.values(conteoDonantesPorId).filter(v => v > 1).length;

    return {
        donaciones: {
            total_por_moneda: totalPorMoneda,
            proyectos_apoyados: proyectosUnicos.size,
            donantes_nuevos: donantesNuevos,
            donantes_recurrentes: donantesRecurrentes,
        },
        matches: {
            activos: matchesActivos.count || 0,
        },
        usuarios: {
            estudiantes_activos: estudiantesActivos,
            exalumnos_activos: exalumnosActivos,
        },
        distribucion_carreras: topCarreras,
        distribucion_sedes: distribucionPorSede,
    };
};


// ======================================================
// EXPORTAR
// ======================================================

module.exports = {
    obtenerMatchesConAlerta,
    obtenerDonacionesPendientes,
    enviarRecordatorioDonacionesPendientes,
    obtenerDashboard,
};

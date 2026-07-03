// Estadísticas públicas del landing (sin autenticación, sin datos financieros).
// Reutiliza las mismas tablas que el dashboard de admin (RF-08.3) pero solo
// expone conteos agregados no sensibles.

const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const obtenerEstadisticasPublicas = async () => {

    const [matchesRes, exalumnosRes, proyectosRes] = await Promise.all([

        // Todos los matches generados (estado + resultado, para calcular % de éxito)
        supabase.from('matches_mentoria').select('estado, resultado'),

        // Exalumnos activos (mentores potenciales)
        supabase.from('usuarios').select('id', { count: 'exact', head: true })
            .eq('id_rol', 2)
            .eq('estado', 'activo'),

        // Proyectos de graduación registrados
        supabase.from('proyecto_graduacion').select('id', { count: 'exact', head: true }),
    ]);

    if (matchesRes.error) throw mapDbError(matchesRes.error);
    if (exalumnosRes.error) throw mapDbError(exalumnosRes.error);
    if (proyectosRes.error) throw mapDbError(proyectosRes.error);

    const matches = matchesRes.data || [];
    const totalMatches = matches.length;
    const matchesExitosos = matches.filter(
        (m) => m.estado === 'activo' || (m.estado === 'cerrado' && m.resultado !== 'cancelado')
    ).length;
    const porcentajeExito = totalMatches > 0 ? Math.round((matchesExitosos / totalMatches) * 100) : 0;

    return {
        conexiones: totalMatches,
        porcentaje_exito: porcentajeExito,
        mentores: exalumnosRes.count || 0,
        proyectos_activos: proyectosRes.count || 0,
    };
};

module.exports = { obtenerEstadisticasPublicas };

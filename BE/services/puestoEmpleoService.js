const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');
const matchesPosicionesService = require('./matchesPosicionesService');

const TABLA = 'puestos_empleo';


// ======================================================
// OBTENER TODOS LOS PUESTOS DE EMPLEO
// ======================================================

const obtenerPuestosEmpleo = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER PUESTO POR ID
// ======================================================

const obtenerPuestoEmpleoPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR PUESTO DE EMPLEO
// ======================================================

const crearPuestoEmpleo = async (puestoData) => {

    const nuevoPuesto = {
        id_usuario: puestoData.id_usuario,
        titulo_puesto: puestoData.titulo_puesto,
        tipo: puestoData.tipo,
        modalidad: puestoData.modalidad,
        jornada: puestoData.jornada,
        lugar_trabajo: puestoData.lugar_trabajo,
        empresa: puestoData.empresa,
        fecha_limite: puestoData.fecha_limite,
        habilidades: puestoData.habilidades,
        descripcion: puestoData.descripcion,
        contexto: puestoData.contexto,
        estado: puestoData.estado,
        pausada: puestoData.pausada,
        eliminada: puestoData.eliminada
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoPuesto])
        .select()
        .single();

    if (error) throw mapDbError(error);

    // RF-10: guardar áreas de interés si se enviaron
    if (puestoData.areas_interes && puestoData.areas_interes.length > 0) {
        const areasAInsertar = puestoData.areas_interes.map(idArea => ({
            id_empleo: data.id,
            id_area_tematica: idArea,
        }));
        await supabase.from('areas_interes_empleo').insert(areasAInsertar);
    }

    // RF-10: generar matches con estudiantes al publicar posición (no bloqueante)
    try {
        const { data: estudiantes } = await supabase
            .from('informacion_estudiante')
            .select('id_usuario')
            .eq('perfil_completo', true)
            .eq('pausado', false);

        if (estudiantes?.length) {
            await Promise.all(
                estudiantes.map(e =>
                    matchesPosicionesService.generarMatchesPosicionesPorEstudiante(e.id_usuario)
                        .catch(err => console.warn(`⚠️ Match posición fallido para ${e.id_usuario}:`, err.message))
                )
            );
        }
    } catch (matchErr) {
        console.warn('⚠️ No se pudieron generar matches al publicar posición:', matchErr.message);
    }

    return data;
};


// ======================================================
// ACTUALIZAR PUESTO DE EMPLEO
// ======================================================

const actualizarPuestoEmpleo = async (id, puestoData) => {

    const datosActualizar = Object.assign({}, puestoData, { updated_at: new Date() });

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
// ELIMINAR PUESTO DE EMPLEO
// ======================================================

const eliminarPuestoEmpleo = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return {
        mensaje: 'Puesto de empleo eliminado correctamente'
    };
};


// ======================================================
// OBTENER PUESTOS POR USUARIO
// ======================================================

const obtenerPuestosPorUsuario = async (idUsuario) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_usuario', idUsuario);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER PUESTOS ACTIVOS
// ======================================================

const obtenerPuestosActivos = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('estado', 'activo')
        .eq('pausada', false)
        .eq('eliminada', false)
        .or('fecha_limite.is.null,fecha_limite.gte.' + new Date().toISOString().split('T')[0]);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// BUSCAR PUESTOS POR EMPRESA
// ======================================================

const buscarPuestosPorEmpresa = async (empresa) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('empresa', `%${empresa}%`);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// BUSCAR PUESTOS POR TÍTULO
// ======================================================

const buscarPuestosPorTitulo = async (titulo) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('titulo_puesto', `%${titulo}%`);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerPuestosEmpleo,
    obtenerPuestoEmpleoPorId,
    crearPuestoEmpleo,
    actualizarPuestoEmpleo,
    eliminarPuestoEmpleo,
    obtenerPuestosPorUsuario,
    obtenerPuestosActivos,
    buscarPuestosPorEmpresa,
    buscarPuestosPorTitulo,
    cerrarPosicionesVencidas,
};

// ======================================================
// RF-10: CIERRE AUTOMÁTICO DE POSICIONES VENCIDAS
// Llamar desde un endpoint admin o cron periódico
// ======================================================

const cerrarPosicionesVencidas = async () => {

    const hoy = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
        .from(TABLA)
        .update({ estado: 'cerrada', updated_at: new Date() })
        .eq('estado', 'activo')
        .eq('eliminada', false)
        .lt('fecha_limite', hoy)
        .not('fecha_limite', 'is', null)
        .select('id, titulo_puesto, empresa, fecha_limite');

    if (error) throw mapDbError(error);

    console.log(`🔒 Posiciones cerradas automáticamente: ${data?.length || 0}`);
    return { cerradas: data?.length || 0, posiciones: data || [] };
};

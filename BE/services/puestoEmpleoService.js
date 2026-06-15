const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

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
        .eq('estado', true)
        .eq('pausada', false)
        .eq('eliminada', false);

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
    buscarPuestosPorTitulo
};

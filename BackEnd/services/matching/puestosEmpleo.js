const supabase = require('../../config/supabase');

const TABLA = 'puestos_empleo';


// ======================================================
// OBTENER TODOS LOS PUESTOS DE EMPLEO
// ======================================================

const obtenerPuestosEmpleo = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER PUESTO POR ID
// ======================================================

const obtenerPuestoEmpleoPorId = async (id) => {

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
// CREAR PUESTO DE EMPLEO
// ======================================================

const crearPuestoEmpleo = async (puestoData) => {

    const nuevoPuesto = {
        IdUsuario: puestoData.IdUsuario,
        TituloPuesto: puestoData.TituloPuesto,
        Tipo: puestoData.Tipo,
        Modalidad: puestoData.Modalidad,
        Jornada: puestoData.Jornada,
        LugarTrabajo: puestoData.LugarTrabajo,
        Empresa: puestoData.Empresa,
        FechaLimite: puestoData.FechaLimite,
        Habilidades: puestoData.Habilidades,
        Descripcion: puestoData.Descripcion,
        Contexto: puestoData.Contexto,
        Estado: puestoData.Estado,
        Pausada: puestoData.Pausada,
        Eliminada: puestoData.Eliminada
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoPuesto])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR PUESTO DE EMPLEO
// ======================================================

const actualizarPuestoEmpleo = async (id, puestoData) => {

    const datosActualizar = {
        ...puestoData,
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
// ELIMINAR PUESTO DE EMPLEO
// ======================================================

const eliminarPuestoEmpleo = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

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
        .eq('IdUsuario', idUsuario);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER PUESTOS ACTIVOS
// ======================================================

const obtenerPuestosActivos = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('Estado', true)
        .eq('Pausada', false)
        .eq('Eliminada', false);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// BUSCAR PUESTOS POR EMPRESA
// ======================================================

const buscarPuestosPorEmpresa = async (empresa) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('Empresa', `%${empresa}%`);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// BUSCAR PUESTOS POR TÍTULO
// ======================================================

const buscarPuestosPorTitulo = async (titulo) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('TituloPuesto', `%${titulo}%`);

    if (error) {
        throw new Error(error.message);
    }

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
const supabase = require('../config/supabase');

const TABLA = 'sectores_empleo';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerSectoresEmpleo = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerSectorEmpleoPorId = async (id) => {

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
// CREAR RELACIÓN
// ======================================================

const crearSectorEmpleo = async (relacionData) => {

    const nuevaRelacion = {
        IdEmpleo: relacionData.IdEmpleo,
        IdSector: relacionData.IdSector
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaRelacion])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarSectorEmpleo = async (id, relacionData) => {

    const datosActualizar = {
        ...relacionData,
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
// ELIMINAR RELACIÓN
// ======================================================

const eliminarSectorEmpleo = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Relación eliminada correctamente'
    };
};


// ======================================================
// OBTENER SECTORES POR EMPLEO
// ======================================================

const obtenerSectoresPorEmpleo = async (idEmpleo) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('IdEmpleo', idEmpleo);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER EMPLEOS POR SECTOR
// ======================================================

const obtenerEmpleosPorSector = async (idSector) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('IdSector', idSector);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerSectoresEmpleo,
    obtenerSectorEmpleoPorId,
    crearSectorEmpleo,
    actualizarSectorEmpleo,
    eliminarSectorEmpleo,
    obtenerSectoresPorEmpleo,
    obtenerEmpleosPorSector
};
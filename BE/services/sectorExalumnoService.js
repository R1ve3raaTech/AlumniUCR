const supabase = require('../config/supabase');

const TABLA = 'sectores_exalumno';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerSectoresExalumno = async () => {

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

const obtenerSectorExalumnoPorId = async (id) => {

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

const crearSectorExalumno = async (relacionData) => {

    const nuevaRelacion = {
        IdExalumno: relacionData.IdExalumno,
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

const actualizarSectorExalumno = async (id, relacionData) => {

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

const eliminarSectorExalumno = async (id) => {

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
// OBTENER SECTORES POR EXALUMNO
// ======================================================

const obtenerSectoresPorExalumno = async (idExalumno) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('IdExalumno', idExalumno);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER EXALUMNOS POR SECTOR
// ======================================================

const obtenerExalumnosPorSector = async (idSector) => {

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
    obtenerSectoresExalumno,
    obtenerSectorExalumnoPorId,
    crearSectorExalumno,
    actualizarSectorExalumno,
    eliminarSectorExalumno,
    obtenerSectoresPorExalumno,
    obtenerExalumnosPorSector
};
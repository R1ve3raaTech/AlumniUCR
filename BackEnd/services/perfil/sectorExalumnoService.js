const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'sectores_exalumno';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerSectoresExalumno = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw mapDbError(error);
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
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearSectorExalumno = async (relacionData) => {

    const nuevaRelacion = {
        id_exalumno: relacionData.id_exalumno,
        id_sector: relacionData.id_sector
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaRelacion])
        .select()
        .single();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarSectorExalumno = async (id, relacionData) => {

    const datosActualizar = Object.assign({}, relacionData, {
        updated_at: new Date()
    });

    const { data, error } = await supabase
        .from(TABLA)
        .update(datosActualizar)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// ELIMINAR RELACIÓN
// ======================================================

const eliminarSectorExalumno = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) {
        throw mapDbError(error);
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
        .eq('id_exalumno', idExalumno);

    if (error) {
        throw mapDbError(error);
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
        .eq('id_sector', idSector);

    if (error) {
        throw mapDbError(error);
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

const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'sectores_empleo';


// ======================================================
// OBTENER TODAS LAS RELACIONES
// ======================================================

const obtenerSectoresEmpleo = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER RELACIÓN POR ID
// ======================================================

const obtenerSectorEmpleoPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR RELACIÓN
// ======================================================

const crearSectorEmpleo = async (relacionData) => {

    const nuevaRelacion = {
        id_empleo: relacionData.id_empleo,
        id_sector: relacionData.id_sector
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaRelacion])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR RELACIÓN
// ======================================================

const actualizarSectorEmpleo = async (id, relacionData) => {

    const datosActualizar = Object.assign({}, relacionData, { updated_at: new Date() });

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
// ELIMINAR RELACIÓN
// ======================================================

const eliminarSectorEmpleo = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

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
        .eq('id_empleo', idEmpleo);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER EMPLEOS POR SECTOR
// ======================================================

const obtenerEmpleosPorSector = async (idSector) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id_sector', idSector);

    if (error) throw mapDbError(error);

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

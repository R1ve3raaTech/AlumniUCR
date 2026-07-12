const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'sedes_ucr';


// ======================================================
// OBTENER TODAS LAS SEDES UCR
// ======================================================

const obtenerSedesUCR = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER SEDE POR ID
// ======================================================

const obtenerSedeUCRPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR SEDE
// ======================================================

const crearSedeUCR = async (sedeData) => {

    const nuevaSede = {
        nombre: sedeData.nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaSede])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR SEDE
// ======================================================

const actualizarSedeUCR = async (id, sedeData) => {

    const datosActualizar = Object.assign({}, sedeData, {
        updated_at: new Date()
    });

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
// ELIMINAR SEDE
// ======================================================

const eliminarSedeUCR = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

    return {
        mensaje: 'Sede UCR eliminada correctamente'
    };
};


// ======================================================
// BUSCAR SEDES POR NOMBRE
// ======================================================

const buscarSedesPorNombre = async (nombre) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .ilike('nombre', `%${nombre}%`);

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// EXPORTAR SERVICES
// ======================================================

module.exports = {
    obtenerSedesUCR,
    obtenerSedeUCRPorId,
    crearSedeUCR,
    actualizarSedeUCR,
    eliminarSedeUCR,
    buscarSedesPorNombre
};

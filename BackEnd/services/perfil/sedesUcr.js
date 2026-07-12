const supabase = require('../../config/supabase');

const TABLA = 'sedes_ucr';


// ======================================================
// OBTENER TODAS LAS SEDES UCR
// ======================================================

const obtenerSedesUCR = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER SEDE POR ID
// ======================================================

const obtenerSedeUCRPorId = async (id) => {

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
// CREAR SEDE
// ======================================================

const crearSedeUCR = async (sedeData) => {

    const nuevaSede = {
        Nombre: sedeData.Nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaSede])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR SEDE
// ======================================================

const actualizarSedeUCR = async (id, sedeData) => {

    const datosActualizar = {
        ...sedeData,
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
// ELIMINAR SEDE
// ======================================================

const eliminarSedeUCR = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

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
        .ilike('Nombre', `%${nombre}%`);

    if (error) {
        throw new Error(error.message);
    }

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
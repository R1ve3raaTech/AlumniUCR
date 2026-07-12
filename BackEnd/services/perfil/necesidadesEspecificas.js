const supabase = require('../../config/supabase');

const TABLA = 'necesidades_especificas';


// ======================================================
// OBTENER TODAS LAS NECESIDADES ESPECÍFICAS
// ======================================================

const obtenerNecesidadesEspecificas = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER NECESIDAD ESPECÍFICA POR ID
// ======================================================

const obtenerNecesidadEspecificaPorId = async (id) => {

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
// CREAR NECESIDAD ESPECÍFICA
// ======================================================

const crearNecesidadEspecifica = async (necesidadData) => {

    const nuevaNecesidad = {
        Nombre: necesidadData.Nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaNecesidad])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR NECESIDAD ESPECÍFICA
// ======================================================

const actualizarNecesidadEspecifica = async (id, necesidadData) => {

    const datosActualizar = {
        ...necesidadData,
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
// ELIMINAR NECESIDAD ESPECÍFICA
// ======================================================

const eliminarNecesidadEspecifica = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Necesidad específica eliminada correctamente'
    };
};


// ======================================================
// BUSCAR NECESIDADES POR NOMBRE
// ======================================================

const buscarNecesidadesPorNombre = async (nombre) => {

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
    obtenerNecesidadesEspecificas,
    obtenerNecesidadEspecificaPorId,
    crearNecesidadEspecifica,
    actualizarNecesidadEspecifica,
    eliminarNecesidadEspecifica,
    buscarNecesidadesPorNombre
};
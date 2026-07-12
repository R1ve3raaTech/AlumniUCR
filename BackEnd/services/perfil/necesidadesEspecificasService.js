const supabase = require('../../config/supabase');
const { mapDbError } = require('../../utils/dbError');

const TABLA = 'necesidades_especificas';


// ======================================================
// OBTENER TODAS LAS NECESIDADES ESPECÍFICAS
// ======================================================

const obtenerNecesidadesEspecificas = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw mapDbError(error);
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
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// CREAR NECESIDAD ESPECÍFICA
// ======================================================

const crearNecesidadEspecifica = async (necesidadData) => {

    const nuevaNecesidad = {
        nombre: necesidadData.nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevaNecesidad])
        .select()
        .single();

    if (error) {
        throw mapDbError(error);
    }

    return data;
};


// ======================================================
// ACTUALIZAR NECESIDAD ESPECÍFICA
// ======================================================

const actualizarNecesidadEspecifica = async (id, necesidadData) => {

    const datosActualizar = Object.assign({}, necesidadData, { updated_at: new Date() });

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
// ELIMINAR NECESIDAD ESPECÍFICA
// ======================================================

const eliminarNecesidadEspecifica = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) {
        throw mapDbError(error);
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
        .ilike('nombre', `%${nombre}%`);

    if (error) {
        throw mapDbError(error);
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

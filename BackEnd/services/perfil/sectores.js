const supabase = require('../../config/supabase');

const TABLA = 'sectores';


// ======================================================
// OBTENER TODOS LOS SECTORES
// ======================================================

const obtenerSectores = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
};


// ======================================================
// OBTENER SECTOR POR ID
// ======================================================

const obtenerSectorPorId = async (id) => {

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
// CREAR SECTOR
// ======================================================

const crearSector = async (sectorData) => {

    const nuevoSector = {
        Nombre: sectorData.Nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoSector])
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data[0];
};


// ======================================================
// ACTUALIZAR SECTOR
// ======================================================

const actualizarSector = async (id, sectorData) => {

    const datosActualizar = {
        ...sectorData,
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
// ELIMINAR SECTOR
// ======================================================

const eliminarSector = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('Id', id);

    if (error) {
        throw new Error(error.message);
    }

    return {
        mensaje: 'Sector eliminado correctamente'
    };
};


// ======================================================
// BUSCAR SECTORES POR NOMBRE
// ======================================================

const buscarSectoresPorNombre = async (nombre) => {

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
    obtenerSectores,
    obtenerSectorPorId,
    crearSector,
    actualizarSector,
    eliminarSector,
    buscarSectoresPorNombre
};
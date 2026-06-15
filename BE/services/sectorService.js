const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

const TABLA = 'sectores';


// ======================================================
// OBTENER TODOS LOS SECTORES
// ======================================================

const obtenerSectores = async () => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*');

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// OBTENER SECTOR POR ID
// ======================================================

const obtenerSectorPorId = async (id) => {

    const { data, error } = await supabase
        .from(TABLA)
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// CREAR SECTOR
// ======================================================

const crearSector = async (sectorData) => {

    const nuevoSector = {
        nombre: sectorData.nombre
    };

    const { data, error } = await supabase
        .from(TABLA)
        .insert([nuevoSector])
        .select()
        .single();

    if (error) throw mapDbError(error);

    return data;
};


// ======================================================
// ACTUALIZAR SECTOR
// ======================================================

const actualizarSector = async (id, sectorData) => {

    const datosActualizar = Object.assign({}, sectorData, {
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
// ELIMINAR SECTOR
// ======================================================

const eliminarSector = async (id) => {

    const { error } = await supabase
        .from(TABLA)
        .delete()
        .eq('id', id);

    if (error) throw mapDbError(error);

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
        .ilike('nombre', `%${nombre}%`);

    if (error) throw mapDbError(error);

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

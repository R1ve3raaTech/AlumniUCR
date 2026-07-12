const sedeUCRService = require('../../services/perfil/sedeUCRService');

// ======================================================
// OBTENER TODAS LAS SEDES UCR
// ======================================================

const obtenerSedesUCR = async (req, res, next) => {
    try {
        const sedes = await sedeUCRService.obtenerSedesUCR();

        res.status(200).json({
            success: true,
            data: sedes,
            message: 'Sedes UCR obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER SEDE POR ID
// ======================================================

const obtenerSedeUCRPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const sede = await sedeUCRService.obtenerSedeUCRPorId(id);

        if (!sede) {
            return res.status(404).json({
                success: false,
                message: 'Sede UCR no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: sede,
            message: 'Sede UCR obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR SEDE
// ======================================================

const crearSedeUCR = async (req, res, next) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const nuevaSede = await sedeUCRService.crearSedeUCR({
            nombre: nombre.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevaSede,
            message: 'Sede UCR creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR SEDE
// ======================================================

const actualizarSedeUCR = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const sedeActualizada = await sedeUCRService.actualizarSedeUCR(
            id,
            { nombre: nombre.trim() }
        );

        if (!sedeActualizada) {
            return res.status(404).json({
                success: false,
                message: 'Sede UCR no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: sedeActualizada,
            message: 'Sede UCR actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ELIMINAR SEDE
// ======================================================

const eliminarSedeUCR = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resultado = await sedeUCRService.eliminarSedeUCR(id);

        res.status(200).json({
            success: true,
            data: resultado,
            message: 'Sede UCR eliminada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// BUSCAR SEDES POR NOMBRE
// ======================================================

const buscarSedesPorNombre = async (req, res, next) => {
    try {
        const { nombre } = req.params;

        const sedes = await sedeUCRService.buscarSedesPorNombre(nombre);

        res.status(200).json({
            success: true,
            data: sedes,
            message: 'Búsqueda de sedes UCR realizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerSedesUCR,
    obtenerSedeUCRPorId,
    crearSedeUCR,
    actualizarSedeUCR,
    eliminarSedeUCR,
    buscarSedesPorNombre
};

const becaSocioeconomicaService = require('../services/becaSocioeconomicaService');

// ======================================================
// GET - OBTENER TODAS LAS BECAS
// ======================================================
const obtenerBecasSocioeconomicas = async (req, res) => {
    try {
        const becas = await becaSocioeconomicaService.obtenerBecasSocioeconomicas();
        res.status(200).json({
            success: true,
            data: becas,
            message: 'Becas socioeconómicas obtenidas correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener becas socioeconómicas',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER BECA POR ID
// ======================================================
const obtenerBecaSocioeconomicaPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const beca = await becaSocioeconomicaService.obtenerBecaSocioeconomicaPorId(id);

        if (!beca) {
            return res.status(404).json({
                success: false,
                message: 'Beca socioeconómica no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: beca,
            message: 'Beca socioeconómica obtenida correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener beca socioeconómica',
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR BECA
// ======================================================
const crearBecaSocioeconomica = async (req, res) => {
    try {
        const { Nombre } = req.body;

        // Validaciones
        if (!Nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const nuevaBeca = await becaSocioeconomicaService.crearBecaSocioeconomica({
            Nombre: Nombre.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevaBeca,
            message: 'Beca socioeconómica creada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear beca socioeconómica',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR BECA
// ======================================================
const actualizarBecaSocioeconomica = async (req, res) => {
    try {
        const { id } = req.params;
        const { Nombre } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (Nombre !== undefined) datosActualizar.Nombre = Nombre.trim();

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const becaActualizada = await becaSocioeconomicaService.actualizarBecaSocioeconomica(id, datosActualizar);

        res.status(200).json({
            success: true,
            data: becaActualizada,
            message: 'Beca socioeconómica actualizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar beca socioeconómica',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR BECA
// ======================================================
const eliminarBecaSocioeconomica = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        await becaSocioeconomicaService.eliminarBecaSocioeconomica(id);

        res.status(200).json({
            success: true,
            message: 'Beca socioeconómica eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar beca socioeconómica',
            error: error.message
        });
    }
};

// ======================================================
// GET - BUSCAR BECA POR NOMBRE
// ======================================================
const buscarBecaPorNombre = async (req, res) => {
    try {
        const { nombre } = req.query;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro "nombre" es requerido'
            });
        }

        const becas = await becaSocioeconomicaService.buscarBecaPorNombre(nombre);

        res.status(200).json({
            success: true,
            data: becas,
            message: 'Búsqueda realizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar beca socioeconómica',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================
module.exports = {
    obtenerBecasSocioeconomicas,
    obtenerBecaSocioeconomicaPorId,
    crearBecaSocioeconomica,
    actualizarBecaSocioeconomica,
    eliminarBecaSocioeconomica,
    buscarBecaPorNombre
};
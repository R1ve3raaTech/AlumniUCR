const becaSocioeconomicaService = require('../../services/perfil/becaSocioeconomicaService');

// ======================================================
// GET - OBTENER TODAS LAS BECAS
// ======================================================
const obtenerBecasSocioeconomicas = async (req, res, next) => {
    try {
        const becas = await becaSocioeconomicaService.obtenerBecasSocioeconomicas();
        res.status(200).json({
            success: true,
            data: becas,
            message: 'Becas socioeconómicas obtenidas correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER BECA POR ID
// ======================================================
const obtenerBecaSocioeconomicaPorId = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// POST - CREAR BECA
// ======================================================
const crearBecaSocioeconomica = async (req, res, next) => {
    try {
        const { nombre } = req.body;

        // Validaciones
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const nuevaBeca = await becaSocioeconomicaService.crearBecaSocioeconomica({
            nombre: nombre.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevaBeca,
            message: 'Beca socioeconómica creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// PUT - ACTUALIZAR BECA
// ======================================================
const actualizarBecaSocioeconomica = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'El ID es requerido'
            });
        }

        const datosActualizar = {};
        if (nombre !== undefined) datosActualizar.nombre = nombre.trim();

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
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR BECA
// ======================================================
const eliminarBecaSocioeconomica = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// GET - BUSCAR BECA POR NOMBRE
// ======================================================
const buscarBecaPorNombre = async (req, res, next) => {
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
        next(error);
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
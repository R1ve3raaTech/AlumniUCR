const puestoEmpleoService = require('../services/puestoEmpleoService');

// ======================================================
// OBTENER TODOS LOS PUESTOS DE EMPLEO
// ======================================================

const obtenerPuestosEmpleo = async (req, res) => {
    try {
        const puestos = await puestoEmpleoService.obtenerPuestosEmpleo();

        res.status(200).json(puestos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los puestos de empleo',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER PUESTO POR ID
// ======================================================

const obtenerPuestoEmpleoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const puesto = await puestoEmpleoService.obtenerPuestoEmpleoPorId(id);

        res.status(200).json(puesto);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el puesto de empleo',
            error: error.message
        });
    }
};

// ======================================================
// CREAR PUESTO DE EMPLEO
// ======================================================

const crearPuestoEmpleo = async (req, res) => {
    try {
        const nuevoPuesto = await puestoEmpleoService.crearPuestoEmpleo(req.body);

        res.status(201).json({
            mensaje: 'Puesto de empleo creado correctamente',
            data: nuevoPuesto
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear el puesto de empleo',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR PUESTO DE EMPLEO
// ======================================================

const actualizarPuestoEmpleo = async (req, res) => {
    try {
        const { id } = req.params;

        const puestoActualizado =
            await puestoEmpleoService.actualizarPuestoEmpleo(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Puesto de empleo actualizado correctamente',
            data: puestoActualizado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar el puesto de empleo',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR PUESTO DE EMPLEO
// ======================================================

const eliminarPuestoEmpleo = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await puestoEmpleoService.eliminarPuestoEmpleo(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar el puesto de empleo',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER PUESTOS POR USUARIO
// ======================================================

const obtenerPuestosPorUsuario = async (req, res) => {
    try {
        const { idUsuario } = req.params;

        const puestos =
            await puestoEmpleoService.obtenerPuestosPorUsuario(idUsuario);

        res.status(200).json(puestos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los puestos del usuario',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER PUESTOS ACTIVOS
// ======================================================

const obtenerPuestosActivos = async (req, res) => {
    try {
        const puestos =
            await puestoEmpleoService.obtenerPuestosActivos();

        res.status(200).json(puestos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los puestos activos',
            error: error.message
        });
    }
};

// ======================================================
// BUSCAR PUESTOS POR EMPRESA
// ======================================================

const buscarPuestosPorEmpresa = async (req, res) => {
    try {
        const { empresa } = req.params;

        const puestos =
            await puestoEmpleoService.buscarPuestosPorEmpresa(empresa);

        res.status(200).json(puestos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar puestos por empresa',
            error: error.message
        });
    }
};

// ======================================================
// BUSCAR PUESTOS POR TÍTULO
// ======================================================

const buscarPuestosPorTitulo = async (req, res) => {
    try {
        const { titulo } = req.params;

        const puestos =
            await puestoEmpleoService.buscarPuestosPorTitulo(titulo);

        res.status(200).json(puestos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar puestos por título',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerPuestosEmpleo,
    obtenerPuestoEmpleoPorId,
    crearPuestoEmpleo,
    actualizarPuestoEmpleo,
    eliminarPuestoEmpleo,
    obtenerPuestosPorUsuario,
    obtenerPuestosActivos,
    buscarPuestosPorEmpresa,
    buscarPuestosPorTitulo
};
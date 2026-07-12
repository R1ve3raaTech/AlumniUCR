const puestoEmpleoService = require('../../services/matching/puestoEmpleoService');

// ======================================================
// OBTENER TODOS LOS PUESTOS DE EMPLEO
// ======================================================

const obtenerPuestosEmpleo = async (req, res, next) => {
    try {
        const puestos = await puestoEmpleoService.obtenerPuestosEmpleo();

        res.status(200).json(puestos);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER PUESTO POR ID
// ======================================================

const obtenerPuestoEmpleoPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const puesto = await puestoEmpleoService.obtenerPuestoEmpleoPorId(id);

        if (!puesto) {
            return res.status(404).json({
                mensaje: 'Puesto de empleo no encontrado'
            });
        }

        res.status(200).json(puesto);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR PUESTO DE EMPLEO
// ======================================================

const crearPuestoEmpleo = async (req, res, next) => {
    try {
        const { id_usuario, titulo_puesto } = req.body;

        if (!id_usuario) {
            return res.status(400).json({
                mensaje: 'El id_usuario es requerido'
            });
        }

        if (!titulo_puesto) {
            return res.status(400).json({
                mensaje: 'El titulo_puesto es requerido'
            });
        }

        const nuevoPuesto = await puestoEmpleoService.crearPuestoEmpleo(req.body);

        res.status(201).json({
            mensaje: 'Puesto de empleo creado correctamente',
            data: nuevoPuesto
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR PUESTO DE EMPLEO
// ======================================================

const actualizarPuestoEmpleo = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// ELIMINAR PUESTO DE EMPLEO
// ======================================================

const eliminarPuestoEmpleo = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resultado =
            await puestoEmpleoService.eliminarPuestoEmpleo(id);

        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER PUESTOS POR USUARIO
// ======================================================

const obtenerPuestosPorUsuario = async (req, res, next) => {
    try {
        const { idUsuario } = req.params;

        const puestos =
            await puestoEmpleoService.obtenerPuestosPorUsuario(idUsuario);

        res.status(200).json(puestos);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER PUESTOS ACTIVOS
// ======================================================

const obtenerPuestosActivos = async (req, res, next) => {
    try {
        const puestos =
            await puestoEmpleoService.obtenerPuestosActivos();

        res.status(200).json(puestos);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// BUSCAR PUESTOS POR EMPRESA
// ======================================================

const buscarPuestosPorEmpresa = async (req, res, next) => {
    try {
        const { empresa } = req.params;

        const puestos =
            await puestoEmpleoService.buscarPuestosPorEmpresa(empresa);

        res.status(200).json(puestos);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// BUSCAR PUESTOS POR TÍTULO
// ======================================================

const buscarPuestosPorTitulo = async (req, res, next) => {
    try {
        const { titulo } = req.params;

        const puestos =
            await puestoEmpleoService.buscarPuestosPorTitulo(titulo);

        res.status(200).json(puestos);
    } catch (error) {
        next(error);
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
    buscarPuestosPorTitulo,
    cerrarPosicionesVencidas,
};

// ======================================================
// POST - CERRAR POSICIONES VENCIDAS (admin) — RF-10
// ======================================================

async function cerrarPosicionesVencidas(req, res, next) {
    try {
        const resultado = await puestoEmpleoService.cerrarPosicionesVencidas();
        res.status(200).json({
            success: true,
            data: resultado,
            message: `${resultado.cerradas} posición(es) cerrada(s) automáticamente`
        });
    } catch (error) { next(error); }
};

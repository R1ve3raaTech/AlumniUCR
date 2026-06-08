const rolService = require('../services/rolService');

// ======================================================
// OBTENER TODOS LOS ROLES
// ======================================================

const obtenerRoles = async (req, res) => {
    try {
        const roles = await rolService.obtenerRoles();

        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los roles',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER ROL POR ID
// ======================================================

const obtenerRolPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const rol = await rolService.obtenerRolPorId(id);

        res.status(200).json(rol);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el rol',
            error: error.message
        });
    }
};

// ======================================================
// CREAR ROL
// ======================================================

const crearRol = async (req, res) => {
    try {
        const nuevoRol = await rolService.crearRol(req.body);

        res.status(201).json({
            mensaje: 'Rol creado correctamente',
            data: nuevoRol
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear el rol',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR ROL
// ======================================================

const actualizarRol = async (req, res) => {
    try {
        const { id } = req.params;

        const rolActualizado =
            await rolService.actualizarRol(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Rol actualizado correctamente',
            data: rolActualizado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar el rol',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR ROL
// ======================================================

const eliminarRol = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await rolService.eliminarRol(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar el rol',
            error: error.message
        });
    }
};

// ======================================================
// BUSCAR ROLES POR NOMBRE
// ======================================================

const buscarRolesPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;

        const roles =
            await rolService.buscarRolesPorNombre(nombre);

        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar roles por nombre',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerRoles,
    obtenerRolPorId,
    crearRol,
    actualizarRol,
    eliminarRol,
    buscarRolesPorNombre
};
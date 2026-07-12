const rolService = require('../../services/auth/rolService');

// ======================================================
// OBTENER TODOS LOS ROLES
// ======================================================

const obtenerRoles = async (req, res, next) => {
    try {
        const roles = await rolService.obtenerRoles();

        res.status(200).json({
            success: true,
            data: roles,
            message: 'Roles obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER ROL POR ID
// ======================================================

const obtenerRolPorId = async (req, res, next) => {
    try {
        const { id } = req.params;

        const rol = await rolService.obtenerRolPorId(id);

        if (!rol) {
            return res.status(404).json({
                success: false,
                message: 'Rol no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: rol,
            message: 'Rol obtenido correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR ROL
// ======================================================

const crearRol = async (req, res, next) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const nuevoRol = await rolService.crearRol({
            nombre: nombre.trim()
        });

        res.status(201).json({
            success: true,
            data: nuevoRol,
            message: 'Rol creado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR ROL
// ======================================================

const actualizarRol = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre es requerido'
            });
        }

        const rolActualizado = await rolService.actualizarRol(id, {
            nombre: nombre.trim()
        });

        res.status(200).json({
            success: true,
            data: rolActualizado,
            message: 'Rol actualizado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ELIMINAR ROL
// ======================================================

const eliminarRol = async (req, res, next) => {
    try {
        const { id } = req.params;

        const resultado = await rolService.eliminarRol(id);

        res.status(200).json({
            success: true,
            data: resultado,
            message: 'Rol eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// BUSCAR ROLES POR NOMBRE
// ======================================================

const buscarRolesPorNombre = async (req, res, next) => {
    try {
        const { nombre } = req.params;

        const roles = await rolService.buscarRolesPorNombre(nombre);

        res.status(200).json({
            success: true,
            data: roles,
            message: 'Roles obtenidos correctamente'
        });
    } catch (error) {
        next(error);
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

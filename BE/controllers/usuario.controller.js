const usuarioService = require('../services/usuarioService');

// ======================================================
// OBTENER TODOS LOS USUARIOS
// ======================================================

const obtenerUsuarios = async (req, res, next) => {
    try {
        const usuarios = await usuarioService.obtenerUsuarios();
        res.status(200).json(usuarios);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// OBTENER USUARIO POR ID
// ======================================================

const obtenerUsuarioPorId = async (req, res, next) => {
    try {
        const { id } = req.params;
        const usuario = await usuarioService.obtenerUsuarioPorId(id);
        if (!usuario) {
            return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// CREAR USUARIO
// ======================================================

const crearUsuario = async (req, res, next) => {
    try {
        const nuevoUsuario = await usuarioService.crearUsuario(req.body);
        res.status(201).json({
            mensaje: 'Usuario creado correctamente',
            data: nuevoUsuario
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ACTUALIZAR USUARIO
// ======================================================

const actualizarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Verificar si el usuario autenticado tiene permisos (ser el mismo usuario o ser administrador)
        if (!req.user || (req.user.id !== id && req.user.profile?.roles?.nombre !== 'Admin')) {
            return res.status(403).json({
                success: false,
                mensaje: 'Acceso denegado. No tiene permisos para actualizar este perfil.'
            });
        }

        const usuarioActualizado = await usuarioService.actualizarUsuario(id, req.body);
        res.status(200).json({
            mensaje: 'Usuario actualizado correctamente',
            data: usuarioActualizado
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// ELIMINAR USUARIO
// ======================================================

const eliminarUsuario = async (req, res, next) => {
    try {
        const { id } = req.params;
        const resultado = await usuarioService.eliminarUsuario(id);
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// BUSCAR USUARIOS POR NOMBRE
// ======================================================

const buscarUsuariosPorNombre = async (req, res, next) => {
    try {
        const { nombre } = req.params;
        const usuarios = await usuarioService.buscarUsuariosPorNombre(nombre);
        res.status(200).json(usuarios);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// BUSCAR USUARIO POR CORREO
// ======================================================

const obtenerUsuarioPorCorreo = async (req, res, next) => {
    try {
        const { correoElectronico } = req.params;
        const usuario = await usuarioService.obtenerUsuarioPorCorreo(correoElectronico);
        if (!usuario) {
            return res.status(404).json({ success: false, mensaje: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        next(error);
    }
};

// ======================================================
// EXPORTAR CONTROLLERS
// ======================================================

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    buscarUsuariosPorNombre,
    obtenerUsuarioPorCorreo
};
const usuarioService = require('../services/usuarioService');

// ======================================================
// OBTENER TODOS LOS USUARIOS
// ======================================================

const obtenerUsuarios = async (req, res) => {
    try {
        const usuarios = await usuarioService.obtenerUsuarios();

        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener los usuarios',
            error: error.message
        });
    }
};

// ======================================================
// OBTENER USUARIO POR ID
// ======================================================

const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await usuarioService.obtenerUsuarioPorId(id);

        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el usuario',
            error: error.message
        });
    }
};

// ======================================================
// CREAR USUARIO
// ======================================================

const crearUsuario = async (req, res) => {
    try {
        const nuevoUsuario =
            await usuarioService.crearUsuario(req.body);

        res.status(201).json({
            mensaje: 'Usuario creado correctamente',
            data: nuevoUsuario
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al crear el usuario',
            error: error.message
        });
    }
};

// ======================================================
// ACTUALIZAR USUARIO
// ======================================================

const actualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const usuarioActualizado =
            await usuarioService.actualizarUsuario(
                id,
                req.body
            );

        res.status(200).json({
            mensaje: 'Usuario actualizado correctamente',
            data: usuarioActualizado
        });
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al actualizar el usuario',
            error: error.message
        });
    }
};

// ======================================================
// ELIMINAR USUARIO
// ======================================================

const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const resultado =
            await usuarioService.eliminarUsuario(id);

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al eliminar el usuario',
            error: error.message
        });
    }
};

// ======================================================
// BUSCAR USUARIOS POR NOMBRE
// ======================================================

const buscarUsuariosPorNombre = async (req, res) => {
    try {
        const { nombre } = req.params;

        const usuarios =
            await usuarioService.buscarUsuariosPorNombre(
                nombre
            );

        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar usuarios por nombre',
            error: error.message
        });
    }
};

// ======================================================
// BUSCAR USUARIO POR CORREO
// ======================================================

const obtenerUsuarioPorCorreo = async (req, res) => {
    try {
        const { correoElectronico } = req.params;

        const usuario =
            await usuarioService.obtenerUsuarioPorCorreo(
                correoElectronico
            );

        res.status(200).json(usuario);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener el usuario por correo electrónico',
            error: error.message
        });
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
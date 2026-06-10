const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// ======================================================
// RUTAS DE USUARIOS CON MIDDLEWARES DE SEGURIDAD
// ======================================================

// Obtener todos los usuarios (Solo permitido para Administradores de la Fundación)
router.get(
    '/', 
    authMiddleware, 
    roleMiddleware('admin'), 
    usuarioController.obtenerUsuarios
);

// Obtener un usuario por ID (Permitido para cualquier usuario autenticado)
router.get(
    '/:id', 
    authMiddleware, 
    roleMiddleware(['admin', 'estudiante', 'exalumno']), 
    usuarioController.obtenerUsuarioPorId
);

// Crear usuario (Acceso libre/público para registro inicial de estudiantes o exalumnos)
router.post(
    '/', 
    usuarioController.crearUsuario
);

// Actualizar usuario (Permitido para cualquier usuario autenticado. El controlador gestiona si edita su propio id)
router.put(
    '/:id', 
    authMiddleware, 
    usuarioController.actualizarUsuario
);

// Eliminar usuario (Solo permitido para Administradores)
router.delete(
    '/:id', 
    authMiddleware, 
    roleMiddleware('admin'), 
    usuarioController.eliminarUsuario
);

// Buscar usuarios por nombre (Cualquier usuario autenticado puede buscar perfiles públicos)
router.get(
    '/buscar/:nombre', 
    authMiddleware, 
    roleMiddleware(['admin', 'estudiante', 'exalumno']), 
    usuarioController.buscarUsuariosPorNombre
);

// Buscar usuario por correo electrónico (Solo permitido para administradores)
router.get(
    '/correo/:correoElectronico', 
    authMiddleware, 
    roleMiddleware('admin'), 
    usuarioController.obtenerUsuarioPorCorreo
);

module.exports = router;

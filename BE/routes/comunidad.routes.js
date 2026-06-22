// Rutas de Comunidad (blogs + eventos). Una sola superficie para mantener el
// backend liviano.
const express = require('express');
const router = express.Router();
const c = require('../controllers/comunidad.controller');
const autenticar = require('../middlewares/auth.middleware');
const exigirRol = require('../middlewares/role.middleware');

// Lectura pública (espacio de Comunidad / Blog).
router.get('/blogs', c.listarBlogs);
router.get('/eventos', c.listarEventos);

// Estudiantes y exalumnos publican (queda pendiente de aprobación) y ven lo suyo.
router.post('/blogs', autenticar, exigirRol(['estudiante', 'exalumno', 'admin']), c.crearBlog);
router.get('/blogs/mios', autenticar, c.misBlogs);

// Administración: moderación de blogs y gestión de eventos.
router.get('/admin', autenticar, exigirRol('admin'), c.panelAdmin);
router.patch('/blogs/:id', autenticar, exigirRol('admin'), c.moderarBlog);
router.post('/eventos', autenticar, exigirRol('admin'), c.crearEvento);
router.patch('/eventos/:id', autenticar, exigirRol('admin'), c.moderarEvento);

module.exports = router;

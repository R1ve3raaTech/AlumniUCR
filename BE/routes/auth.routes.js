const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/register/estudiante', authController.registerEstudiante);
router.post('/register/exalumno', authController.registerExalumno);
router.post('/login', authController.login);

module.exports = router;

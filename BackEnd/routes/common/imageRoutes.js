import express from 'express';
import { generarImagenFlux } from '../../controllers/common/imageController.js';

const router = express.Router();

// POST http://localhost:5000/api/images/generate
router.post('/generate', generarImagenFlux);

export default router;

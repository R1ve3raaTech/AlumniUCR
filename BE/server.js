const express = require('express');
const cors = require('cors');
require('dotenv').config();

const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta base - Health check
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        mensaje: 'Bienvenido a la API de Conectando Talento UCR',
        version: '1.0.0',
        estado: 'Activa'
    });
});

// Importar enrutadores de la API
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const cvRoutes = require('./routes/cv.routes');

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cv', cvRoutes);

// Manejo centralizado de errores (Debe registrarse al final de todas las rutas)
app.use(errorMiddleware);

// Iniciar el servidor Express
const server = app.listen(PORT, () => {
    console.log(`\n\x1b[32m%s\x1b[0m`, `🚀 Servidor Express corriendo en el puerto ${PORT}`);
    console.log(`\x1b[36m%s\x1b[0m`, `👉 URL local: http://localhost:${PORT}`);
});

module.exports = { app, server };

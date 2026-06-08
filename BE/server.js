const express = require('express');
const cors = require('cors');
const app = express();

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Rutas
const authRoutes = require('./routes/auth.routes');
const usersRoutes = require('./routes/users.routes');
const cvRoutes = require('./routes/cv.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/cv', cvRoutes);

// Endpoint de prueba para confirmar conexión BE-FE
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend corriendo 🟢' });
});

// Error middleware (siempre al final)
const errorMiddleware = require('./middlewares/error.middleware');
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
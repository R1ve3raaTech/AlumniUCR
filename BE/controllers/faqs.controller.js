// Sirve las preguntas frecuentes (FAQ) públicas desde la fuente única versionada.
const { CATEGORIAS, FAQS } = require('../config/faqs');

const listarFaqs = async (_req, res, next) => {
  try {
    res.status(200).json({ success: true, data: { categorias: CATEGORIAS, faqs: FAQS } });
  } catch (error) {
    next(error);
  }
};

module.exports = { listarFaqs };

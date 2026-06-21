// Controlador del perfil de onboarding del estudiante. El id del usuario sale
// del token (req.user.id), no del body.

const service = require('../services/perfilOnboarding.service');

const obtener = async (req, res, next) => {
  try {
    const datos = await service.obtener(req.user.id);
    res.status(200).json({ success: true, data: datos });
  } catch (error) {
    next(error);
  }
};

const guardar = async (req, res, next) => {
  try {
    const datos = req.body?.datos ?? req.body ?? {};
    const guardado = await service.guardar(req.user.id, datos);
    res.status(200).json({ success: true, data: guardado });
  } catch (error) {
    next(error);
  }
};

module.exports = { obtener, guardar };

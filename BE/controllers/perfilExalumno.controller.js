// Controlador del Perfil de Exalumno (RF-02).

const servicio = require('../services/perfilExalumno.service');

const errorValidacion = (mensaje) => {
  const err = new Error(mensaje);
  err.statusCode = 400;
  return err;
};

const obtenerCatalogos = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: await servicio.obtenerCatalogos() });
  } catch (error) {
    next(error);
  }
};

// El usuario solo puede consultar su propio perfil (o el admin cualquiera).
const obtenerMiPerfil = async (req, res, next) => {
  try {
    const userId = req.user.id;
    res.status(200).json({ success: true, data: await servicio.obtenerPerfil(userId) });
  } catch (error) {
    next(error);
  }
};

const guardarMiPerfil = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const b = req.body || {};

    // ── Validaciones RF-02 ──────────────────────────────────────────────
    const texto = (v) => (typeof v === 'string' ? v.trim() : '');
    const obligatorios = {
      'País y ciudad (país)': texto(b.pais),
      'País y ciudad (ciudad)': texto(b.ciudad),
      'URL de LinkedIn': texto(b.url_linkedin),
      'Biografía profesional': texto(b.biografia),
      'Empresa o institución actual': texto(b.empresa),
      'Cargo actual': texto(b.cargo),
      'Escuela o Facultad': texto(b.escuela_facultad),
    };
    for (const [campo, valor] of Object.entries(obligatorios)) {
      if (!valor) throw errorValidacion(`El campo "${campo}" es obligatorio.`);
    }

    if (texto(b.biografia).length > 500) {
      throw errorValidacion('La biografía no puede superar los 500 caracteres.');
    }
    if (!/linkedin\.com/i.test(b.url_linkedin)) {
      throw errorValidacion('La URL de LinkedIn debe ser un enlace de linkedin.com.');
    }

    if (!Array.isArray(b.carreras) || b.carreras.length < 1) {
      throw errorValidacion('Selecciona al menos una carrera cursada en la UCR.');
    }
    // Acepta un año único (2015) o un rango (1988-1994), útil para exalumnos
    // que cursaron varias carreras en distintos períodos.
    const anioTexto = String(b.anio_graduacion || '').trim();
    if (!/^\d{4}(\s*-\s*\d{4})?$/.test(anioTexto)) {
      throw errorValidacion('El año de graduación debe ser un año (ej. 2015) o un rango (ej. 1988-1994).');
    }
    const exp = Number(b.anos_experiencia);
    if (!Number.isInteger(exp) || exp < 0 || exp > 70) {
      throw errorValidacion('Los años de experiencia deben ser un número válido.');
    }
    if (!Array.isArray(b.sectores) || b.sectores.length < 1) {
      throw errorValidacion('Selecciona al menos un sector o industria.');
    }
    if (!Array.isArray(b.areas) || b.areas.length < 1) {
      throw errorValidacion('Selecciona al menos un área de interés donde puedas ayudar.');
    }

    // Condicionales del tipo de apoyo.
    if (b.ofrece_mentoria) {
      const horas = Number(b.horas_disponibles_mes);
      if (!Number.isInteger(horas) || horas < 1 || horas > 40) {
        throw errorValidacion('Las horas disponibles por mes deben estar entre 1 y 40.');
      }
    }
    if (b.ofrece_donacion) {
      const monto = Number(b.monto_maximo_donacion);
      if (!Number.isFinite(monto) || monto <= 0) {
        throw errorValidacion('Indica un monto máximo de donación válido.');
      }
      if (!['CRC', 'USD'].includes(b.moneda)) {
        throw errorValidacion('La moneda debe ser CRC o USD.');
      }
    }

    const datos = {
      foto_perfil: texto(b.foto_perfil),
      pais: texto(b.pais),
      ciudad: texto(b.ciudad),
      url_linkedin: texto(b.url_linkedin),
      biografia: texto(b.biografia),
      empresa: texto(b.empresa),
      cargo: texto(b.cargo),
      anos_experiencia: exp,
      escuela_facultad: texto(b.escuela_facultad),
      anio_graduacion: anioTexto,
      carreras: b.carreras.map(Number),
      sectores: b.sectores.map(Number),
      areas: b.areas.map(Number),
      ofrece_mentoria: !!b.ofrece_mentoria,
      horas_disponibles_mes: b.ofrece_mentoria ? Number(b.horas_disponibles_mes) : null,
      ofrece_empleo: !!b.ofrece_empleo,
      ofrece_pasantia: !!b.ofrece_pasantia,
      ofrece_colaboracion: !!b.ofrece_colaboracion,
      ofrece_donacion: !!b.ofrece_donacion,
      monto_maximo_donacion: b.ofrece_donacion ? Number(b.monto_maximo_donacion) : null,
      moneda: b.ofrece_donacion ? b.moneda : null,
    };

    const data = await servicio.guardarPerfil(userId, datos);
    res.status(200).json({ success: true, mensaje: 'Perfil actualizado.', data });
  } catch (error) {
    next(error);
  }
};

const obtenerDirectorio = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: await servicio.obtenerDirectorio() });
  } catch (error) {
    next(error);
  }
};

module.exports = { obtenerCatalogos, obtenerMiPerfil, guardarMiPerfil, obtenerDirectorio };

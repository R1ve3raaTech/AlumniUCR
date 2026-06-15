const informacionExalumnoService = require('../services/informacionExalumnoService');

// ======================================================
// GET - OBTENER TODA LA INFORMACIÓN DE EXALUMNOS
// ======================================================
const obtenerInformacionExalumnos = async (req, res, next) => {
    try {
        const informacion = await informacionExalumnoService.obtenerInformacionExalumnos();
        res.status(200).json({
            success: true,
            data: informacion,
            message: 'Información de exalumnos obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER INFORMACIÓN POR ID USUARIO
// ======================================================
const obtenerInformacionExalumnoPorUsuario = async (req, res, next) => {
    try {
        const { idUsuario } = req.params;

        if (!idUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        const informacion = await informacionExalumnoService.obtenerInformacionExalumnoPorUsuario(idUsuario);

        if (!informacion) {
            return res.status(404).json({
                success: false,
                message: 'Información del exalumno no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: informacion,
            message: 'Información del exalumno obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// POST - CREAR INFORMACIÓN DE EXALUMNO
// ======================================================
const crearInformacionExalumno = async (req, res, next) => {
    try {
        const {
            id_usuario,
            foto_perfil,
            pais,
            ciudad,
            url_linkedin,
            biografia,
            empresa,
            cargo,
            anos_experiencia,
            ofrece_mentoria,
            horas_disponibles_mes,
            ofrece_empleo,
            ofrece_pasantia,
            ofrece_colaboracion,
            ofrece_donacion,
            estado,
            monto_maximo_donacion,
            moneda
        } = req.body;

        // Validaciones
        if (!id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'El id_usuario es requerido'
            });
        }

        if (!pais) {
            return res.status(400).json({
                success: false,
                message: 'El país es requerido'
            });
        }

        if (!ciudad) {
            return res.status(400).json({
                success: false,
                message: 'La ciudad es requerida'
            });
        }

        const nuevaInformacion = await informacionExalumnoService.crearInformacionExalumno({
            id_usuario,
            foto_perfil: foto_perfil || null,
            pais: pais.trim(),
            ciudad: ciudad.trim(),
            url_linkedin: url_linkedin ? url_linkedin.trim() : null,
            biografia: biografia ? biografia.trim() : null,
            empresa: empresa ? empresa.trim() : null,
            cargo: cargo ? cargo.trim() : null,
            anos_experiencia: anos_experiencia || null,
            ofrece_mentoria: ofrece_mentoria || false,
            horas_disponibles_mes: horas_disponibles_mes || null,
            ofrece_empleo: ofrece_empleo || false,
            ofrece_pasantia: ofrece_pasantia || false,
            ofrece_colaboracion: ofrece_colaboracion || false,
            ofrece_donacion: ofrece_donacion || false,
            estado: estado !== undefined ? estado : false,
            monto_maximo_donacion: monto_maximo_donacion || null,
            moneda: moneda || null
        });

        res.status(201).json({
            success: true,
            data: nuevaInformacion,
            message: 'Información del exalumno creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// PUT - ACTUALIZAR INFORMACIÓN DE EXALUMNO
// ======================================================
const actualizarInformacionExalumno = async (req, res, next) => {
    try {
        const { idUsuario } = req.params;
        const {
            foto_perfil,
            pais,
            ciudad,
            url_linkedin,
            biografia,
            empresa,
            cargo,
            anos_experiencia,
            ofrece_mentoria,
            horas_disponibles_mes,
            ofrece_empleo,
            ofrece_pasantia,
            ofrece_colaboracion,
            ofrece_donacion,
            estado,
            monto_maximo_donacion,
            moneda
        } = req.body;

        if (!idUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        const datosActualizar = {};
        if (foto_perfil !== undefined) datosActualizar.foto_perfil = foto_perfil;
        if (pais !== undefined) datosActualizar.pais = pais.trim();
        if (ciudad !== undefined) datosActualizar.ciudad = ciudad.trim();
        if (url_linkedin !== undefined) datosActualizar.url_linkedin = url_linkedin ? url_linkedin.trim() : null;
        if (biografia !== undefined) datosActualizar.biografia = biografia ? biografia.trim() : null;
        if (empresa !== undefined) datosActualizar.empresa = empresa ? empresa.trim() : null;
        if (cargo !== undefined) datosActualizar.cargo = cargo ? cargo.trim() : null;
        if (anos_experiencia !== undefined) datosActualizar.anos_experiencia = anos_experiencia;
        if (ofrece_mentoria !== undefined) datosActualizar.ofrece_mentoria = ofrece_mentoria;
        if (horas_disponibles_mes !== undefined) datosActualizar.horas_disponibles_mes = horas_disponibles_mes;
        if (ofrece_empleo !== undefined) datosActualizar.ofrece_empleo = ofrece_empleo;
        if (ofrece_pasantia !== undefined) datosActualizar.ofrece_pasantia = ofrece_pasantia;
        if (ofrece_colaboracion !== undefined) datosActualizar.ofrece_colaboracion = ofrece_colaboracion;
        if (ofrece_donacion !== undefined) datosActualizar.ofrece_donacion = ofrece_donacion;
        if (estado !== undefined) datosActualizar.estado = estado;
        if (monto_maximo_donacion !== undefined) datosActualizar.monto_maximo_donacion = monto_maximo_donacion;
        if (moneda !== undefined) datosActualizar.moneda = moneda;

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const informacionActualizada = await informacionExalumnoService.actualizarInformacionExalumno(idUsuario, datosActualizar);

        res.status(200).json({
            success: true,
            data: informacionActualizada,
            message: 'Información del exalumno actualizada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR INFORMACIÓN DE EXALUMNO
// ======================================================
const eliminarInformacionExalumno = async (req, res, next) => {
    try {
        const { idUsuario } = req.params;

        if (!idUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        await informacionExalumnoService.eliminarInformacionExalumno(idUsuario);

        res.status(200).json({
            success: true,
            message: 'Información del exalumno eliminada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER EXALUMNOS QUE OFRECEN MENTORÍA
// ======================================================
const obtenerExalumnosMentores = async (req, res, next) => {
    try {
        const mentores = await informacionExalumnoService.obtenerExalumnosMentores();
        res.status(200).json({
            success: true,
            data: mentores,
            message: 'Exalumnos mentores obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER EXALUMNOS QUE OFRECEN EMPLEO
// ======================================================
const obtenerExalumnosOfrecenEmpleo = async (req, res, next) => {
    try {
        const exalumnos = await informacionExalumnoService.obtenerExalumnosOfrecenEmpleo();
        res.status(200).json({
            success: true,
            data: exalumnos,
            message: 'Exalumnos que ofrecen empleo obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER EXALUMNOS QUE OFRECEN PASANTÍAS
// ======================================================
const obtenerExalumnosOfrecenPasantia = async (req, res, next) => {
    try {
        const exalumnos = await informacionExalumnoService.obtenerExalumnosOfrecenPasantia();
        res.status(200).json({
            success: true,
            data: exalumnos,
            message: 'Exalumnos que ofrecen pasantía obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER EXALUMNOS QUE OFRECEN DONACIONES
// ======================================================
const obtenerExalumnosOfrecenDonacion = async (req, res, next) => {
    try {
        const exalumnos = await informacionExalumnoService.obtenerExalumnosOfrecenDonacion();
        res.status(200).json({
            success: true,
            data: exalumnos,
            message: 'Exalumnos que ofrecen donación obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET - DIRECTORIO DE EXALUMNOS (RF-04)
// Solo perfiles con estado = true (= "perfil_completo")
// ======================================================
const obtenerExalumnosDirectorio = async (req, res, next) => {
    try {
        const exalumnos = await informacionExalumnoService.obtenerExalumnosDirectorio();
        res.status(200).json({
            success: true,
            data: exalumnos,
            message: 'Directorio de exalumnos obtenido correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================
module.exports = {
    obtenerInformacionExalumnos,
    obtenerInformacionExalumnoPorUsuario,
    crearInformacionExalumno,
    actualizarInformacionExalumno,
    eliminarInformacionExalumno,
    obtenerExalumnosMentores,
    obtenerExalumnosOfrecenEmpleo,
    obtenerExalumnosOfrecenPasantia,
    obtenerExalumnosOfrecenDonacion,
    obtenerExalumnosDirectorio
};
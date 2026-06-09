const informacionExalumnoService = require('../services/informacionExalumnoService');

// ======================================================
// GET - OBTENER TODA LA INFORMACIÓN DE EXALUMNOS
// ======================================================
const obtenerInformacionExalumnos = async (req, res) => {
    try {
        const informacion = await informacionExalumnoService.obtenerInformacionExalumnos();
        res.status(200).json({
            success: true,
            data: informacion,
            message: 'Información de exalumnos obtenida correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener información de exalumnos',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER INFORMACIÓN POR ID USUARIO
// ======================================================
const obtenerInformacionExalumnoPorUsuario = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del exalumno',
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR INFORMACIÓN DE EXALUMNO
// ======================================================
const crearInformacionExalumno = async (req, res) => {
    try {
        const {
            IdUsuario,
            FotoPerfil,
            Pais,
            Ciudad,
            URLLinkedIn,
            Biografia,
            Empresa,
            Cargo,
            AnosExperiencia,
            OfreceMentoria,
            HorasDisponiblesMes,
            OfreceEmpleo,
            OfrecePasantia,
            OfreceColaboracion,
            OfreceDonacion,
            Estado,
            MontoMaximoDonacion,
            Moneda
        } = req.body;

        // Validaciones
        if (!IdUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El IdUsuario es requerido'
            });
        }

        if (!Pais) {
            return res.status(400).json({
                success: false,
                message: 'El país es requerido'
            });
        }

        if (!Ciudad) {
            return res.status(400).json({
                success: false,
                message: 'La ciudad es requerida'
            });
        }

        const nuevaInformacion = await informacionExalumnoService.crearInformacionExalumno({
            IdUsuario,
            FotoPerfil: FotoPerfil || null,
            Pais: Pais.trim(),
            Ciudad: Ciudad.trim(),
            URLLinkedIn: URLLinkedIn ? URLLinkedIn.trim() : null,
            Biografia: Biografia ? Biografia.trim() : null,
            Empresa: Empresa ? Empresa.trim() : null,
            Cargo: Cargo ? Cargo.trim() : null,
            AnosExperiencia: AnosExperiencia || null,
            OfreceMentoria: OfreceMentoria || false,
            HorasDisponiblesMes: HorasDisponiblesMes || null,
            OfreceEmpleo: OfreceEmpleo || false,
            OfrecePasantia: OfrecePasantia || false,
            OfreceColaboracion: OfreceColaboracion || false,
            OfreceDonacion: OfreceDonacion || false,
            Estado: Estado || 'activo',
            MontoMaximoDonacion: MontoMaximoDonacion || null,
            Moneda: Moneda || null
        });

        res.status(201).json({
            success: true,
            data: nuevaInformacion,
            message: 'Información del exalumno creada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear información del exalumno',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR INFORMACIÓN DE EXALUMNO
// ======================================================
const actualizarInformacionExalumno = async (req, res) => {
    try {
        const { idUsuario } = req.params;
        const {
            FotoPerfil,
            Pais,
            Ciudad,
            URLLinkedIn,
            Biografia,
            Empresa,
            Cargo,
            AnosExperiencia,
            OfreceMentoria,
            HorasDisponiblesMes,
            OfreceEmpleo,
            OfrecePasantia,
            OfreceColaboracion,
            OfreceDonacion,
            Estado,
            MontoMaximoDonacion,
            Moneda
        } = req.body;

        if (!idUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        const datosActualizar = {};
        if (FotoPerfil !== undefined) datosActualizar.FotoPerfil = FotoPerfil;
        if (Pais !== undefined) datosActualizar.Pais = Pais.trim();
        if (Ciudad !== undefined) datosActualizar.Ciudad = Ciudad.trim();
        if (URLLinkedIn !== undefined) datosActualizar.URLLinkedIn = URLLinkedIn ? URLLinkedIn.trim() : null;
        if (Biografia !== undefined) datosActualizar.Biografia = Biografia ? Biografia.trim() : null;
        if (Empresa !== undefined) datosActualizar.Empresa = Empresa ? Empresa.trim() : null;
        if (Cargo !== undefined) datosActualizar.Cargo = Cargo ? Cargo.trim() : null;
        if (AnosExperiencia !== undefined) datosActualizar.AnosExperiencia = AnosExperiencia;
        if (OfreceMentoria !== undefined) datosActualizar.OfreceMentoria = OfreceMentoria;
        if (HorasDisponiblesMes !== undefined) datosActualizar.HorasDisponiblesMes = HorasDisponiblesMes;
        if (OfreceEmpleo !== undefined) datosActualizar.OfreceEmpleo = OfreceEmpleo;
        if (OfrecePasantia !== undefined) datosActualizar.OfrecePasantia = OfrecePasantia;
        if (OfreceColaboracion !== undefined) datosActualizar.OfreceColaboracion = OfreceColaboracion;
        if (OfreceDonacion !== undefined) datosActualizar.OfreceDonacion = OfreceDonacion;
        if (Estado !== undefined) datosActualizar.Estado = Estado;
        if (MontoMaximoDonacion !== undefined) datosActualizar.MontoMaximoDonacion = MontoMaximoDonacion;
        if (Moneda !== undefined) datosActualizar.Moneda = Moneda;

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
        res.status(500).json({
            success: false,
            message: 'Error al actualizar información del exalumno',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR INFORMACIÓN DE EXALUMNO
// ======================================================
const eliminarInformacionExalumno = async (req, res) => {
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
        res.status(500).json({
            success: false,
            message: 'Error al eliminar información del exalumno',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER EXALUMNOS QUE OFRECEN MENTORÍA
// ======================================================
const obtenerExalumnosMentores = async (req, res) => {
    try {
        const mentores = await informacionExalumnoService.obtenerExalumnosMentores();
        res.status(200).json({
            success: true,
            data: mentores,
            message: 'Exalumnos mentores obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener exalumnos mentores',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER EXALUMNOS QUE OFRECEN EMPLEO
// ======================================================
const obtenerExalumnosOfrecenEmpleo = async (req, res) => {
    try {
        const exalumnos = await informacionExalumnoService.obtenerExalumnosOfrecenEmpleo();
        res.status(200).json({
            success: true,
            data: exalumnos,
            message: 'Exalumnos que ofrecen empleo obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener exalumnos que ofrecen empleo',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER EXALUMNOS QUE OFRECEN PASANTÍAS
// ======================================================
const obtenerExalumnosOfrecenPasantia = async (req, res) => {
    try {
        const exalumnos = await informacionExalumnoService.obtenerExalumnosOfrecenPasantia();
        res.status(200).json({
            success: true,
            data: exalumnos,
            message: 'Exalumnos que ofrecen pasantía obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener exalumnos que ofrecen pasantía',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER EXALUMNOS QUE OFRECEN DONACIONES
// ======================================================
const obtenerExalumnosOfrecenDonacion = async (req, res) => {
    try {
        const exalumnos = await informacionExalumnoService.obtenerExalumnosOfrecenDonacion();
        res.status(200).json({
            success: true,
            data: exalumnos,
            message: 'Exalumnos que ofrecen donación obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener exalumnos que ofrecen donación',
            error: error.message
        });
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
    obtenerExalumnosOfrecenDonacion
};
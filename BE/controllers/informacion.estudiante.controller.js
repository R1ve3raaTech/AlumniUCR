const informacionEstudianteService = require('../services/informacionEstudianteService');

// ======================================================
// GET - OBTENER TODA LA INFORMACIÓN DE ESTUDIANTES
// ======================================================
const obtenerInformacionEstudiantes = async (req, res) => {
    try {
        const informacion = await informacionEstudianteService.obtenerInformacionEstudiantes();
        res.status(200).json({
            success: true,
            data: informacion,
            message: 'Información de estudiantes obtenida correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener información de estudiantes',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER INFORMACIÓN POR ID USUARIO
// ======================================================
const obtenerInformacionPorUsuario = async (req, res) => {
    try {
        const { idUsuario } = req.params;

        if (!idUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        const informacion = await informacionEstudianteService.obtenerInformacionPorUsuario(idUsuario);

        if (!informacion) {
            return res.status(404).json({
                success: false,
                message: 'Información del estudiante no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: informacion,
            message: 'Información del estudiante obtenida correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del estudiante',
            error: error.message
        });
    }
};

// ======================================================
// POST - CREAR INFORMACIÓN DE ESTUDIANTE
// ======================================================
const crearInformacionEstudiante = async (req, res) => {
    try {
        const {
            IdUsuario,
            Carne,
            AnoIngreso,
            IdNivelAcademico,
            PromedioPonderado,
            IdBeca,
            BuscaFinanciamiento,
            BuscaMentoria,
            BuscaEmpleo,
            BuscaPasantia,
            Habilidades,
            PerfilCompleto,
            Pausado,
            CursosRelevantes
        } = req.body;

        // Validaciones
        if (!IdUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El IdUsuario es requerido'
            });
        }

        if (!Carne) {
            return res.status(400).json({
                success: false,
                message: 'El carné es requerido'
            });
        }

        if (!AnoIngreso) {
            return res.status(400).json({
                success: false,
                message: 'El año de ingreso es requerido'
            });
        }

        if (!IdNivelAcademico) {
            return res.status(400).json({
                success: false,
                message: 'El IdNivelAcademico es requerido'
            });
        }

        const nuevaInformacion = await informacionEstudianteService.crearInformacionEstudiante({
            IdUsuario,
            Carne: Carne.trim(),
            AnoIngreso,
            IdNivelAcademico,
            PromedioPonderado: PromedioPonderado || null,
            IdBeca: IdBeca || null,
            BuscaFinanciamiento: BuscaFinanciamiento || false,
            BuscaMentoria: BuscaMentoria || false,
            BuscaEmpleo: BuscaEmpleo || false,
            BuscaPasantia: BuscaPasantia || false,
            Habilidades: Habilidades ? Habilidades.trim() : null,
            PerfilCompleto: PerfilCompleto || false,
            Pausado: Pausado || false,
            CursosRelevantes: CursosRelevantes ? CursosRelevantes.trim() : null
        });

        res.status(201).json({
            success: true,
            data: nuevaInformacion,
            message: 'Información del estudiante creada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear información del estudiante',
            error: error.message
        });
    }
};

// ======================================================
// PUT - ACTUALIZAR INFORMACIÓN DE ESTUDIANTE
// ======================================================
const actualizarInformacionEstudiante = async (req, res) => {
    try {
        const { idUsuario } = req.params;
        const {
            Carne,
            AnoIngreso,
            IdNivelAcademico,
            PromedioPonderado,
            IdBeca,
            BuscaFinanciamiento,
            BuscaMentoria,
            BuscaEmpleo,
            BuscaPasantia,
            Habilidades,
            PerfilCompleto,
            Pausado,
            CursosRelevantes
        } = req.body;

        if (!idUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        const datosActualizar = {};
        if (Carne !== undefined) datosActualizar.Carne = Carne.trim();
        if (AnoIngreso !== undefined) datosActualizar.AnoIngreso = AnoIngreso;
        if (IdNivelAcademico !== undefined) datosActualizar.IdNivelAcademico = IdNivelAcademico;
        if (PromedioPonderado !== undefined) datosActualizar.PromedioPonderado = PromedioPonderado;
        if (IdBeca !== undefined) datosActualizar.IdBeca = IdBeca;
        if (BuscaFinanciamiento !== undefined) datosActualizar.BuscaFinanciamiento = BuscaFinanciamiento;
        if (BuscaMentoria !== undefined) datosActualizar.BuscaMentoria = BuscaMentoria;
        if (BuscaEmpleo !== undefined) datosActualizar.BuscaEmpleo = BuscaEmpleo;
        if (BuscaPasantia !== undefined) datosActualizar.BuscaPasantia = BuscaPasantia;
        if (Habilidades !== undefined) datosActualizar.Habilidades = Habilidades ? Habilidades.trim() : null;
        if (PerfilCompleto !== undefined) datosActualizar.PerfilCompleto = PerfilCompleto;
        if (Pausado !== undefined) datosActualizar.Pausado = Pausado;
        if (CursosRelevantes !== undefined) datosActualizar.CursosRelevantes = CursosRelevantes ? CursosRelevantes.trim() : null;

        if (Object.keys(datosActualizar).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const informacionActualizada = await informacionEstudianteService.actualizarInformacionEstudiante(idUsuario, datosActualizar);

        res.status(200).json({
            success: true,
            data: informacionActualizada,
            message: 'Información del estudiante actualizada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar información del estudiante',
            error: error.message
        });
    }
};

// ======================================================
// DELETE - ELIMINAR INFORMACIÓN DE ESTUDIANTE
// ======================================================
const eliminarInformacionEstudiante = async (req, res) => {
    try {
        const { idUsuario } = req.params;

        if (!idUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        await informacionEstudianteService.eliminarInformacionEstudiante(idUsuario);

        res.status(200).json({
            success: true,
            message: 'Información del estudiante eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar información del estudiante',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER ESTUDIANTES QUE BUSCAN EMPLEO
// ======================================================
const obtenerEstudiantesBuscanEmpleo = async (req, res) => {
    try {
        const estudiantes = await informacionEstudianteService.obtenerEstudiantesBuscanEmpleo();
        res.status(200).json({
            success: true,
            data: estudiantes,
            message: 'Estudiantes que buscan empleo obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estudiantes que buscan empleo',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER ESTUDIANTES QUE BUSCAN PASANTÍA
// ======================================================
const obtenerEstudiantesBuscanPasantia = async (req, res) => {
    try {
        const estudiantes = await informacionEstudianteService.obtenerEstudiantesBuscanPasantia();
        res.status(200).json({
            success: true,
            data: estudiantes,
            message: 'Estudiantes que buscan pasantía obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estudiantes que buscan pasantía',
            error: error.message
        });
    }
};

// ======================================================
// GET - OBTENER ESTUDIANTES QUE BUSCAN MENTORÍA
// ======================================================
const obtenerEstudiantesBuscanMentoria = async (req, res) => {
    try {
        const estudiantes = await informacionEstudianteService.obtenerEstudiantesBuscanMentoria();
        res.status(200).json({
            success: true,
            data: estudiantes,
            message: 'Estudiantes que buscan mentoría obtenidos correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estudiantes que buscan mentoría',
            error: error.message
        });
    }
};

// ======================================================
// EXPORTAR CONTROLADOR
// ======================================================
module.exports = {
    obtenerInformacionEstudiantes,
    obtenerInformacionPorUsuario,
    crearInformacionEstudiante,
    actualizarInformacionEstudiante,
    eliminarInformacionEstudiante,
    obtenerEstudiantesBuscanEmpleo,
    obtenerEstudiantesBuscanPasantia,
    obtenerEstudiantesBuscanMentoria
};
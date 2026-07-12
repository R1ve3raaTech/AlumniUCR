const informacionEstudianteService = require('../../services/perfil/informacionEstudianteService');

// ======================================================
// GET - OBTENER TODA LA INFORMACIÓN DE ESTUDIANTES
// ======================================================
const obtenerInformacionEstudiantes = async (req, res, next) => {
    try {
        const informacion = await informacionEstudianteService.obtenerInformacionEstudiantes();
        res.status(200).json({
            success: true,
            data: informacion,
            message: 'Información de estudiantes obtenida correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER INFORMACIÓN POR ID USUARIO
// ======================================================
const obtenerInformacionPorUsuario = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// POST - CREAR INFORMACIÓN DE ESTUDIANTE
// ======================================================
const crearInformacionEstudiante = async (req, res, next) => {
    try {
        const {
            id_usuario,
            carne,
            ano_ingreso,
            id_nivel_academico,
            promedio_ponderado,
            id_beca,
            busca_financiamiento,
            busca_mentoria,
            busca_empleo,
            busca_pasantia,
            habilidades,
            perfil_completo,
            pausado,
            cursos_relevantes
        } = req.body;

        // Validaciones
        if (!id_usuario) {
            return res.status(400).json({
                success: false,
                message: 'El id_usuario es requerido'
            });
        }

        if (!carne) {
            return res.status(400).json({
                success: false,
                message: 'El carné es requerido'
            });
        }

        if (!ano_ingreso) {
            return res.status(400).json({
                success: false,
                message: 'El año de ingreso es requerido'
            });
        }

        if (!id_nivel_academico) {
            return res.status(400).json({
                success: false,
                message: 'El id_nivel_academico es requerido'
            });
        }

        const nuevaInformacion = await informacionEstudianteService.crearInformacionEstudiante({
            id_usuario,
            carne: carne.trim(),
            ano_ingreso,
            id_nivel_academico,
            promedio_ponderado: promedio_ponderado || null,
            id_beca: id_beca || null,
            busca_financiamiento: busca_financiamiento || false,
            busca_mentoria: busca_mentoria || false,
            busca_empleo: busca_empleo || false,
            busca_pasantia: busca_pasantia || false,
            habilidades: habilidades ? habilidades.trim() : null,
            perfil_completo: perfil_completo || false,
            pausado: pausado || false,
            cursos_relevantes: cursos_relevantes ? cursos_relevantes.trim() : null
        });

        res.status(201).json({
            success: true,
            data: nuevaInformacion,
            message: 'Información del estudiante creada correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// PUT - ACTUALIZAR INFORMACIÓN DE ESTUDIANTE
// ======================================================
const actualizarInformacionEstudiante = async (req, res, next) => {
    try {
        const { idUsuario } = req.params;
        const {
            carne,
            ano_ingreso,
            id_nivel_academico,
            promedio_ponderado,
            id_beca,
            busca_financiamiento,
            busca_mentoria,
            busca_empleo,
            busca_pasantia,
            habilidades,
            perfil_completo,
            pausado,
            cursos_relevantes
        } = req.body;

        if (!idUsuario) {
            return res.status(400).json({
                success: false,
                message: 'El ID del usuario es requerido'
            });
        }

        const datosActualizar = {};
        if (carne !== undefined) datosActualizar.carne = carne.trim();
        if (ano_ingreso !== undefined) datosActualizar.ano_ingreso = ano_ingreso;
        if (id_nivel_academico !== undefined) datosActualizar.id_nivel_academico = id_nivel_academico;
        if (promedio_ponderado !== undefined) datosActualizar.promedio_ponderado = promedio_ponderado;
        if (id_beca !== undefined) datosActualizar.id_beca = id_beca;
        if (busca_financiamiento !== undefined) datosActualizar.busca_financiamiento = busca_financiamiento;
        if (busca_mentoria !== undefined) datosActualizar.busca_mentoria = busca_mentoria;
        if (busca_empleo !== undefined) datosActualizar.busca_empleo = busca_empleo;
        if (busca_pasantia !== undefined) datosActualizar.busca_pasantia = busca_pasantia;
        if (habilidades !== undefined) datosActualizar.habilidades = habilidades ? habilidades.trim() : null;
        if (perfil_completo !== undefined) datosActualizar.perfil_completo = perfil_completo;
        if (pausado !== undefined) datosActualizar.pausado = pausado;
        if (cursos_relevantes !== undefined) datosActualizar.cursos_relevantes = cursos_relevantes ? cursos_relevantes.trim() : null;

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
        next(error);
    }
};

// ======================================================
// DELETE - ELIMINAR INFORMACIÓN DE ESTUDIANTE
// ======================================================
const eliminarInformacionEstudiante = async (req, res, next) => {
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
        next(error);
    }
};

// ======================================================
// GET - OBTENER ESTUDIANTES QUE BUSCAN EMPLEO
// ======================================================
const obtenerEstudiantesBuscanEmpleo = async (req, res, next) => {
    try {
        const estudiantes = await informacionEstudianteService.obtenerEstudiantesBuscanEmpleo();
        res.status(200).json({
            success: true,
            data: estudiantes,
            message: 'Estudiantes que buscan empleo obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER ESTUDIANTES QUE BUSCAN PASANTÍA
// ======================================================
const obtenerEstudiantesBuscanPasantia = async (req, res, next) => {
    try {
        const estudiantes = await informacionEstudianteService.obtenerEstudiantesBuscanPasantia();
        res.status(200).json({
            success: true,
            data: estudiantes,
            message: 'Estudiantes que buscan pasantía obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};

// ======================================================
// GET - OBTENER ESTUDIANTES QUE BUSCAN MENTORÍA
// ======================================================
const obtenerEstudiantesBuscanMentoria = async (req, res, next) => {
    try {
        const estudiantes = await informacionEstudianteService.obtenerEstudiantesBuscanMentoria();
        res.status(200).json({
            success: true,
            data: estudiantes,
            message: 'Estudiantes que buscan mentoría obtenidos correctamente'
        });
    } catch (error) {
        next(error);
    }
};


// ======================================================
// GET - DIRECTORIO DE ESTUDIANTES (RF-05)
// Solo perfiles con perfil_completo = true y pausado = false
// ======================================================
const obtenerEstudiantesDirectorio = async (req, res, next) => {
    try {
        const estudiantes = await informacionEstudianteService.obtenerEstudiantesDirectorio();
        res.status(200).json({
            success: true,
            data: estudiantes,
            message: 'Directorio de estudiantes obtenido correctamente'
        });
    } catch (error) {
        next(error);
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
    obtenerEstudiantesBuscanMentoria,
    obtenerEstudiantesDirectorio
};
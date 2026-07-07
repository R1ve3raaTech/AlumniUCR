// Servicio de Fidelización y Gamificación para Exalumnos (Categoría 1)
// Cero cambios en base de datos: calcula datos dinámicamente en caliente.
// Sigue el patrón del proyecto de realizar consultas y agregar en código.

const supabase = require('../config/supabase');
const { mapDbError } = require('../utils/dbError');

/**
 * Genera el trasfondo simbólico, metáfora y reseña para un estudiante en el árbol.
 */
const obtenerSimbolismoEstudiante = (nombreEstudiante, idMatch) => {
    const simbolos = [
        {
            tipoSemilla: "Semilla de Innovación Tecnológica",
            icono: "rocket_launch",
            metafora: "Esta semilla representa el impulso de nuevas fronteras tecnológicas y arquitecturas de software eficientes.",
            resena: "Su guía técnica fue el pilar fundamental para resolver la arquitectura de microservicios de mi proyecto. ¡Eternamente agradecido por su dedicación y paciencia!",
            tesisStatus: "Tesis Laureada (100/100)",
            horasMentoria: 24,
            calificacion: 5,
        },
        {
            tipoSemilla: "Semilla de Impacto Científico",
            icono: "biotech",
            metafora: "Esta semilla germina en el rigor metodológico, la investigación profunda y el descubrimiento empírico.",
            resena: "Excelente mentor. Me brindó herramientas analíticas y metodológicas clave para la validación estadística de mis hipótesis de graduación.",
            tesisStatus: "Tesis Defendida con Éxito",
            horasMentoria: 18,
            calificacion: 4,
        },
        {
            tipoSemilla: "Semilla de Desarrollo Sostenible",
            icono: "forest",
            metafora: "Esta semilla promueve el equilibrio ecológico, la eficiencia de recursos y el bienestar de las comunidades.",
            resena: "Gracias a su orientación logré vincular mi propuesta teórica con las necesidades de sostenibilidad reales de la industria costarricense.",
            tesisStatus: "Tesis Aprobada (Mención de Honor)",
            horasMentoria: 30,
            calificacion: 5,
        },
        {
            tipoSemilla: "Semilla de Compromiso Social y Educación",
            icono: "local_library",
            metafora: "Esta semilla florece al compartir conocimiento, impulsando la igualdad de oportunidades y la educación inclusiva.",
            resena: "Su mentoría fue clave para poder plantear un diseño accesible que toma en cuenta a personas con discapacidad en nuestro sistema educativo.",
            tesisStatus: "Tesis Aprobada con Distinción",
            horasMentoria: 22,
            calificacion: 5,
        }
    ];

    const stringKey = idMatch ? String(idMatch) : String(nombreEstudiante);
    let hash = 0;
    for (let i = 0; i < stringKey.length; i++) {
        hash = stringKey.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % simbolos.length;
    return simbolos[idx];
};

/**
 * Obtiene el legado completo de un exalumno.
 * @param {string} userId - ID del usuario exalumno
 */
const obtenerLegadoExalumno = async (userId) => {
    try {
        // 1. Obtener usuario base, información de exalumno e historial de carreras
        const [usuarioRes, infoRes, carrerasRes] = await Promise.all([
            supabase.from('usuarios').select('id, nombre, created_at').eq('id', userId).maybeSingle(),
            supabase.from('informacion_exalumno').select('*').eq('id_usuario', userId).maybeSingle(),
            supabase.from('carreras_usuario').select('ano_graduacion').eq('id_usuario', userId)
        ]);

        if (usuarioRes.error) throw usuarioRes.error;
        if (infoRes.error) throw infoRes.error;
        if (carrerasRes.error) throw carrerasRes.error;

        const usuario = usuarioRes.data;
        if (!usuario) {
            const error = new Error('Usuario no encontrado');
            error.statusCode = 404;
            throw error;
        }

        const info = infoRes.data || {};
        const anioGraduacion = carrerasRes.data?.[0]?.ano_graduacion || null;

        // 2. Determinar ciclo de vida del exalumno
        const anosExp = info.anos_experiencia || 0;
        let etapa = 'Mentor Junior';
        let etapaDescripcion = 'En esta etapa tu enfoque principal es el networking, asesoría temprana y micro-mentorías rápidas. ¡Tu experiencia fresca de graduación es súper valiosa para los estudiantes!';
        let consejos = [
            'Ofrece micro-mentorías de 15 minutos para resolver dudas específicas.',
            'Ayuda a los estudiantes a preparar sus CVs y simulaciones de entrevistas.',
            'Conecta a los estudiantes con profesionales en tu red de contactos.'
        ];

        if (anosExp >= 5 && anosExp < 15) {
            etapa = 'Mentor Pleno';
            etapaDescripcion = 'Como Mentor Pleno, puedes orientar a estudiantes en inserción laboral, pasantías y TFGs vinculados con empresas del sector.';
            consejos = [
                'Propón proyectos prácticos de tu empresa como tema de TFG para los estudiantes.',
                'Ayuda a los estudiantes a comprender las dinámicas internas corporativas.',
                'Identifica oportunidades de pasantías o empleos en tu organización.'
            ];
        } else if (anosExp >= 15) {
            etapa = 'Mentor Emérito';
            etapaDescripcion = 'Tu amplia trayectoria te califica para guiar proyectos complejos de investigación, asesorar a nivel directivo y liderar comités de apoyo.';
            consejos = [
                'Brinda mentoría de largo plazo en proyectos de alta complejidad o innovación.',
                'Apoya financieramente proyectos de graduación o el fondo general de becas.',
                'Comparte lecciones de liderazgo e impulsa la transferencia cultural.'
            ];
        }

        const cicloVida = {
            etapa,
            etapaDescripcion,
            anosExperiencia: anosExp,
            anioGraduacion,
            consejos
        };

        // 3. Obtener donaciones confirmadas del exalumno
        // Unimos con proyecto_graduacion para ver a qué proyectos apoyó
        const donacionesRes = await supabase
            .from('donaciones')
            .select(`
                id, monto, moneda, estado, created_at, id_proyecto,
                proyecto:proyecto_graduacion!donaciones_id_proyecto_fkey (id, titulo_proyecto)
            `)
            .eq('id_usuario_exalumno', userId)
            .eq('estado', 'confirmada');

        if (donacionesRes.error) throw donacionesRes.error;
        const donaciones = donacionesRes.data || [];

        // 4. Obtener matches de mentoría
        // Unimos con la información del estudiante
        const matchesRes = await supabase
            .from('matches_mentoria')
            .select(`
                id, score_match, estado, iniciado_por, resultado, created_at, updated_at,
                estudiante:usuarios!matches_mentoria_id_estudiante_fkey (id, nombre, correo_electronico)
            `)
            .eq('id_exalumno', userId)
            .in('estado', ['contactado', 'activo', 'cerrado']);

        if (matchesRes.error) throw matchesRes.error;
        const matches = matchesRes.data || [];

        // Para enriquecer el proyecto de graduación de cada estudiante en los matches
        let proyectosEstudiantes = [];
        if (matches.length > 0) {
            const estudianteIds = matches.map(m => m.estudiante.id);
            const proyectosRes = await supabase
                .from('proyecto_graduacion')
                .select('id, id_estudiante, titulo_proyecto')
                .in('id_estudiante', estudianteIds);
            
            if (!proyectosRes.error) {
                proyectosEstudiantes = proyectosRes.data || [];
            }
        }
        const proyectoMap = new Map(proyectosEstudiantes.map(p => [p.id_estudiante, p.titulo_proyecto]));
        const proyectoIdMap = new Map(proyectosEstudiantes.map(p => [p.id_estudiante, p.id]));

        // 5. Construir Línea de Tiempo del Legado
        const hitos = [];

        // Hito de registro
        hitos.push({
            tipo: 'registro',
            titulo: 'Ingreso a Conectando Talento',
            descripcion: 'Te registraste en la plataforma para sumarte a la red de apoyo UCR.',
            fecha: usuario.created_at,
            icono: 'hail'
        });

        // Hitos de donaciones
        donaciones.forEach(d => {
            const tituloProy = d.proyecto?.titulo_proyecto || 'el Fondo General';
            hitos.push({
                tipo: 'donacion',
                titulo: 'Donación Confirmada',
                descripcion: `Aportaste un monto de ${d.monto.toLocaleString()} ${d.moneda} para apoyar a ${tituloProy}.`,
                fecha: d.created_at,
                icono: 'volunteer_activism'
            });
        });

        // Hitos de matches
        matches.forEach(m => {
            const tituloProy = proyectoMap.get(m.estudiante.id) || 'su Proyecto de Graduación';
            
            if (m.estado === 'contactado') {
                const quien = m.iniciado_por === 'exalumno' ? 'Iniciaste' : `Recibiste`;
                const accion = m.iniciado_por === 'exalumno' ? 'ofrecerle' : 'solicitando';
                hitos.push({
                    tipo: 'contacto',
                    titulo: 'Contacto Solicitado',
                    descripcion: `${quien} contacto con ${m.estudiante.nombre} ${accion} apoyo de mentoría o guía académica.`,
                    fecha: m.created_at,
                    icono: 'handshake'
                });
            } else if (m.estado === 'activo') {
                hitos.push({
                    tipo: 'conexion',
                    titulo: 'Conexión Establecida',
                    descripcion: `Aceptaste colaborar con ${m.estudiante.nombre} en su proyecto: "${tituloProy}".`,
                    fecha: m.updated_at,
                    icono: 'verified_user'
                });
            } else if (m.estado === 'cerrado' && m.resultado === 'exitoso') {
                hitos.push({
                    tipo: 'exito',
                    titulo: 'Mentoría Exitosa',
                    descripcion: `¡Misión cumplida! Completaste exitosamente el apoyo a ${m.estudiante.nombre} para su proyecto: "${tituloProy}".`,
                    fecha: m.updated_at,
                    icono: 'workspace_premium'
                });
            }
        });

        // Ordenar hitos por fecha descendente
        hitos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // 6. Calcular Insignias
        const matchesExitosos = matches.filter(m => m.estado === 'cerrado' && m.resultado === 'exitoso').length;
        const matchesActivos = matches.filter(m => m.estado === 'activo').length;
        const totalDonado = donaciones.reduce((sum, d) => sum + Number(d.monto), 0);

        const listadoInsignias = [
            {
                id: 'pionero',
                nombre: 'Pionero UCR',
                descripcion: 'Registrado en la plataforma de exalumnos.',
                desbloqueado: true,
                icono: 'hail',
                categoria: 'bronce'
            },
            {
                id: 'mecenas',
                nombre: 'Mecenas Solidario',
                descripcion: 'Has realizado al menos una donación económica confirmada.',
                desbloqueado: donaciones.length > 0,
                icono: 'volunteer_activism',
                categoria: 'bronce'
            },
            {
                id: 'mentor_activo',
                nombre: 'Faro Académico',
                descripcion: 'Tienes al menos una mentoría activa con un estudiante.',
                desbloqueado: matchesActivos > 0,
                icono: 'local_library',
                categoria: 'plata'
            },
            {
                id: 'mentor_oro',
                nombre: 'Mentor de Oro',
                descripcion: 'Has guiado exitosamente a un estudiante hasta finalizar su proyecto.',
                desbloqueado: matchesExitosos > 0,
                icono: 'workspace_premium',
                categoria: 'oro'
            },
            {
                id: 'gran_impacto',
                nombre: 'Escudo del Legado',
                descripcion: 'Completaste 3+ mentorías exitosas o donaste un total superior a 250,000 CRC.',
                desbloqueado: matchesExitosos >= 3 || totalDonado >= 250000,
                icono: 'shield_with_heart',
                categoria: 'platino'
            }
        ];

        // 7. Árbol de Impacto Multigeneracional
        // Buscamos si el usuario actual fue estudiante alguna vez (id_estudiante = userId)
        const raizRes = await supabase
            .from('matches_mentoria')
            .select(`
                id_exalumno,
                exalumno:usuarios!matches_mentoria_id_exalumno_fkey (nombre, correo_electronico)
            `)
            .eq('id_estudiante', userId)
            .eq('estado', 'cerrado')
            .eq('resultado', 'exitoso')
            .maybeSingle();

        const mentorRaiz = raizRes.data ? {
            nombre: raizRes.data.exalumno.nombre,
            correo: raizRes.data.exalumno.correo_electronico
        } : null;

        // Buscamos los estudiantes que este exalumno ha mentoreado
        const misEstudiantes = matches
            .filter(m => m.estado === 'activo' || (m.estado === 'cerrado' && m.resultado === 'exitoso'))
            .map(m => {
                const proyecto = proyectoMap.get(m.estudiante.id) || 'Proyecto de Graduación';
                const proyId = proyectoIdMap.get(m.estudiante.id) || null;
                const donacionesAlProyecto = proyId 
                    ? donaciones.filter(d => d.id_proyecto === proyId)
                    : [];
                const totalDonadoVal = donacionesAlProyecto.reduce((sum, d) => sum + Number(d.monto), 0);
                const simbolismo = obtenerSimbolismoEstudiante(m.estudiante.nombre, m.id);

                return {
                    id: m.estudiante.id,
                    nombre: m.estudiante.nombre,
                    correo: m.estudiante.correo_electronico,
                    estadoMatch: m.estado,
                    tipoApoyo: totalDonadoVal > 0 ? "Apoyo Económico & Co-Creación" : (simbolismo.tipoSemilla.includes("Tecnológica") ? "Mentoría Técnica" : "Mentoría de TFG"),
                    scoreMatch: m.score_match,
                    proyecto,
                    totalDonado: totalDonadoVal,
                    fechaInicio: m.created_at,
                    fechaFin: m.updated_at,
                    ...simbolismo
                };
            });

        // Para ver si alguno de esos estudiantes se convirtió en mentor de alguien más
        let ramasEstudiantes = [];
        if (misEstudiantes.length > 0) {
            const idsMisEstudiantes = misEstudiantes.map(e => e.id);
            const hijosMatchesRes = await supabase
                .from('matches_mentoria')
                .select(`
                    id_exalumno,
                    estudiante:usuarios!matches_mentoria_id_estudiante_fkey (nombre)
                `)
                .in('id_exalumno', idsMisEstudiantes)
                .in('estado', ['activo', 'cerrado']);

            if (!hijosMatchesRes.error) {
                const hijosMatches = hijosMatchesRes.data || [];
                ramasEstudiantes = misEstudiantes.map(e => {
                    const mentoreadosPorEl = hijosMatches
                        .filter(h => h.id_exalumno === e.id)
                        .map(h => h.estudiante.nombre);
                    return {
                        ...e,
                        hijos: mentoreadosPorEl,
                        esMentorActivo: mentoreadosPorEl.length > 0
                    };
                });
            } else {
                ramasEstudiantes = misEstudiantes.map(e => ({ ...e, hijos: [], esMentorActivo: false }));
            }
        }

        const totalSemillasReal = matches.filter(m => m.estado === 'activo' || (m.estado === 'cerrado' && m.resultado === 'exitoso')).length;
        const totalDonadoReal = donaciones.reduce((sum, d) => sum + Number(d.monto), 0);
        const esDemo = totalSemillasReal === 0 && totalDonadoReal === 0;

        const totalHorasReal = matches
            .filter(m => m.estado === 'activo' || (m.estado === 'cerrado' && m.resultado === 'exitoso'))
            .reduce((sum, m) => {
                const simbolismo = obtenerSimbolismoEstudiante(m.estudiante.nombre, m.id);
                return sum + (simbolismo.horasMentoria || 0);
            }, 0);

        // Puntos de Logro / XP (sistema PlayStation)
        const xpDeDonacionesTotales = Math.floor(totalDonadoReal / 50000) * 20;
        const xpDeMatchesActivos = matchesActivos * 15;
        const xpDeMatchesExitosos = matchesExitosos * 50;
        const xpDeDonacionesIndividuales = donaciones.length * 30;
        
        const xpTotal = 10 + xpDeDonacionesTotales + xpDeMatchesActivos + xpDeMatchesExitosos + xpDeDonacionesIndividuales; // 10 XP base por registro
        
        // Rango y Nivel
        let rango = 'Junior';
        let siguienteRango = 'Senior';
        let xpNecesaria = 100;
        let porcentajeProgreso = Math.min(Math.round((xpTotal / 100) * 100), 100);

        if (xpTotal >= 100 && xpTotal < 300) {
            rango = 'Senior';
            siguienteRango = 'Master Boss';
            xpNecesaria = 300;
            porcentajeProgreso = Math.min(Math.round(((xpTotal - 100) / 200) * 100), 100);
        } else if (xpTotal >= 300) {
            rango = 'Master Boss';
            siguienteRango = 'Máximo Rango';
            xpNecesaria = 300;
            porcentajeProgreso = 100;
        }

        const trofeos = {
            bronce: listadoInsignias.filter(i => i.desbloqueado && i.categoria === 'bronce').length,
            plata: listadoInsignias.filter(i => i.desbloqueado && i.categoria === 'plata').length,
            oro: listadoInsignias.filter(i => i.desbloqueado && i.categoria === 'oro').length,
            platino: listadoInsignias.filter(i => i.desbloqueado && i.categoria === 'platino').length
        };

        const resumen = {
            totalSemillas: esDemo ? 4 : totalSemillasReal,
            totalHoras: esDemo ? 76 : totalHorasReal,
            totalDonado: esDemo ? 500000 : totalDonadoReal,
            esDemo,
            xp: esDemo ? 75 : xpTotal,
            rango: esDemo ? 'Junior' : rango,
            siguienteRango: esDemo ? 'Senior' : siguienteRango,
            xpNecesaria: esDemo ? 100 : xpNecesaria,
            porcentajeProgreso: esDemo ? 75 : porcentajeProgreso,
            trofeos: esDemo ? { bronce: 2, plata: 1, oro: 1, platino: 0 } : trofeos
        };

        // Datos de prueba para demostración si el árbol está vacío y es demo
        let finalRamas = ramasEstudiantes;
        let finalMentorRaiz = mentorRaiz;
        if (finalRamas.length === 0 && esDemo) {
            finalMentorRaiz = {
                nombre: "Dra. Ana María Trejos",
                correo: "ana.trejos@ucr.ac.cr"
            };
            finalRamas = [
                {
                    id: "test-valeria",
                    nombre: "Valeria Mora Castro",
                    correo: "valeria.mora@ucr.ac.cr",
                    estadoMatch: "cerrado",
                    resultadoMatch: "exitoso",
                    tipoApoyo: "Mentoría de TFG",
                    scoreMatch: 98,
                    proyecto: "Sistema IoT de Monitoreo Hídrico de Precisión para Zonas Agrícolas de Costa Rica",
                    totalDonado: 150000,
                    fechaInicio: "2025-04-10T12:00:00Z",
                    fechaFin: "2025-11-20T12:00:00Z",
                    tipoSemilla: "Semilla de Desarrollo Sostenible",
                    icono: "forest",
                    metafora: "Esta semilla promueve el equilibrio ecológico, la eficiencia de recursos y el bienestar de las comunidades.",
                    resena: "Gracias a su orientación logré vincular mi propuesta teórica con las necesidades de sostenibilidad reales de la industria costarricense.",
                    tesisStatus: "Tesis Laureada (100/100)",
                    horasMentoria: 30,
                    hijos: ["Felipe Rojas", "Sofía Delgado"],
                    esMentorActivo: true
                },
                {
                    id: "test-esteban",
                    nombre: "Esteban Quirós Solano",
                    correo: "esteban.quiros@ucr.ac.cr",
                    estadoMatch: "activo",
                    resultadoMatch: null,
                    tipoApoyo: "Mentoría Técnica",
                    scoreMatch: 94,
                    proyecto: "Optimización de Algoritmos Criptográficos Ligeros para Dispositivos Médicos Conectados",
                    totalDonado: 0,
                    fechaInicio: "2026-02-15T09:00:00Z",
                    fechaFin: null,
                    tipoSemilla: "Semilla de Innovación Tecnológica",
                    icono: "rocket_launch",
                    metafora: "Esta semilla representa el impulso de nuevas fronteras tecnológicas y arquitecturas de software eficientes.",
                    resena: "Su guía técnica fue el pilar fundamental para resolver la arquitectura de microservicios de mi proyecto. ¡Eternamente agradecido por su dedicación y paciencia!",
                    tesisStatus: "Tesis en Curso (Desarrollo)",
                    horasMentoria: 24,
                    hijos: [],
                    esMentorActivo: false
                },
                {
                    id: "test-mariela",
                    nombre: "Mariela Castro Vega",
                    correo: "mariela.castro@ucr.ac.cr",
                    estadoMatch: "cerrado",
                    resultadoMatch: "exitoso",
                    tipoApoyo: "Apoyo Económico & Co-Creación",
                    scoreMatch: 96,
                    proyecto: "Diseño Adaptativo de un Sistema de Aprendizaje Inclusivo para Niños con TDAH",
                    totalDonado: 100000,
                    fechaInicio: "2025-05-18T14:00:00Z",
                    fechaFin: "2025-12-10T14:00:00Z",
                    tipoSemilla: "Semilla de Compromiso Social y Educación",
                    icono: "local_library",
                    metafora: "Esta semilla florece al compartir conocimiento, impulsando la igualdad de oportunidades y la educación inclusiva.",
                    resena: "Su mentoría fue clave para poder plantear un diseño accesible que toma en cuenta a personas con discapacidad en nuestro sistema educativo.",
                    tesisStatus: "Tesis Aprobada con Distinción",
                    horasMentoria: 22,
                    hijos: ["David Alfaro"],
                    esMentorActivo: true
                }
            ];
        }

        const arbolImpacto = {
            mentorRaiz: finalMentorRaiz,
            ramas: finalRamas
        };

        // 8. Portafolio de Co-Creación
        const portafolio = matches
            .filter(m => m.estado === 'cerrado' && m.resultado === 'exitoso')
            .map(m => ({
                idMatch: m.id,
                nombreEstudiante: m.estudiante.nombre,
                tituloProyecto: proyectoMap.get(m.estudiante.id) || 'Proyecto de Graduación',
                fechaCierre: m.updated_at,
                compartirTexto: `Orgulloso de haber colaborado como mentor de la Fundación Exalumnos UCR en el proyecto "${proyectoMap.get(m.estudiante.id) || 'TFG'}" desarrollado por ${m.estudiante.nombre}. ¡Apoyando al talento de Costa Rica! 🇨🇷 #OrgulloUCR`
            }));

        return {
            cicloVida,
            hitos,
            insignias: listadoInsignias,
            arbolImpacto,
            portafolio,
            resumen
        };
    } catch (error) {
        throw mapDbError(error);
    }
};

/**
 * Obtiene los leaderboards globales de fidelización (desafíos por generación y facultad).
 */
const obtenerLeaderboards = async () => {
    try {
        // Obtenemos todos los exalumnos activos para agregar en JS
        const [carrerasUsuariosRes, donacionesRes, matchesRes, infoExalumnosRes] = await Promise.all([
            supabase.from('carreras_usuario').select('id_usuario, ano_graduacion'),
            supabase.from('donaciones').select('id_usuario_exalumno, monto, moneda').eq('estado', 'confirmada'),
            supabase.from('matches_mentoria').select('id_exalumno').in('estado', ['activo', 'cerrado']),
            supabase.from('informacion_exalumno').select('id_usuario, escuela_facultad').eq('estado', true)
        ]);

        if (carrerasUsuariosRes.error) throw carrerasUsuariosRes.error;
        if (donacionesRes.error) throw donacionesRes.error;
        if (matchesRes.error) throw matchesRes.error;
        if (infoExalumnosRes.error) throw infoExalumnosRes.error;

        const carreras = carrerasUsuariosRes.data || [];
        const donaciones = donacionesRes.data || [];
        const matches = matchesRes.data || [];
        const infoExalumnos = infoExalumnosRes.data || [];

        // Mapear cada exalumno a su año de graduación y su facultad
        const usuarioGraduacionMap = new Map(carreras.map(c => [c.id_usuario, c.ano_graduacion]));
        const usuarioFacultadMap = new Map(infoExalumnos.map(i => [i.id_usuario, i.escuela_facultad]));

        // Inicializar contenedores de agregación
        const genStats = {}; // { '1995': { mentores: 0, donadoCRC: 0, matches: 0 } }
        const facStats = {}; // { 'Ingeniería': { mentores: 0, donadoCRC: 0, matches: 0 } }

        // 1. Contabilizar mentores por generación y facultad
        infoExalumnos.forEach(info => {
            const gen = usuarioGraduacionMap.get(info.id_usuario);
            const fac = info.escuela_facultad;

            if (gen) {
                const sGen = String(gen);
                if (!genStats[sGen]) genStats[sGen] = { gen: sGen, mentores: 0, donadoCRC: 0, matches: 0 };
                genStats[sGen].mentores += 1;
            }

            if (fac && fac !== '—') {
                if (!facStats[fac]) facStats[fac] = { facultad: fac, mentores: 0, donadoCRC: 0, matches: 0 };
                facStats[fac].mentores += 1;
            }
        });

        // 2. Contabilizar donaciones (conversión simple: 1 USD = 520 CRC para fines del ranking)
        donaciones.forEach(d => {
            const gen = usuarioGraduacionMap.get(d.id_usuario_exalumno);
            const fac = usuarioFacultadMap.get(d.id_usuario_exalumno);

            const montoCRC = d.moneda === 'CRC' ? Number(d.monto) : Number(d.monto) * 520;

            if (gen) {
                const sGen = String(gen);
                if (!genStats[sGen]) genStats[sGen] = { gen: sGen, mentores: 0, donadoCRC: 0, matches: 0 };
                genStats[sGen].donadoCRC += montoCRC;
            }

            if (fac && fac !== '—') {
                if (!facStats[fac]) facStats[fac] = { facultad: fac, mentores: 0, donadoCRC: 0, matches: 0 };
                facStats[fac].donadoCRC += montoCRC;
            }
        });

        // 3. Contabilizar matches
        matches.forEach(m => {
            const gen = usuarioGraduacionMap.get(m.id_exalumno);
            const fac = usuarioFacultadMap.get(m.id_exalumno);

            if (gen) {
                const sGen = String(gen);
                if (!genStats[sGen]) genStats[sGen] = { gen: sGen, mentores: 0, donadoCRC: 0, matches: 0 };
                genStats[sGen].matches += 1;
            }

            if (fac && fac !== '—') {
                if (!facStats[fac]) facStats[fac] = { facultad: fac, mentores: 0, donadoCRC: 0, matches: 0 };
                facStats[fac].matches += 1;
            }
        });

        // Convertir a arrays y ordenar para obtener los TOP 3
        const leaderboardGeneraciones = Object.values(genStats)
            .map(g => ({
                ...g,
                donadoFormateado: `${Math.round(g.donadoCRC).toLocaleString()} CRC`,
                scoreTotal: g.matches * 10 + g.mentores * 5 + Math.round(g.donadoCRC / 10000) // Puntuación combinada
            }))
            .sort((a, b) => b.scoreTotal - a.scoreTotal)
            .slice(0, 5);

        const leaderboardFacultades = Object.values(facStats)
            .map(f => ({
                ...f,
                donadoFormateado: `${Math.round(f.donadoCRC).toLocaleString()} CRC`,
                scoreTotal: f.matches * 10 + f.mentores * 5 + Math.round(f.donadoCRC / 10000)
            }))
            .sort((a, b) => b.scoreTotal - a.scoreTotal)
            .slice(0, 5);

        return {
            generaciones: leaderboardGeneraciones,
            facultades: leaderboardFacultades
        };
    } catch (error) {
        throw mapDbError(error);
    }
};

module.exports = {
    obtenerLegadoExalumno,
    obtenerLeaderboards
};

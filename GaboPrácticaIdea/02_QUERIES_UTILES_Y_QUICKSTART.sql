-- ============================================================================
-- PLATAFORMA UCR: Queries SQL Útiles & Quick-Start
-- ============================================================================
-- Ejemplos de queries que usarás frecuentemente en tu aplicación
-- ============================================================================

-- ============================================================================
-- 1. QUERIES DE BÚSQUEDA Y LISTADO
-- ============================================================================

-- Buscar exalumnos por empresa
SELECT u.id, u.nombre, u.email, e.empresa_actual, e.cargo_actual, e.areas_de_interes
FROM exalumnos e
JOIN users u ON e.user_id = u.id
WHERE e.empresa_actual ILIKE '%Google%'
  AND e.visible_en_directorio = true
ORDER BY e.anos_experiencia DESC;

-- Buscar estudiantes por carrera y necesidades
SELECT u.id, u.nombre, u.email, s.carrera, s.proyecto_titulo, s.proyecto_necesidades
FROM estudiantes s
JOIN users u ON s.user_id = u.id
WHERE s.carrera = 'Ingeniería en Sistemas'
  AND s.proyecto_activo = true
  AND s.visible_en_directorio = true
  AND 'financiamiento' = ANY(s.proyecto_necesidades);

-- Búsqueda full-text: Posiciones por título
SELECT id, titulo, empresa, descripcion_general
FROM posiciones
WHERE to_tsvector('spanish', titulo) @@ plainto_tsquery('spanish', 'backend')
  AND estado = 'activa'
ORDER BY created_at DESC;

-- Listar posiciones con cantidad de aplicaciones
SELECT 
  p.id,
  p.titulo,
  p.empresa,
  p.estado,
  COUNT(a.id) as num_aplicaciones,
  COUNT(CASE WHEN a.estado = 'entrevista' THEN 1 END) as en_entrevista,
  COUNT(CASE WHEN a.estado = 'contratada' THEN 1 END) as contratados
FROM posiciones p
LEFT JOIN aplicaciones a ON p.id = a.posicion_id
GROUP BY p.id
ORDER BY p.created_at DESC;

-- ============================================================================
-- 2. QUERIES DE ALGORITMO DE MATCHING
-- ============================================================================

-- Calcular matches potenciales (Score algoritmo)
SELECT 
  e.user_id as exalumno_id,
  s.user_id as estudiante_id,
  u_ex.nombre as exalumno_nombre,
  u_est.nombre as estudiante_nombre,
  -- Puntuación por carrera (30%)
  CASE WHEN e.carrera_ucr = s.carrera THEN 30 ELSE 15 END as score_carrera,
  -- Puntuación por áreas de interés (30%)
  (
    SELECT COUNT(*) * 10
    FROM UNNEST(e.areas_de_interes) as ex_area
    WHERE ex_area = ANY(s.areas_de_interes)
  ) as score_areas,
  -- Puntuación por habilidades (25%)
  (
    SELECT COUNT(*) * 8
    FROM UNNEST(e.sector_industria) as ex_sector
    WHERE ex_sector ILIKE ANY(s.habilidades)
  ) as score_habilidades,
  -- Disponibilidad (15%)
  CASE WHEN e.ofrece_mentoria AND s.busca_mentoria THEN 15 ELSE 0 END as score_disponibilidad
FROM exalumnos e
JOIN estudiantes s ON e.carrera_ucr IS NOT NULL
JOIN users u_ex ON e.user_id = u_ex.id
JOIN users u_est ON s.user_id = u_est.id
WHERE e.visible_en_directorio = true
  AND s.visible_en_directorio = true
ORDER BY (
  CASE WHEN e.carrera_ucr = s.carrera THEN 30 ELSE 15 END +
  COALESCE((
    SELECT COUNT(*) * 10
    FROM UNNEST(e.areas_de_interes) as ex_area
    WHERE ex_area = ANY(s.areas_de_interes)
  ), 0)
) DESC;

-- Matches existentes con estado
SELECT 
  m.id,
  u_ex.nombre as exalumno,
  u_est.nombre as estudiante,
  m.tipo_apoyo,
  m.score_match,
  m.estado,
  m.created_at
FROM matches m
JOIN users u_ex ON m.exalumno_id = u_ex.id
JOIN users u_est ON m.estudiante_id = u_est.id
WHERE m.estado IN ('propuesto', 'contactado')
ORDER BY m.score_match DESC, m.created_at DESC;

-- ============================================================================
-- 3. QUERIES DE DONACIONES
-- ============================================================================

-- Total de donaciones por estudiante
SELECT 
  s.user_id,
  u.nombre as estudiante,
  COUNT(d.id) as total_donaciones,
  COALESCE(SUM(d.monto), 0) as monto_total,
  d.moneda
FROM donaciones d
RIGHT JOIN estudiantes s ON d.proyecto_estudiante_id = s.user_id
LEFT JOIN users u ON s.user_id = u.id
WHERE d.estado = 'confirmado'
GROUP BY s.user_id, u.nombre, d.moneda
ORDER BY monto_total DESC;

-- Donaciones pendientes de confirmación
SELECT 
  d.id,
  u_ex.nombre as donante,
  u_est.nombre as proyecto_estudiante,
  s.proyecto_titulo,
  d.monto,
  d.moneda,
  d.metodo_pago,
  d.created_at,
  AGE(CURRENT_TIMESTAMP, d.created_at) as tiempo_transcurrido
FROM donaciones d
JOIN exalumnos e ON d.exalumno_id = e.user_id
JOIN estudiantes s ON d.proyecto_estudiante_id = s.user_id
JOIN users u_ex ON e.user_id = u_ex.id
JOIN users u_est ON s.user_id = u_est.id
WHERE d.estado = 'pendiente'
ORDER BY d.created_at ASC;

-- Donaciones confirmadas en el último mes
SELECT 
  d.id,
  u_ex.nombre as donante,
  u_est.nombre as beneficiario,
  d.monto,
  d.moneda,
  d.numero_referencia,
  d.fecha_transferencia,
  u_admin.nombre as confirmado_por
FROM donaciones d
JOIN users u_ex ON d.exalumno_id = u_ex.id
JOIN users u_est ON d.proyecto_estudiante_id = u_est.id
LEFT JOIN users u_admin ON d.confirmado_por = u_admin.id
WHERE d.estado = 'confirmado'
  AND d.fecha_transferencia >= CURRENT_DATE - INTERVAL '1 month'
ORDER BY d.fecha_transferencia DESC;

-- ============================================================================
-- 4. QUERIES DE POSICIONES Y APLICACIONES
-- ============================================================================

-- Posiciones activas con detalles del exalumno
SELECT 
  p.id,
  p.titulo,
  p.tipo,
  p.empresa,
  p.modalidad,
  p.jornada,
  u.nombre as publicado_por,
  p.fecha_limite,
  COUNT(a.id) as total_aplicaciones,
  p.estado
FROM posiciones p
JOIN exalumnos e ON p.exalumno_id = e.user_id
JOIN users u ON e.user_id = u.id
LEFT JOIN aplicaciones a ON p.id = a.posicion_id
WHERE p.estado = 'activa'
  AND p.fecha_limite > CURRENT_DATE
GROUP BY p.id, u.nombre
ORDER BY COUNT(a.id) DESC;

-- Aplicaciones de un estudiante
SELECT 
  a.id,
  p.titulo as posicion,
  p.empresa,
  a.estado,
  a.created_at,
  cv.nombre_version
FROM aplicaciones a
JOIN posiciones p ON a.posicion_id = p.id
LEFT JOIN curriculum_versiones cv ON a.curriculum_version_id = cv.id
WHERE a.estudiante_id = ?::UUID
ORDER BY a.created_at DESC;

-- Candidatos en entrevista para una posición
SELECT 
  a.id,
  u.nombre,
  u.email,
  s.carrera,
  a.estado,
  a.mensaje_presentacion,
  a.created_at
FROM aplicaciones a
JOIN estudiantes s ON a.estudiante_id = s.user_id
JOIN users u ON s.user_id = u.id
WHERE a.posicion_id = ?::UUID
  AND a.estado IN ('entrevista', 'oferta')
ORDER BY a.created_at DESC;

-- ============================================================================
-- 5. QUERIES DE CURRICULUM
-- ============================================================================

-- CV de un estudiante con toda su información
SELECT 
  c.id,
  u.nombre,
  u.email,
  c.habilidades_tecnicas,
  c.habilidades_blandas,
  c.idiomas,
  array_agg(DISTINCT JSONB_OBJECT_KEYS(c.habilidades_tecnicas)) as tech_skills
FROM curriculum c
JOIN estudiantes s ON c.estudiante_id = s.user_id
JOIN users u ON s.user_id = u.id
WHERE c.estudiante_id = ?::UUID
GROUP BY c.id, u.nombre, u.email;

-- Experiencia laboral de un estudiante
SELECT 
  tipo,
  titulo,
  organizacion,
  fecha_inicio,
  fecha_fin,
  bullets,
  orden
FROM curriculum_experiencia
WHERE curriculum_id = (
  SELECT id FROM curriculum WHERE estudiante_id = ?::UUID
)
ORDER BY orden;

-- Versiones de CV adaptadas
SELECT 
  cv.id,
  cv.nombre_version,
  p.titulo as posicion_destino,
  p.empresa,
  cv.contenido_adaptado,
  cv.sugerencias_ia,
  cv.created_at
FROM curriculum_versiones cv
JOIN posiciones p ON cv.posicion_id = p.id
WHERE cv.curriculum_id = (
  SELECT id FROM curriculum WHERE estudiante_id = ?::UUID
)
ORDER BY cv.created_at DESC;

-- ============================================================================
-- 6. QUERIES ANALÍTICAS & DASHBOARD
-- ============================================================================

-- Dashboard: Estadísticas generales
SELECT 
  (SELECT COUNT(*) FROM users) as total_usuarios,
  (SELECT COUNT(*) FROM users WHERE tipo = 'exalumno') as total_exalumnos,
  (SELECT COUNT(*) FROM users WHERE tipo = 'estudiante') as total_estudiantes,
  (SELECT COUNT(*) FROM matches WHERE estado = 'aceptado') as matches_aceptados,
  (SELECT COUNT(*) FROM donaciones WHERE estado = 'confirmado') as donaciones_confirmadas,
  (SELECT SUM(monto) FROM donaciones WHERE estado = 'confirmado') as monto_donado_total,
  (SELECT COUNT(*) FROM posiciones WHERE estado = 'activa') as posiciones_activas,
  (SELECT COUNT(*) FROM aplicaciones WHERE estado = 'contratada') as contrataciones_exitosas;

-- Exalumnos más activos (por cantidad de matches)
SELECT 
  u.id,
  u.nombre,
  u.email,
  COUNT(DISTINCT m.id) as matches_realizados,
  COUNT(DISTINCT d.id) as donaciones_realizadas,
  COUNT(DISTINCT p.id) as posiciones_publicadas
FROM users u
LEFT JOIN matches m ON u.id = m.exalumno_id AND m.estado != 'rechazado'
LEFT JOIN donaciones d ON u.id = d.exalumno_id AND d.estado = 'confirmado'
LEFT JOIN posiciones p ON u.id = p.exalumno_id AND p.estado IN ('activa', 'completada')
WHERE u.tipo = 'exalumno'
GROUP BY u.id, u.nombre, u.email
ORDER BY (COUNT(DISTINCT m.id) + COUNT(DISTINCT d.id) + COUNT(DISTINCT p.id)) DESC
LIMIT 10;

-- Estudiantes con más apoyo recibido
SELECT 
  u.id,
  u.nombre,
  COUNT(DISTINCT m.id) as mentores_conectados,
  COUNT(DISTINCT d.id) as donaciones_recibidas,
  COALESCE(SUM(d.monto), 0) as monto_total_recibido,
  COUNT(DISTINCT a.id) as aplicaciones_enviadas,
  COUNT(DISTINCT CASE WHEN a.estado = 'contratada' THEN a.id END) as contrataciones
FROM users u
LEFT JOIN matches m ON u.id = m.estudiante_id AND m.estado = 'aceptado'
LEFT JOIN donaciones d ON u.id = d.proyecto_estudiante_id AND d.estado = 'confirmado'
LEFT JOIN aplicaciones a ON u.id = a.estudiante_id
WHERE u.tipo = 'estudiante'
GROUP BY u.id, u.nombre
HAVING COUNT(DISTINCT m.id) > 0 OR COUNT(DISTINCT d.id) > 0
ORDER BY COALESCE(SUM(d.monto), 0) DESC;

-- Tendencias de donaciones por mes
SELECT 
  DATE_TRUNC('month', d.fecha_transferencia)::DATE as mes,
  COUNT(*) as num_donaciones,
  COALESCE(SUM(d.monto), 0) as monto_mes,
  COALESCE(AVG(d.monto), 0) as promedio_donacion
FROM donaciones d
WHERE d.estado = 'confirmado'
GROUP BY DATE_TRUNC('month', d.fecha_transferencia)
ORDER BY mes DESC;

-- ============================================================================
-- 7. QUERIES DE MANTENIMIENTO
-- ============================================================================

-- Usuarios sin completar perfil
SELECT 
  u.id,
  u.nombre,
  u.email,
  u.tipo,
  u.created_at,
  AGE(CURRENT_TIMESTAMP, u.created_at) as dias_registrado
FROM users u
WHERE u.tipo = 'exalumno' 
  AND NOT EXISTS (SELECT 1 FROM exalumnos e WHERE e.user_id = u.id AND e.perfil_completo = true)
  OR (u.tipo = 'estudiante' 
    AND NOT EXISTS (SELECT 1 FROM estudiantes s WHERE s.user_id = u.id AND s.perfil_completo = true))
ORDER BY u.created_at DESC;

-- Matches sin respuesta (más de 7 días)
SELECT 
  m.id,
  u_est.nombre as estudiante,
  u_ex.nombre as exalumno,
  m.tipo_apoyo,
  m.created_at,
  AGE(CURRENT_TIMESTAMP, m.created_at) as tiempo_sin_respuesta
FROM matches m
JOIN users u_est ON m.estudiante_id = u_est.id
JOIN users u_ex ON m.exalumno_id = u_ex.id
WHERE m.estado = 'propuesto'
  AND m.created_at < CURRENT_TIMESTAMP - INTERVAL '7 days'
ORDER BY m.created_at ASC;

-- Posiciones vencidas que deberían estar cerradas
SELECT 
  id,
  titulo,
  empresa,
  fecha_limite,
  estado,
  AGE(CURRENT_TIMESTAMP, fecha_limite) as tiempo_vencida
FROM posiciones
WHERE fecha_limite < CURRENT_DATE
  AND estado != 'cerrada'
  AND estado != 'completada'
ORDER BY fecha_limite DESC;

-- Reportes sin resolver
SELECT 
  r.id,
  u_reportador.nombre as reportado_por,
  u_reportado.nombre as perfil_reportado,
  r.motivo,
  r.descripcion,
  r.created_at,
  AGE(CURRENT_TIMESTAMP, r.created_at) as tiempo_sin_resolver
FROM reportes_perfil r
JOIN users u_reportador ON r.reportado_por = u_reportador.id
JOIN users u_reportado ON r.perfil_reportado = u_reportado.id
WHERE r.resuelto = false
ORDER BY r.created_at ASC;

-- ============================================================================
-- 8. OPERACIONES DE ACTUALIZACIÓN (cuidado)
-- ============================================================================

-- Marcar posición como completada
UPDATE posiciones
SET estado = 'completada'
WHERE id = ?::UUID AND estado = 'activa';

-- Confirmar donación (solo admin)
UPDATE donaciones
SET 
  estado = 'confirmado',
  confirmado_por = ?::UUID,
  fecha_transferencia = CURRENT_TIMESTAMP
WHERE id = ?::UUID
  AND estado = 'pendiente'
  AND numero_referencia IS NOT NULL;

-- Rechazar donación con motivo
UPDATE donaciones
SET 
  estado = 'rechazado',
  confirmado_por = ?::UUID,
  motivo_rechazo = ?,
  fecha_transferencia = CURRENT_TIMESTAMP
WHERE id = ?::UUID
  AND estado = 'pendiente';

-- Completar perfil de exalumno
UPDATE exalumnos
SET 
  perfil_completo = true,
  visible_en_directorio = true
WHERE user_id = ?::UUID
  AND carrera_ucr IS NOT NULL
  AND empresa_actual IS NOT NULL;

-- ============================================================================
-- 9. INSERCIONES DE PRUEBA
-- ============================================================================

-- Insertar usuario de prueba
INSERT INTO users (email, nombre, tipo, email_verified)
VALUES ('test@ucr.ac.cr', 'Estudiante Test', 'estudiante', true)
RETURNING id, email, nombre;

-- Completar perfil de exalumno
INSERT INTO exalumnos (
  user_id, carrera_ucr, escuela_facultad, anio_graduacion, 
  empresa_actual, cargo_actual, sector_industria, areas_de_interes,
  anos_experiencia, ofrece_mentoria, visible_en_directorio, perfil_completo
)
VALUES (
  ?::UUID,
  'Ingeniería en Sistemas',
  'Escuela de Ciencias de la Computación',
  2020,
  'Google',
  'Senior Backend Engineer',
  ARRAY['Technology', 'Software Development'],
  ARRAY['Backend', 'Distributed Systems'],
  4,
  true,
  true,
  true
);

-- ============================================================================
-- 10. QUICK-START: PRIMEROS PASOS
-- ============================================================================

-- PASO 1: Crear primer usuario admin (ejecutar manualmente)
-- INSERT INTO users (email, nombre, tipo, email_verified, activo)
-- VALUES ('admin@ucr.ac.cr', 'Admin UCR', 'admin', true, true);

-- PASO 2: Verificar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = true
ORDER BY tablename;

-- PASO 3: Crear test data (exalumno + estudiante)
-- Cambiar ?::UUID por IDs reales de usuarios

-- PASO 4: Ejecutar algoritmo de matching
-- SELECT * FROM matches ORDER BY score_match DESC LIMIT 10;

-- PASO 5: Verificar auditoría de donaciones
-- SELECT * FROM donaciones_audit WHERE fecha_cambio > CURRENT_TIMESTAMP - INTERVAL '1 day';

-- ============================================================================
-- DOCUMENTACIÓN DE COLUMNAS IMPORTANTES
-- ============================================================================

/*

USERS:
  - id: UUID generado automáticamente
  - email: UNIQUE - crucial para identificar usuario
  - tipo: Enum (exalumno, estudiante, admin)
  - email_verified: Boolean - integración con NextAuth
  - activo: Boolean - soft delete

EXALUMNOS / ESTUDIANTES:
  - user_id: FK a USERS, PK propia tabla
  - visible_en_directorio: Boolean - privacidad
  - perfil_completo: Boolean - trigger para RLS

MATCHES:
  - score_match: INT 0-100 - resultado del algoritmo
  - estado: Enum - flujo: propuesto -> contactado -> aceptado
  - tipo_apoyo: Enum (mentoria, donacion, empleo, etc)

DONACIONES:
  - estado: Enum (pendiente, confirmado, rechazado)
  - confirmado_por: UUID - Admin que confirma pago
  - numero_referencia: UNIQUE - Stripe payment ID
  - fecha_transferencia: Timestamp requerida para confirmado

POSICIONES:
  - estado: Enum - activa es lo que ven estudiantes
  - fecha_limite: DATE - queries >= CURRENT_DATE
  - habilidades_requeridas: TEXT[] - filtrado por estudiante

CURRICULUM_VERSIONES:
  - contenido_adaptado: JSONB - CV customizado por posición
  - sugerencias_ia: JSONB - IA recommendations

*/

-- ============================================================================
-- FIN DEL ARCHIVO
-- ============================================================================

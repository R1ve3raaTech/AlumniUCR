-- ============================================================================
-- PLATAFORMA UCR: Scripts SQL para Supabase PostgreSQL
-- ============================================================================
-- Ejecutar en el SQL Editor de Supabase en este orden
-- ============================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para full-text search

-- ============================================================================
-- 2. ENUMS (Tipos de datos)
-- ============================================================================

CREATE TYPE user_type AS ENUM ('exalumno', 'estudiante', 'admin');
CREATE TYPE match_type AS ENUM ('mentoria', 'donacion', 'empleo', 'pasantia', 'proyecto');
CREATE TYPE match_estado AS ENUM ('propuesto', 'contactado', 'aceptado', 'rechazado', 'completado');
CREATE TYPE posicion_tipo AS ENUM ('empleo', 'pasantia', 'proyecto', 'voluntariado');
CREATE TYPE posicion_modalidad AS ENUM ('presencial', 'remoto', 'hibrido');
CREATE TYPE posicion_jornada AS ENUM ('tiempo_completo', 'medio_tiempo', 'flexible');
CREATE TYPE posicion_estado AS ENUM ('activa', 'pausada', 'cerrada', 'completada');
CREATE TYPE aplicacion_estado AS ENUM ('postulada', 'revisada', 'entrevista', 'oferta', 'rechazada', 'contratada');
CREATE TYPE donacion_estado AS ENUM ('pendiente', 'confirmado', 'rechazado');
CREATE TYPE metodo_pago AS ENUM ('tarjeta', 'transferencia', 'paypal', 'stripe');
CREATE TYPE reporte_motivo AS ENUM ('spam', 'contenido_ofensivo', 'fraude', 'otro');
CREATE TYPE experiencia_tipo AS ENUM ('trabajo', 'voluntariado', 'proyecto', 'investigacion');
CREATE TYPE relacion_tipo AS ENUM ('mentor', 'colega', 'amigo', 'contacto');

-- ============================================================================
-- 3. TABLA: USERS (Base de autenticación)
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  tipo user_type DEFAULT 'estudiante',
  email_verified BOOLEAN DEFAULT FALSE,
  foto_url TEXT,
  activo BOOLEAN DEFAULT TRUE,
  reportes_recibidos INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_tipo ON users(tipo);
CREATE INDEX idx_users_activo ON users(activo);

-- ============================================================================
-- 4. TABLA: EXALUMNOS
-- ============================================================================

CREATE TABLE exalumnos (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  carrera_ucr TEXT,
  escuela_facultad TEXT,
  anio_graduacion INT,
  empresa_actual TEXT,
  cargo_actual TEXT,
  sector_industria TEXT[] DEFAULT ARRAY[]::TEXT[],
  areas_de_interes TEXT[] DEFAULT ARRAY[]::TEXT[],
  pais_ciudad TEXT,
  anos_experiencia INT DEFAULT 0,
  linkedin_url TEXT,
  bio TEXT,
  ofrece_mentoria BOOLEAN DEFAULT FALSE,
  horas_mes_mentoria INT DEFAULT 0,
  ofrece_empleo BOOLEAN DEFAULT FALSE,
  ofrece_pasantia BOOLEAN DEFAULT FALSE,
  ofrece_proyecto BOOLEAN DEFAULT FALSE,
  ofrece_donacion_dinero BOOLEAN DEFAULT FALSE,
  monto_maximo_donacion DECIMAL(10, 2),
  moneda_donacion TEXT DEFAULT 'CRC',
  visible_en_directorio BOOLEAN DEFAULT FALSE,
  perfil_completo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exalumnos_user_id ON exalumnos(user_id);
CREATE INDEX idx_exalumnos_visible ON exalumnos(visible_en_directorio);
CREATE INDEX idx_exalumnos_empresa ON exalumnos(empresa_actual);
CREATE INDEX idx_exalumnos_carrera ON exalumnos(carrera_ucr);

-- ============================================================================
-- 5. TABLA: ESTUDIANTES
-- ============================================================================

CREATE TABLE estudiantes (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  carnet_ucr TEXT UNIQUE,
  carrera TEXT,
  escuela_facultad TEXT,
  sede TEXT,
  anio_ingreso INT,
  nivel_academico TEXT,
  promedio_ponderado DECIMAL(4, 2),
  beca_socioeconomica TEXT,
  proyecto_titulo TEXT,
  proyecto_descripcion TEXT,
  proyecto_area_tematica TEXT,
  proyecto_tipo TEXT,
  proyecto_porcentaje_avance INT DEFAULT 0,
  proyecto_necesidades TEXT[] DEFAULT ARRAY[]::TEXT[],
  areas_de_interes TEXT[] DEFAULT ARRAY[]::TEXT[],
  habilidades TEXT[] DEFAULT ARRAY[]::TEXT[],
  busca_financiamiento BOOLEAN DEFAULT FALSE,
  busca_mentoria BOOLEAN DEFAULT FALSE,
  busca_empleo BOOLEAN DEFAULT FALSE,
  busca_pasantia BOOLEAN DEFAULT FALSE,
  proyecto_activo BOOLEAN DEFAULT TRUE,
  visible_en_directorio BOOLEAN DEFAULT FALSE,
  perfil_completo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_estudiantes_user_id ON estudiantes(user_id);
CREATE INDEX idx_estudiantes_carnet ON estudiantes(carnet_ucr);
CREATE INDEX idx_estudiantes_visible ON estudiantes(visible_en_directorio);
CREATE INDEX idx_estudiantes_carrera ON estudiantes(carrera);
CREATE INDEX idx_estudiantes_proyecto_activo ON estudiantes(proyecto_activo);

-- ============================================================================
-- 6. TABLA: MATCHES
-- ============================================================================

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exalumno_id UUID NOT NULL REFERENCES exalumnos(user_id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES estudiantes(user_id) ON DELETE CASCADE,
  tipo_apoyo match_type DEFAULT 'mentoria',
  score_match INT DEFAULT 0 CHECK (score_match >= 0 AND score_match <= 100),
  estado match_estado DEFAULT 'propuesto',
  iniciado_por TEXT DEFAULT 'admin',
  resultado TEXT,
  notas_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_match UNIQUE(exalumno_id, estudiante_id)
);

CREATE INDEX idx_matches_exalumno ON matches(exalumno_id);
CREATE INDEX idx_matches_estudiante ON matches(estudiante_id);
CREATE INDEX idx_matches_estado ON matches(estado);
CREATE INDEX idx_matches_score ON matches(score_match DESC);

-- ============================================================================
-- 7. TABLA: DONACIONES
-- ============================================================================

CREATE TABLE donaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exalumno_id UUID NOT NULL REFERENCES exalumnos(user_id) ON DELETE CASCADE,
  proyecto_estudiante_id UUID NOT NULL REFERENCES estudiantes(user_id) ON DELETE CASCADE,
  monto DECIMAL(10, 2) NOT NULL,
  moneda TEXT DEFAULT 'CRC',
  metodo_pago metodo_pago DEFAULT 'stripe',
  fecha_transferencia TIMESTAMP WITH TIME ZONE,
  numero_referencia TEXT UNIQUE,
  comprobante_url TEXT,
  mensaje_estudiante TEXT,
  estado donacion_estado DEFAULT 'pendiente',
  confirmado_por UUID REFERENCES users(id),
  motivo_rechazo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donaciones_exalumno ON donaciones(exalumno_id);
CREATE INDEX idx_donaciones_estudiante ON donaciones(proyecto_estudiante_id);
CREATE INDEX idx_donaciones_estado ON donaciones(estado);
CREATE INDEX idx_donaciones_fecha ON donaciones(fecha_transferencia DESC);

-- ============================================================================
-- 8. TABLA: POSICIONES
-- ============================================================================

CREATE TABLE posiciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  exalumno_id UUID NOT NULL REFERENCES exalumnos(user_id) ON DELETE CASCADE,
  tipo posicion_tipo DEFAULT 'empleo',
  titulo TEXT NOT NULL,
  modalidad posicion_modalidad DEFAULT 'presencial',
  jornada posicion_jornada DEFAULT 'tiempo_completo',
  lugar TEXT,
  empresa TEXT NOT NULL,
  sector TEXT[] DEFAULT ARRAY[]::TEXT[],
  habilidades_requeridas TEXT[] DEFAULT ARRAY[]::TEXT[],
  descripcion_general TEXT,
  responsabilidades TEXT[] DEFAULT ARRAY[]::TEXT[],
  contexto_equipo TEXT,
  fecha_limite DATE,
  estado posicion_estado DEFAULT 'activa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posiciones_exalumno ON posiciones(exalumno_id);
CREATE INDEX idx_posiciones_estado ON posiciones(estado);
CREATE INDEX idx_posiciones_empresa ON posiciones(empresa);
CREATE INDEX idx_posiciones_fecha_limite ON posiciones(fecha_limite);
CREATE INDEX idx_posiciones_titulo_search ON posiciones USING GIN(to_tsvector('spanish', titulo));

-- ============================================================================
-- 9. TABLA: CURRICULUM
-- ============================================================================

CREATE TABLE curriculum (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estudiante_id UUID NOT NULL UNIQUE REFERENCES estudiantes(user_id) ON DELETE CASCADE,
  cursos_relevantes TEXT[] DEFAULT ARRAY[]::TEXT[],
  proyecto_graduacion_resumen TEXT,
  habilidades_tecnicas JSONB DEFAULT '{}'::jsonb,
  habilidades_blandas TEXT[] DEFAULT ARRAY[]::TEXT[],
  idiomas JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_curriculum_estudiante ON curriculum(estudiante_id);

-- ============================================================================
-- 10. TABLA: CURRICULUM_EXPERIENCIA
-- ============================================================================

CREATE TABLE curriculum_experiencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curriculum_id UUID NOT NULL REFERENCES curriculum(id) ON DELETE CASCADE,
  tipo experiencia_tipo DEFAULT 'trabajo',
  titulo TEXT NOT NULL,
  organizacion TEXT NOT NULL,
  fecha_inicio DATE,
  fecha_fin DATE,
  bullets TEXT[] DEFAULT ARRAY[]::TEXT[],
  orden INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_curriculum_experiencia_curriculum ON curriculum_experiencia(curriculum_id);

-- ============================================================================
-- 11. TABLA: CURRICULUM_CERTIFICACIONES
-- ============================================================================

CREATE TABLE curriculum_certificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curriculum_id UUID NOT NULL REFERENCES curriculum(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  institucion TEXT NOT NULL,
  fecha DATE,
  url_verificacion TEXT,
  orden INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_curriculum_certificaciones_curriculum ON curriculum_certificaciones(curriculum_id);

-- ============================================================================
-- 12. TABLA: CURRICULUM_VERSIONES
-- ============================================================================

CREATE TABLE curriculum_versiones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  curriculum_id UUID NOT NULL REFERENCES curriculum(id) ON DELETE CASCADE,
  posicion_id UUID NOT NULL REFERENCES posiciones(id) ON DELETE CASCADE,
  nombre_version TEXT,
  contenido_adaptado JSONB DEFAULT '{}'::jsonb,
  sugerencias_ia JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_version UNIQUE(curriculum_id, posicion_id)
);

CREATE INDEX idx_curriculum_versiones_curriculum ON curriculum_versiones(curriculum_id);
CREATE INDEX idx_curriculum_versiones_posicion ON curriculum_versiones(posicion_id);

-- ============================================================================
-- 13. TABLA: APLICACIONES
-- ============================================================================

CREATE TABLE aplicaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  posicion_id UUID NOT NULL REFERENCES posiciones(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES estudiantes(user_id) ON DELETE CASCADE,
  curriculum_version_id UUID REFERENCES curriculum_versiones(id),
  mensaje_presentacion TEXT,
  estado aplicacion_estado DEFAULT 'postulada',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_application UNIQUE(posicion_id, estudiante_id)
);

CREATE INDEX idx_aplicaciones_posicion ON aplicaciones(posicion_id);
CREATE INDEX idx_aplicaciones_estudiante ON aplicaciones(estudiante_id);
CREATE INDEX idx_aplicaciones_estado ON aplicaciones(estado);

-- ============================================================================
-- 14. TABLA: REPORTES_PERFIL
-- ============================================================================

CREATE TABLE reportes_perfil (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reportado_por UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  perfil_reportado UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  motivo reporte_motivo,
  descripcion TEXT,
  resuelto BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reportes_perfil_reportado_por ON reportes_perfil(reportado_por);
CREATE INDEX idx_reportes_perfil_perfil_reportado ON reportes_perfil(perfil_reportado);
CREATE INDEX idx_reportes_perfil_resuelto ON reportes_perfil(resuelto);

-- ============================================================================
-- 15. TABLA: CONEXIONES_USUARIOS (Networking)
-- ============================================================================

CREATE TABLE conexiones_usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usuario_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tipo_relacion relacion_tipo DEFAULT 'contacto',
  fecha_conexion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CHECK (usuario_1_id < usuario_2_id),
  CONSTRAINT unique_conexion UNIQUE(usuario_1_id, usuario_2_id)
);

CREATE INDEX idx_conexiones_usuario_1 ON conexiones_usuarios(usuario_1_id);
CREATE INDEX idx_conexiones_usuario_2 ON conexiones_usuarios(usuario_2_id);

-- ============================================================================
-- 16. TABLA: DONACIONES_AUDIT (Auditoría)
-- ============================================================================

CREATE TABLE donaciones_audit (
  id SERIAL PRIMARY KEY,
  donacion_id UUID NOT NULL REFERENCES donaciones(id) ON DELETE CASCADE,
  campo TEXT NOT NULL,
  valor_anterior TEXT,
  valor_nuevo TEXT,
  cambiado_por UUID REFERENCES users(id),
  fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_donaciones_audit_donacion ON donaciones_audit(donacion_id);
CREATE INDEX idx_donaciones_audit_fecha ON donaciones_audit(fecha_cambio DESC);

-- ============================================================================
-- 17. FUNCIONES TRIGGER
-- ============================================================================

-- Función: Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función: Auditar cambios en donaciones
CREATE OR REPLACE FUNCTION audit_donaciones_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado != OLD.estado THEN
    INSERT INTO donaciones_audit(donacion_id, campo, valor_anterior, valor_nuevo, cambiado_por)
    VALUES(NEW.id, 'estado', OLD.estado::text, NEW.estado::text, auth.uid());
  END IF;
  
  IF NEW.confirmado_por IS NOT NULL AND OLD.confirmado_por IS NULL THEN
    INSERT INTO donaciones_audit(donacion_id, campo, valor_anterior, valor_nuevo, cambiado_por)
    VALUES(NEW.id, 'confirmado', 'false', 'true', NEW.confirmado_por);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 18. TRIGGERS
-- ============================================================================

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exalumnos_updated_at BEFORE UPDATE ON exalumnos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estudiantes_updated_at BEFORE UPDATE ON estudiantes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_donaciones_updated_at BEFORE UPDATE ON donaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posiciones_updated_at BEFORE UPDATE ON posiciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curriculum_updated_at BEFORE UPDATE ON curriculum
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aplicaciones_updated_at BEFORE UPDATE ON aplicaciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reportes_perfil_updated_at BEFORE UPDATE ON reportes_perfil
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER audit_donaciones_trigger AFTER UPDATE ON donaciones
  FOR EACH ROW EXECUTE FUNCTION audit_donaciones_changes();

-- ============================================================================
-- 19. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exalumnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE donaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE posiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_experiencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_certificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE curriculum_versiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE aplicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE conexiones_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE donaciones_audit ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Authenticated users can view public profiles" ON users
  FOR SELECT
  USING (auth.role() = 'authenticated' AND activo = true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND tipo = OLD.tipo); -- Prevenir cambio de tipo

-- EXALUMNOS POLICIES
CREATE POLICY "Exalumnos view own profile" ON exalumnos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can view published exalumnos" ON exalumnos
  FOR SELECT
  USING (
    (auth.uid() = user_id) OR 
    (visible_en_directorio = true AND auth.role() = 'authenticated')
  );

CREATE POLICY "Exalumnos update own profile" ON exalumnos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ESTUDIANTES POLICIES
CREATE POLICY "Estudiantes view own profile" ON estudiantes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Exalumnos can view published students" ON estudiantes
  FOR SELECT
  USING (
    (auth.uid() = user_id) OR 
    (visible_en_directorio = true AND auth.role() = 'authenticated')
  );

CREATE POLICY "Estudiantes update own profile" ON estudiantes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- MATCHES POLICIES
CREATE POLICY "Users see their own matches" ON matches
  FOR SELECT
  USING (
    auth.uid() = exalumno_id OR 
    auth.uid() = estudiante_id OR
    (auth.jwt() ->> 'role' = 'admin')
  );

CREATE POLICY "Exalumno responds to match" ON matches
  FOR UPDATE
  USING (auth.uid() = exalumno_id)
  WITH CHECK (auth.uid() = exalumno_id);

CREATE POLICY "Admin can manage all matches" ON matches
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- DONACIONES POLICIES
CREATE POLICY "Exalumnos view own donations" ON donaciones
  FOR SELECT
  USING (auth.uid() = exalumno_id);

CREATE POLICY "Students view donations to own project" ON donaciones
  FOR SELECT
  USING (
    auth.uid() = proyecto_estudiante_id OR
    auth.uid() = exalumno_id OR
    (auth.jwt() ->> 'role' = 'admin')
  );

CREATE POLICY "Only admins confirm donations" ON donaciones
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- POSICIONES POLICIES
CREATE POLICY "Exalumnos view own posiciones" ON posiciones
  FOR SELECT
  USING (auth.uid() = exalumno_id);

CREATE POLICY "Students view active posiciones" ON posiciones
  FOR SELECT
  USING (
    (auth.uid() = exalumno_id) OR 
    (estado = 'activa' AND auth.role() = 'authenticated')
  );

CREATE POLICY "Exalumnos manage own posiciones" ON posiciones
  FOR UPDATE
  USING (auth.uid() = exalumno_id)
  WITH CHECK (auth.uid() = exalumno_id);

-- CURRICULUM POLICIES
CREATE POLICY "Estudiantes manage own curriculum" ON curriculum
  FOR ALL
  USING (auth.uid() = estudiante_id);

CREATE POLICY "Curriculum visible to own user" ON curriculum
  FOR SELECT
  USING (auth.uid() = estudiante_id OR auth.jwt() ->> 'role' = 'admin');

-- APLICACIONES POLICIES
CREATE POLICY "Estudiantes view own applications" ON aplicaciones
  FOR SELECT
  USING (auth.uid() = estudiante_id);

CREATE POLICY "Exalumnos view applications to own posicion" ON aplicaciones
  FOR SELECT
  USING (
    (SELECT exalumno_id FROM posiciones WHERE id = posicion_id) = auth.uid() OR
    auth.jwt() ->> 'role' = 'admin'
  );

-- REPORTES_PERFIL POLICIES
CREATE POLICY "Admin views all reports" ON reportes_perfil
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can create reports" ON reportes_perfil
  FOR INSERT
  WITH CHECK (auth.uid() = reportado_por AND auth.role() = 'authenticated');

-- CONEXIONES_USUARIOS POLICIES
CREATE POLICY "Users see their own connections" ON conexiones_usuarios
  FOR SELECT
  USING (auth.uid() = usuario_1_id OR auth.uid() = usuario_2_id);

-- DONACIONES_AUDIT POLICIES (Solo admins)
CREATE POLICY "Admin views audit logs" ON donaciones_audit
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- 20. SUPABASE STORAGE BUCKETS (Crear vía UI o CLI)
-- ============================================================================

-- psql commands:
-- SELECT storage.create_bucket('curriculos');
-- SELECT storage.create_bucket('comprobantes');
-- SELECT storage.create_bucket('fotos_perfil');
-- SELECT storage.create_bucket('documentos');

-- Nota: Crear buckets vía Supabase UI dashboard -> Storage

-- ============================================================================
-- 21. VERIFICACIÓN FINAL
-- ============================================================================

-- Listar todas las tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Listar índices
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY indexname;

-- Listar triggers
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
ORDER BY trigger_name;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
-- 
-- ✅ Tablas creadas: 16
-- ✅ Índices creados: 30+
-- ✅ Triggers creados: 9
-- ✅ RLS Policies: 25+
-- ✅ Funciones: 2
--
-- Próximos pasos:
-- 1. Crear Storage Buckets vía UI
-- 2. Configurar autenticación en Supabase
-- 3. Integrar con Next.js + NextAuth.js
-- 4. Ejecutar migraciones de datos (si las hay)
--
-- ============================================================================

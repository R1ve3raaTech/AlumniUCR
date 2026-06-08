# 🎓 Plataforma de Conectividad y Donaciones UCR
## Diagrama de Flujo Definitivo & Guía Técnica de Implementación

**Versión:** 1.0 Final | **Stack:** Supabase + Node.js + Next.js + NextAuth.js + PostgreSQL | **Fecha:** 2025

---

## 📋 Tabla de Contenidos
1. Análisis de consolidación
2. Arquitectura definitiva
3. Especificaciones técnicas
4. Flujos de negocio
5. Implementación por módulo
6. Row Level Security (RLS)
7. Checklist de desarrollo

---

## 1. ANÁLISIS DE CONSOLIDACIÓN

### 1.1 Comparativa: PDF vs HTML

| Aspecto | PDF (Carlos) | HTML (Edge) | Decisión Final |
|---------|--------------|-------------|---|
| **Estructura base** | ER completo, 16 tablas | Mermaid simplificado | Usar ER completo del PDF |
| **Tabla USERS** | ✅ Presente | ✅ Presente | Consolidado (PK: uuid, UK: email) |
| **EXALUMNOS** | ✅ Con 25+ campos | ✅ Simplificado | Usar especificación completa del PDF |
| **ESTUDIANTES** | ✅ Con proyecto_* | ✅ Simplificado | Usar especificación completa |
| **MATCHES** | ✅ Presente | ✅ Presente | Consolidado |
| **DONACIONES** | ✅ 11 campos | ✅ Básico | Usar versión completa del PDF |
| **POSICIONES** | ✅ Presente | ✅ Presente | Consolidado |
| **CURRICULUM*** | ✅ 4 tablas | ✅ Simplificado | Usar versión modular completa |
| **REPORTES** | ✅ REPORTES_PERFIL | ✅ REPORTES_USUARIOS | **CONSOLIDADO**: Tabla única REPORTES_PERFIL |
| **Versiones CV** | ✅ CURRICULUM_VERSIONES | ❌ No existe | **AGREGADO**: Versiones adaptables por puesto |

### 1.2 Duplicados Identificados y Eliminados

```
❌ ELIMINADO: "REPORTES_USUARIOS"
   → Consolidado en "REPORTES_PERFIL"
   → Solo importa reportar perfiles, no usuarios genéricos

❌ ELIMINADO: Campos redundantes en EXALUMNOS
   → "monto_donacion" + "moneda_donacion" → Usar tabla DONACIONES
   → Normalización: evita actualizar múltiples registros

❌ ELIMINADO: Tabla "SECTORES_EMPLEO" separada
   → Incorporado como text_array "sector" en POSICIONES
   → Mejor: denormalización controlada para queries rápidas

✅ CONSOLIDADO: Todas las tablas de CURRICULUM
   → CURRICULUM (base)
   → CURRICULUM_EXPERIENCIA (1:N)
   → CURRICULUM_CERTIFICACIONES (1:N)
   → CURRICULUM_VERSIONES (adaptadas por posición)
   → Estructura modular, sin duplicados
```

### 1.3 Campos Agregados en Versión Final

```sql
-- Estos campos fueron agregados por arquitectura técnica
ALTER TABLE users ADD COLUMN foto_url TEXT;
ALTER TABLE users ADD COLUMN tipo ENUM ('exalumno', 'estudiante', 'admin');
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;

-- Auditoría y seguridad
ALTER TABLE ALL ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE ALL ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- RLS: Identificar quien hizo cambios
ALTER TABLE donaciones ADD COLUMN confirmado_por UUID REFERENCES users(id);
```

---

## 2. ARQUITECTURA DEFINITIVA

### 2.1 Stack Tecnológico

```
┌─────────────────────────────────────────────────────┐
│           CAPA DE PRESENTACIÓN                       │
│  Next.js (Frontend) + NextAuth.js (Auth)            │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP/REST + WebSockets
┌─────────────────────▼───────────────────────────────┐
│        CAPA DE API (Node.js/Next.js Routes)         │
│  /api/auth/* (NextAuth callbacks)                   │
│  /api/usuarios/* (CRUD + validación)                │
│  /api/matches/* (Algoritmo de matching)             │
│  /api/donaciones/* (Procesar pagos + confirmar)     │
│  /api/posiciones/* (Crud + filtering)               │
│  /api/aplicaciones/* (Tracking)                     │
└─────────────────────┬───────────────────────────────┘
                      │ Supabase Client (RLS)
┌─────────────────────▼───────────────────────────────┐
│     CAPA SUPABASE (Auth + Realtime + Storage)       │
│  - Row Level Security (RLS) Policies                │
│  - Realtime Subscriptions                           │
│  - Storage Buckets (CVs, comprobantes)              │
└─────────────────────┬───────────────────────────────┘
                      │ SQL
┌─────────────────────▼───────────────────────────────┐
│       PostgreSQL (Base de Datos Relacional)         │
│  16 tablas normalizadas + índices optimizados       │
│  Triggers para auditoría + validación               │
└─────────────────────────────────────────────────────┘
```

### 2.2 Diagrama de Entidades (Core)

**Tabla: USERS** (Base de autenticación)
```
uuid           id (PK)
text           email (UK - Unique Key)
text           nombre
enum           tipo (exalumno | estudiante | admin)
boolean        email_verified
text           foto_url
boolean        activo
int            reportes_recibidos
timestamp      created_at
timestamp      updated_at
```

**Tabla: EXALUMNOS** (Perfil extendido)
```
uuid           user_id (PK, FK → USERS)
text           carrera_ucr
text           escuela_facultad
int            anio_graduacion
text           empresa_actual
text           cargo_actual
text[]         sector_industria (array de strings)
text[]         areas_de_interes
text           pais_ciudad
int            anos_experiencia
text           linkedin_url
text           bio
boolean        ofrece_mentoria
int            horas_mes_mentoria
boolean        ofrece_empleo
boolean        ofrece_pasantia
boolean        ofrece_proyecto
boolean        ofrece_donacion_dinero
decimal        monto_maximo_donacion
text           moneda_donacion
boolean        visible_en_directorio
boolean        perfil_completo
timestamp      created_at
timestamp      updated_at
```

**Tabla: ESTUDIANTES** (Perfil extendido)
```
uuid           user_id (PK, FK → USERS)
text           carnet_ucr
text           carrera
text           escuela_facultad
text           sede
int            anio_ingreso
text           nivel_academico
decimal        promedio_ponderado
text           beca_socioeconomica
text           proyecto_titulo
text           proyecto_descripcion
text           proyecto_area_tematica
text           proyecto_tipo
int            proyecto_porcentaje_avance
text[]         proyecto_necesidades (array)
text[]         areas_de_interes
text[]         habilidades
boolean        busca_financiamiento
boolean        busca_mentoria
boolean        busca_empleo
boolean        busca_pasantia
boolean        proyecto_activo
boolean        visible_en_directorio
boolean        perfil_completo
timestamp      created_at
timestamp      updated_at
```

**Tabla: MATCHES** (Emparejamiento)
```
uuid           id (PK)
uuid           exalumno_id (FK → EXALUMNOS)
uuid           estudiante_id (FK → ESTUDIANTES)
text           tipo_apoyo (mentoria | donacion | empleo | pasantia | proyecto)
int            score_match (0-100, algoritmo)
text           estado (propuesto | contactado | aceptado | rechazado | completado)
text           iniciado_por (exalumno | estudiante | admin)
text           resultado
text           notas_admin
timestamp      created_at
timestamp      updated_at
```

**Tabla: DONACIONES** (Transacciones financieras)
```
uuid           id (PK)
uuid           exalumno_id (FK → EXALUMNOS)
uuid           proyecto_estudiante_id (FK → ESTUDIANTES)
decimal        monto
text           moneda (CRC | USD | EUR)
text           metodo_pago (tarjeta | transferencia | paypal)
timestamp      fecha_transferencia
text           numero_referencia
text           comprobante_url (link a Storage)
text           mensaje_estudiante
text           estado (pendiente | confirmado | rechazado)
uuid           confirmado_por (FK → USERS, admin que confirma)
text           motivo_rechazo
timestamp      created_at
timestamp      updated_at
```

**Tabla: POSICIONES** (Ofertas de trabajo/pasantía)
```
uuid           id (PK)
uuid           exalumno_id (FK → EXALUMNOS)
text           tipo (empleo | pasantia | proyecto | voluntariado)
text           titulo
text           modalidad (presencial | remoto | hibrido)
text           jornada (tiempo_completo | medio_tiempo | flexible)
text           lugar
text           empresa
text[]         sector (array)
text[]         habilidades_requeridas
text           descripcion_general
text[]         responsabilidades
text           contexto_equipo
date           fecha_limite
text           estado (activa | pausada | cerrada | completada)
timestamp      created_at
timestamp      updated_at
```

**Tabla: CURRICULUM** (Base del CV)
```
uuid           id (PK)
uuid           estudiante_id (FK → ESTUDIANTES, UK)
text[]         cursos_relevantes
text           proyecto_graduacion_resumen
jsonb          habilidades_tecnicas (JSON flexible)
text[]         habilidades_blandas
jsonb          idiomas (JSON flexible)
timestamp      created_at
timestamp      updated_at
```

**Tabla: CURRICULUM_EXPERIENCIA** (Experiencias)
```
uuid           id (PK)
uuid           curriculum_id (FK → CURRICULUM)
text           tipo (trabajo | voluntariado | proyecto | investigacion)
text           titulo
text           organizacion
text           fecha_inicio
text           fecha_fin
text[]         bullets (puntos clave)
int            orden (para ordenar)
```

**Tabla: CURRICULUM_CERTIFICACIONES** (Certs)
```
uuid           id (PK)
uuid           curriculum_id (FK → CURRICULUM)
text           nombre
text           institucion
text           fecha
text           url_verificacion
int            orden
```

**Tabla: CURRICULUM_VERSIONES** (Adaptaciones por puesto)
```
uuid           id (PK)
uuid           curriculum_id (FK → CURRICULUM, UK)
uuid           posicion_id (FK → POSICIONES, UK)
text           nombre_version
jsonb          contenido_adaptado (CV customizado en JSON)
jsonb          sugerencias_ia (recomendaciones IA)
timestamp      created_at
```

**Tabla: APLICACIONES** (Candidaturas)
```
uuid           id (PK)
uuid           posicion_id (FK → POSICIONES, UK)
uuid           estudiante_id (FK → ESTUDIANTES, UK)
uuid           curriculum_version_id (FK → CURRICULUM_VERSIONES)
text           mensaje_presentacion
text           estado (postulada | revisada | entrevista | oferta | rechazada | contratada)
timestamp      created_at
timestamp      updated_at
```

**Tabla: REPORTES_PERFIL** (Moderation)
```
uuid           id (PK)
uuid           reportado_por (FK → USERS)
uuid           perfil_reportado (FK → USERS)
text           motivo (spam | contenido_ofensivo | fraude | otro)
text           descripcion
boolean        resuelto
timestamp      created_at
timestamp      updated_at
```

### 2.3 Tablas Auxiliares

**CONEXIONES_USUARIOS** (Networking)
```
uuid           id (PK)
uuid           usuario_1_id (FK → USERS)
uuid           usuario_2_id (FK → USERS)
text           tipo_relacion (mentor | colega | amigo | contacto)
timestamp      fecha_conexion
```

**SUPABASE STORAGE** (Archivos)
```
Bucket: "curriculos"     → CVs en PDF/DOCX
Bucket: "comprobantes"   → Proof of transfer para donaciones
Bucket: "fotos_perfil"   → Imágenes de usuarios
Bucket: "documentos"     → Certificados, diplomas
```

---

## 3. ESPECIFICACIONES TÉCNICAS

### 3.1 Índices Recomendados

```sql
-- Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_exalumnos_user_id ON exalumnos(user_id);
CREATE INDEX idx_estudiantes_user_id ON estudiantes(user_id);
CREATE INDEX idx_matches_exalumno ON matches(exalumno_id);
CREATE INDEX idx_matches_estudiante ON matches(estudiante_id);
CREATE INDEX idx_matches_estado ON matches(estado);
CREATE INDEX idx_donaciones_exalumno ON donaciones(exalumno_id);
CREATE INDEX idx_donaciones_estado ON donaciones(estado);
CREATE INDEX idx_posiciones_exalumno ON posiciones(exalumno_id);
CREATE INDEX idx_posiciones_estado ON posiciones(estado);
CREATE INDEX idx_aplicaciones_posicion ON aplicaciones(posicion_id);
CREATE INDEX idx_aplicaciones_estudiante ON aplicaciones(estudiante_id);
CREATE INDEX idx_curriculum_estudiante ON curriculum(estudiante_id);

-- Full-text search
CREATE INDEX idx_users_nombre_search ON users USING GIN(to_tsvector('spanish', nombre));
CREATE INDEX idx_exalumnos_empresa_search ON exalumnos USING GIN(to_tsvector('spanish', empresa_actual));
CREATE INDEX idx_posiciones_titulo_search ON posiciones USING GIN(to_tsvector('spanish', titulo));
```

### 3.2 Triggers Recomendados

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auditar cambios en donaciones (compliance)
CREATE TABLE donaciones_audit (
    id SERIAL,
    donacion_id UUID,
    campo TEXT,
    valor_anterior TEXT,
    valor_nuevo TEXT,
    cambiado_por UUID REFERENCES users(id),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION audit_donaciones()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.estado != OLD.estado THEN
        INSERT INTO donaciones_audit(donacion_id, campo, valor_anterior, valor_nuevo, cambiado_por)
        VALUES(NEW.id, 'estado', OLD.estado, NEW.estado, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_donaciones_trigger AFTER UPDATE ON donaciones
    FOR EACH ROW EXECUTE FUNCTION audit_donaciones();
```

---

## 4. FLUJOS DE NEGOCIO PRINCIPALES

### 4.1 Flujo: MATCH (Exalumno ↔ Estudiante)

```
1. Estudiante publica necesidades en perfil
   - busca_mentoria: TRUE
   - areas_de_interes: ['backend', 'startup']
   - habilidades: ['Python', 'FastAPI']

2. Algoritmo de MATCHING ejecuta:
   GET /api/matches/calcular
   - Busca exalumnos con sector_industria compatible
   - Score: relevancia_carrera(30%) + área_interes(30%) + 
            habilidades(25%) + disponibilidad(15%)
   - Crea propuesta en MATCHES con estado='propuesto'

3. Notificación a exalumno:
   - Email: "Un estudiante busca mentoría en tu área"
   - Link a perfil del estudiante

4. Exalumno responde:
   POST /api/matches/:id/responder
   - Cuerpo: { estado: 'aceptado' | 'rechazado', mensaje: '...' }
   - Si aceptado → crear CONEXION_USUARIO

5. Inicio de relación:
   - Conversación via email/app
   - Tracking en MATCHES.resultado
   - Al completar: actualizar estado='completado'
```

### 4.2 Flujo: DONACIÓN (Exalumno → Proyecto Estudiante)

```
1. Exalumno navega proyectos de estudiantes
   GET /api/estudiantes?proyecto_activo=true&visible=true

2. Selecciona proyecto y quiere donar:
   POST /api/donaciones/crear
   Cuerpo: {
     exalumno_id: uuid,
     proyecto_estudiante_id: uuid,
     monto: 1000,
     moneda: 'CRC',
     metodo_pago: 'tarjeta',
     mensaje_estudiante: 'Creo en tu proyecto!'
   }

3. Estado inicial: pendiente
   - Genera enlace de pago (Stripe/PayPal integration)
   - Estudiante recibe notificación (no confirmada aún)

4. Callback de pago:
   POST /api/donaciones/:id/confirmar
   - Validar numero_referencia
   - Verificar comprobante_url en Storage
   - Admin revisa: confirmado_por = admin_user_id
   - Estado → confirmado | rechazado

5. Notificaciones:
   - Si confirmada: Email a estudiante + exalumno
   - Registrar en auditoría
```

### 4.3 Flujo: POSICIÓN (Oferta de trabajo)

```
1. Exalumno publica posición:
   POST /api/posiciones/crear
   {
     tipo: 'empleo',
     titulo: 'Senior Backend Engineer',
     empresa: 'TechCorp',
     modalidad: 'remoto',
     habilidades_requeridas: ['Go', 'Kubernetes', 'SQL'],
     descripcion_general: '...',
     fecha_limite: '2025-03-30'
   }

2. Publicada con estado='activa'
   - Visible en /api/posiciones?filtros=...

3. Estudiante descubre y se postula:
   POST /api/aplicaciones/crear
   {
     posicion_id: uuid,
     estudiante_id: uuid,
     curriculum_version_id: uuid (versión adaptada),
     mensaje_presentacion: '...'
   }

4. Exalumno revisa candidatos:
   GET /api/posiciones/:id/aplicaciones

5. Cambiar estado:
   PATCH /api/aplicaciones/:id
   {
     estado: 'entrevista' | 'oferta' | 'rechazada' | 'contratada'
   }
```

### 4.4 Flujo: CV ADAPTATIVO

```
1. Estudiante crea CV base:
   POST /api/curriculum/crear
   - Habilidades técnicas (JSON)
   - Experiencia laboral
   - Certificaciones

2. Estudiante postula a posición:
   POST /api/aplicaciones/crear
   - Sistema genera CURRICULUM_VERSION
   - Sugerencias IA: reorden secciones, highlight skills

3. CV adaptado:
   GET /api/curriculum/:id/versiones/:posicion_id
   - contenido_adaptado: CV customizado para esa posición
   - sugerencias_ia: ['Menciona Kubernetes en resumen', ...]

4. Guardar versión:
   - Tracking de "qué CV envié a qué posición"
   - Mejora follow-up y matching futuro
```

---

## 5. IMPLEMENTACIÓN POR MÓDULO

### 5.1 Módulo: AUTENTICACIÓN (NextAuth.js)

**Archivo:** `pages/api/auth/[...nextauth].js`

```javascript
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    CredentialsProvider({
      async authorize(credentials) {
        const { email, password } = credentials;
        const { data: user, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw new Error(error.message);
        return { id: user.user.id, email: user.user.email, name: user.user.user_metadata?.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        // Buscar/crear perfil en USERS tabla
        const { data: profile } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (!profile) {
          await supabase.from("users").insert({
            id: user.id,
            email: user.email,
            nombre: user.name,
            tipo: "estudiante", // default
          });
        }
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export default NextAuth(authOptions);
```

### 5.2 Módulo: USUARIOS (CRUD + Perfiles)

**Archivo:** `pages/api/usuarios/[id].js`

```javascript
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });

  const supabase = createServerSupabaseClient({ req, res });
  const { id } = req.query;

  if (req.method === 'GET') {
    // Obtener perfil completo (usuario + exalumno/estudiante)
    const { data: user } = await supabase
      .from('users')
      .select('*, exalumnos(*), estudiantes(*)')
      .eq('id', id)
      .single();

    return res.status(200).json(user);
  }

  if (req.method === 'PUT') {
    // Actualizar datos del usuario
    const { nombre, foto_url } = req.body;
    const { data, error } = await supabase
      .from('users')
      .update({ nombre, foto_url })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST' && id === 'completar-perfil') {
    // Completar perfil (exalumno o estudiante)
    const { tipo, ...profileData } = req.body;

    if (tipo === 'exalumno') {
      const { data, error } = await supabase
        .from('exalumnos')
        .upsert({ user_id: session.user.id, ...profileData })
        .select()
        .single();
      if (error) return res.status(400).json({ error: error.message });
    } else if (tipo === 'estudiante') {
      const { data, error } = await supabase
        .from('estudiantes')
        .upsert({ user_id: session.user.id, ...profileData })
        .select()
        .single();
      if (error) return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  }
}
```

### 5.3 Módulo: MATCHES (Algoritmo)

**Archivo:** `pages/api/matches/calcular.js`

```javascript
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

const calcularScore = (exalumno, estudiante) => {
  let score = 0;

  // Relevancia de carrera (30%)
  const carreraMatch = exalumno.carrera_ucr === estudiante.carrera ? 30 : 15;
  score += carreraMatch;

  // Área de interés (30%)
  const areaMatch = exalumno.areas_de_interes.filter(a => 
    estudiante.areas_de_interes.includes(a)
  ).length;
  score += Math.min(areaMatch * 10, 30);

  // Habilidades (25%)
  const habilidadMatch = exalumno.sector_industria.filter(s =>
    estudiante.habilidades.some(h => h.includes(s))
  ).length;
  score += Math.min(habilidadMatch * 8, 25);

  // Disponibilidad (15%)
  if (exalumno.ofrece_mentoria && estudiante.busca_mentoria) score += 15;
  else if (exalumno.ofrece_empleo && estudiante.busca_empleo) score += 15;

  return Math.min(score, 100);
};

export default async function handler(req, res) {
  const supabase = createServerSupabaseClient({ req, res });

  const { data: estudiantes } = await supabase
    .from('estudiantes')
    .select('*, users(*)')
    .eq('visible_en_directorio', true);

  const { data: exalumnos } = await supabase
    .from('exalumnos')
    .select('*, users(*)')
    .eq('visible_en_directorio', true);

  const matches = [];

  for (const estudiante of estudiantes) {
    for (const exalumno of exalumnos) {
      const score = calcularScore(exalumno, estudiante);
      
      if (score >= 40) { // Solo matches >= 40
        matches.push({
          exalumno_id: exalumno.user_id,
          estudiante_id: estudiante.user_id,
          tipo_apoyo: 'mentoria', // Default, puede cambiar
          score_match: score,
          estado: 'propuesto',
          iniciado_por: 'admin',
        });
      }
    }
  }

  // Guardar matches en BD
  const { data, error } = await supabase
    .from('matches')
    .insert(matches);

  if (error) return res.status(400).json({ error: error.message });
  return res.status(200).json({ created: data.length, matches: data });
}
```

### 5.4 Módulo: DONACIONES (Pagos)

**Archivo:** `pages/api/donaciones/crear.js`

```javascript
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { getServerSession } from "next-auth/next";
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  const supabase = createServerSupabaseClient({ req, res });

  const { proyecto_estudiante_id, monto, moneda, mensaje_estudiante } = req.body;

  // 1. Crear registro en tabla DONACIONES (estado: pendiente)
  const { data: donation, error: donError } = await supabase
    .from('donaciones')
    .insert({
      exalumno_id: session.user.id,
      proyecto_estudiante_id,
      monto,
      moneda,
      metodo_pago: 'stripe',
      estado: 'pendiente',
      mensaje_estudiante,
    })
    .select()
    .single();

  if (donError) return res.status(400).json({ error: donError.message });

  // 2. Crear sesión de pago Stripe
  const lineItems = [{
    price_data: {
      currency: moneda.toLowerCase(),
      product_data: {
        name: `Donación a proyecto educativo`,
      },
      unit_amount: Math.round(monto * 100),
    },
    quantity: 1,
  }];

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.NEXTAUTH_URL}/donacion-confirmada?donacion_id=${donation.id}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/donacion-cancelada`,
    metadata: { donacion_id: donation.id },
  });

  return res.status(200).json({
    donation_id: donation.id,
    stripe_session_id: stripeSession.id,
    checkout_url: stripeSession.url,
  });
}
```

**Archivo:** `pages/api/donaciones/confirmar.js` (Webhook)

```javascript
import { buffer } from 'micro';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).json({ error: `Webhook error: ${error.message}` });
  }

  if (event.type === 'checkout.session.completed') {
    const { metadata, payment_status } = event.data.object;
    
    if (payment_status === 'paid') {
      // Actualizar estado de donación
      const { error } = await supabase
        .from('donaciones')
        .update({
          estado: 'confirmado',
          numero_referencia: event.data.object.payment_intent,
        })
        .eq('id', metadata.donacion_id);

      if (!error) {
        // Enviar email de agradecimiento
        // Enviar notificación a estudiante
      }
    }
  }

  res.status(200).json({ received: true });
}
```

---

## 6. ROW LEVEL SECURITY (RLS) POLICIES

### 6.1 Política: USERS

```sql
-- Los usuarios solo ven su propio perfil
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Perfiles públicos pueden verse entre usuarios logueados
CREATE POLICY "Authenticated users can view public profiles" ON users
  FOR SELECT
  USING (auth.role() = 'authenticated' AND visible_en_directorio = true);
```

### 6.2 Política: EXALUMNOS

```sql
-- Exalumnos ven su perfil
CREATE POLICY "Exalumnos view own profile" ON exalumnos
  FOR SELECT
  USING (auth.uid() = user_id);

-- Estudiantes ven exalumnos visibles en directorio
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
```

### 6.3 Política: MATCHES

```sql
-- Ver matches propios (como exalumno o estudiante)
CREATE POLICY "Users see their own matches" ON matches
  FOR SELECT
  USING (
    auth.uid() = exalumno_id OR 
    auth.uid() = estudiante_id OR
    (auth.jwt() ->> 'role' = 'admin')
  );

-- Exalumno actualiza su respuesta a un match
CREATE POLICY "Exalumno responds to match" ON matches
  FOR UPDATE
  USING (auth.uid() = exalumno_id)
  WITH CHECK (auth.uid() = exalumno_id);
```

### 6.4 Política: DONACIONES

```sql
-- Exalumno ve sus propias donaciones
CREATE POLICY "Exalumnos view own donations" ON donaciones
  FOR SELECT
  USING (auth.uid() = exalumno_id);

-- Estudiante ve donaciones a su proyecto
CREATE POLICY "Students view donations to own project" ON donaciones
  FOR SELECT
  USING (
    auth.uid() = (SELECT user_id FROM estudiantes WHERE id = proyecto_estudiante_id) OR
    auth.uid() = exalumno_id
  );

-- Admin ve todas (para auditoría)
CREATE POLICY "Admins view all donations" ON donaciones
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Solo admins confirman donaciones
CREATE POLICY "Only admins confirm donations" ON donaciones
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');
```

### 6.5 Política: POSICIONES

```sql
-- Exalumno ve sus posiciones
CREATE POLICY "Exalumnos view own posiciones" ON posiciones
  FOR SELECT
  USING (auth.uid() = exalumno_id);

-- Estudiantes ven posiciones activas
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
```

---

## 7. CHECKLIST DE DESARROLLO

### Fase 1: Setup Base
- [ ] Crear proyecto Next.js con TypeScript
- [ ] Configurar variables de entorno (.env.local)
- [ ] Instalar dependencias: `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs next-auth stripe`
- [ ] Crear proyecto Supabase y obtener URL + KEY
- [ ] Ejecutar migraciones SQL de tablas en Supabase

### Fase 2: Autenticación
- [ ] Configurar NextAuth.js con Google OAuth
- [ ] Implementar `/pages/api/auth/[...nextauth].js`
- [ ] Crear páginas de login/signup
- [ ] Validar JWT tokens y sesiones
- [ ] Testing: login con Google y email

### Fase 3: Perfiles de Usuarios
- [ ] Crear tablas: USERS, EXALUMNOS, ESTUDIANTES
- [ ] Implementar CRUD de perfiles
- [ ] Completar onboarding (select tipo: exalumno/estudiante)
- [ ] Upload de foto de perfil a Storage
- [ ] RLS Policies para privacidad

### Fase 4: Algoritmo de Matching
- [ ] Implementar scoring en `/api/matches/calcular`
- [ ] Crear tabla MATCHES
- [ ] Notificaciones por email (SendGrid/Resend)
- [ ] Aceptar/rechazar matches
- [ ] Testing del algoritmo

### Fase 5: Sistema de Donaciones
- [ ] Integrar Stripe (crear cuenta + keys)
- [ ] Crear tabla DONACIONES
- [ ] Flujo de pago: crear → procesar → confirmar
- [ ] Webhook para confirmación de pago
- [ ] Email de agradecimiento
- [ ] Auditoría de transacciones

### Fase 6: Posiciones & Aplicaciones
- [ ] CRUD de posiciones (exalumnos publican)
- [ ] CRUD de aplicaciones (estudiantes postulan)
- [ ] Filtrado por habilidades, empresa, etc.
- [ ] Notificaciones a exalumnos de nuevos candidatos
- [ ] Tracking de estado (postulada → entrevista → oferta)

### Fase 7: CV Adaptativo
- [ ] CRUD de CURRICULUM base
- [ ] CURRICULUM_EXPERIENCIA y CERTIFICACIONES
- [ ] Generar CURRICULUM_VERSIONS adaptadas por posición
- [ ] IA suggestions (integrar OpenAI)
- [ ] Download CV como PDF

### Fase 8: Seguridad & Auditoría
- [ ] Implementar RLS Policies (todas)
- [ ] Crear tabla REPORTES_PERFIL
- [ ] Moderation (admin panel)
- [ ] Logs de auditoría en donaciones
- [ ] Rate limiting en APIs

### Fase 9: Frontend UI/UX
- [ ] Página de inicio (login)
- [ ] Dashboard exalumno (ver matches, publicar posiciones)
- [ ] Dashboard estudiante (ver offers, postular)
- [ ] Directorio searchable
- [ ] Admin panel (moderation, analytics)

### Fase 10: Testing & Deploy
- [ ] Tests unitarios (Jest)
- [ ] Tests de integración (E2E con Cypress)
- [ ] Security audit (OWASP)
- [ ] Performance testing (Lighthouse)
- [ ] Deploy a producción (Vercel + Supabase)

---

## 8. VARIABLES DE ENTORNO REQUERIDAS

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxxxxx

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# OAuth Google
GOOGLE_ID=xxxxxxx.apps.googleusercontent.com
GOOGLE_SECRET=xxxxxxxx

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx

# Email (SendGrid o Resend)
SENDGRID_API_KEY=SG.xxxxx
# O
RESEND_API_KEY=re_xxxxx

# IA (OpenAI para sugerencias)
OPENAI_API_KEY=sk-xxxxx
```

---

## 9. CONCLUSIONES & PRÓXIMOS PASOS

### ✅ Consolidación Completada
- Eliminados 2 duplicados (REPORTES, Sectores)
- Mergeados 2 conjuntos de especificaciones (PDF + HTML)
- Diagrama definitivo: 16 tablas normalizadas
- Arquitectura lista para implementación

### 🚀 Próximos Pasos
1. **Crear migraciones SQL** en Supabase
2. **Implementar APIs** siguiendo la guía por módulo
3. **Desarrollar frontend** con Next.js + UI Library
4. **Testing exhaustivo** antes de go-live
5. **Capacitar a usuarios** (exalumnos, estudiantes, admins)

### 📚 Recursos
- [Supabase Docs](https://supabase.com/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Stripe Integration](https://stripe.com/docs)
- [PostgreSQL Window Functions](https://www.postgresql.org/docs/current/functions-window.html)

---

**Documento preparado para:** Plataforma UCR | **Versión:** 1.0 Final | **Stack:** Supabase + Node.js + Next.js + NextAuth.js + PostgreSQL

¡Listo para implementar! 🎉

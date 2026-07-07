<div align="center">

<img src="public/images/3%20sin%20fondo.png" alt="Alumni UCR" height="110" />

# Alumni UCR — Conectando Talento

**Plataforma sin fines de lucro de la Asociación de Exalumnos de la Universidad de Costa Rica.**
Conecta estudiantes becados con exalumnos dispuestos a ofrecer mentoría, empleo, pasantías, talleres y donaciones.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-BE-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/Licencia-Privada-lightgrey)](#)

</div>

---

## 🌻 ¿Qué es Alumni UCR?

No es una bolsa de empleo genérica: el corazón de la plataforma es un **motor de matching académico** que
conecta a estudiantes de nivel 4-5 con exalumnos de su misma área temática o carrera, para acompañarlos en
su proyecto de graduación. Alrededor de eso crece una red completa de comunidad, donaciones y oportunidades
laborales.

| Rol | Qué hace en la plataforma |
|---|---|
| 🎓 **Estudiante** | Becado UCR nivel 4-5. Publica su proyecto de graduación, recibe sugerencias de mentores y aplica a posiciones. |
| 💼 **Exalumno** | Ofrece mentoría, empleo, pasantías, donaciones o colaboración según su disponibilidad. |
| 🤝 **Voluntario** | Colaborador externo aprobado por administración; dona, ofrece pasantías o accede a proyectos/estudiantes según lo que se le habilite. |
| 🛡️ **Administrador** | Aprueba cuentas, gestiona matching, donaciones, reportes y la comunidad. |

---

## ✨ Funcionalidades principales

- 🔗 **Matching estudiante ↔ exalumno** por carrera, área de interés, sector y tipo de apoyo (ver fórmula abajo).
- 🧑‍🏫 **Mentorías**: solicitud, aceptación y seguimiento con notificación por correo real.
- 💌 **Autenticación completa**: registro por correo institucional (`@ucr.ac.cr`), autodeclaración de exalumnos,
  recuperación de contraseña con código de 6 dígitos, auto-login al registrarse.
- 🌱 **Voluntariado**: página pública de postulación con formulario dinámico (donación, pasantía, mentoría, taller)
  + dashboard interno una vez aprobado.
- 💰 **Donaciones** con comprobante y confirmación administrativa.
- 💼 **Posiciones de empleo y pasantías** con aplicación y selección de candidatos.
- 📰 **Comunidad**: publicaciones y eventos, moderación desde el panel admin.
- 📄 **CV asistido por IA** (Claude) con sugerencias de mejora y proyección de mercado.
- 🌻 **Mascota Alumni**: chatbot flotante con prompts adaptados según el rol y la sección del sitio.
- 🌳 **Mi Legado**: línea de tiempo de impacto, insignias y árbol de mentorías para el exalumno.

---

## 🧮 Algoritmo de matching (estudiante ↔ exalumno)

| Criterio | Puntos | Lógica |
|---|---|---|
| Misma carrera UCR | 30 | Todo o nada |
| Áreas de interés en común | 30 | Proporcional a la intersección |
| Sector del exalumno ↔ área temática del proyecto | 20 | Todo o nada |
| Tipo de apoyo coincide (mentoría / pasantía / empleo) | 20 | Al menos 1 coincidencia |
| **Total** | **100** | |

> El panel de administración ("Gestión de Matches") usa un motor de scoring **distinto e intencionalmente
> separado**, pensado para la revisión manual del admin.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS + CSS Modules |
| Animaciones | GSAP + Framer Motion |
| Backend | Express.js (servidor independiente, no fullstack Next.js) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth (JWT, sin cookies) + verificación por Magic Link / código |
| Correo transaccional | Resend |
| Inteligencia artificial | Claude API (`@anthropic-ai/sdk`) |

---

## 📁 Estructura del proyecto

```
Conectando-Talento-UCR/
├── app/                      # Next.js — App Router (páginas y layouts)
│   ├── api/alumni-chat/      # Endpoint de streaming de la mascota Alumni
│   ├── mi-legado/            # Línea de tiempo, insignias y árbol de impacto
│   ├── voluntariado/         # Página pública de postulación
│   └── admin/                # Panel administrativo
├── BE/                       # Backend Express, independiente
│   ├── services/             # Lógica de negocio (matching, donaciones, fidelización…)
│   ├── controllers/ routes/  # Capa HTTP
│   └── db/                   # Scripts SQL de referencia para Supabase
├── components/               # Componentes de React compartidos
│   ├── landing/               # Landing pública
│   ├── student/                # Shell y widgets del estudiante
│   └── voluntariado/            # Componentes de la página pública de voluntariado
├── lib/                      # Cliente HTTP hacia el BE + capa de datos por dominio
└── context/                  # AuthContext y contexto del perfil del estudiante
```

---

## 🚀 Cómo correrlo localmente

**Requisitos:** Node.js 18+, una cuenta de Supabase, una API key de Resend y una de Anthropic (opcional, para IA).

```bash
# 1. Clonar e instalar dependencias del frontend
git clone https://github.com/R1ve3raaTech/AlumniUCR.git
cd AlumniUCR
npm install

# 2. Instalar dependencias del backend
cd BE
npm install
```

Creá `BE/.env.local` con tus propias claves:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SECRET_KEY=
RESEND_API_KEY=
RESEND_FROM=
APROBACION_CORREO=
ANTHROPIC_API_KEY=
FRONTEND_URL=http://localhost:3000
```

Y en la raíz del proyecto, `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

```bash
# 3. Arrancar el backend
cd BE && npm run dev

# 4. Arrancar el frontend (en otra terminal, desde la raíz)
npm run dev
```

La app queda disponible en `http://localhost:3000`, y la API en `http://localhost:5000/api`.

### Otros comandos útiles

```bash
npm run build   # build de producción del frontend
npm run lint    # linting del frontend
```

---

## 🎨 Identidad de marca

<div align="center">

| Esmeralda | Celeste | Amarillo | Naranja |
|:---:|:---:|:---:|:---:|
| ![#004C63](https://placehold.co/80x40/004C63/004C63.png) | ![#54BCEB](https://placehold.co/80x40/54BCEB/54BCEB.png) | ![#FF9B18](https://placehold.co/80x40/FF9B18/FF9B18.png) | ![#F34B26](https://placehold.co/80x40/F34B26/F34B26.png) |
| `#004C63` | `#54BCEB` | `#FF9B18` | `#F34B26` |

</div>

Tipografías: **Barlow** (titulares) y **Elza Text** (texto principal).

---

## 👥 Equipo

Proyecto desarrollado por el equipo de la Asociación de Exalumnos UCR — con la colaboración de
**Claude** (Anthropic) como asistente de desarrollo a lo largo del proyecto.

---

<div align="center">

Hecho con 💙 y 🧡 para la comunidad UCR.

</div>

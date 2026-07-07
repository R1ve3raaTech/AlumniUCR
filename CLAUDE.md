# Alumni UCR — CLAUDE.md

> Contexto de desarrollo para Claude Code / Antigravity IDE.
> Última actualización: 2026-07-07 — verificado contra el código real de este repo.

---

## Qué es este proyecto

**Alumni UCR** es una plataforma sin fines de lucro de la Asociación de Exalumnos de la Universidad de Costa Rica.
Conecta **exalumnos** con **estudiantes becados (nivel 4-5)** para apoyo en proyectos de graduación, y también
incluye un **motor de matching laboral** (empleo/pasantías, RF-10/13) y un rol de **voluntario** externo con
dashboard propio. No es solo académico/mentoring — el matching sí cubre lo laboral (ver sección de matching abajo).

---

## Arquitectura

```
Conectando-Talento-UCR/
├── app/                    # Next.js (FE) — App Router
│   ├── api/
│   │   └── alumni-chat/route.ts        # Mascota Alumni (chat streaming)
│   ├── mis-matches/page.tsx            # Centro de matches del estudiante (RF-06)
│   ├── configuracion/page.tsx
│   └── admin/                          # Panel admin
├── BE/                      # Express.js separado (BE independiente, NO fullstack Next.js)
│   ├── services/
│   │   ├── matchesMentoriaService.js   # Motor de matching estudiante↔exalumno (RF-06)
│   │   ├── matching.service.js         # Motor DISTINTO — panel admin "Gestión de Matches" (RF-08.1)
│   │   ├── matchesPosicionesService.js # Matching de posiciones/empleo (RF-10)
│   │   └── claude.service.js           # Prompts rol-based para la IA del chatbot
│   ├── routes/
│   └── server.js
├── components/
│   ├── landing/AlumniMascot.tsx        # Widget de chat flotante con mascota
│   ├── student/                        # Dashboard, sidebar, Toast del estudiante
│   └── ExalumnoDashboard.tsx
├── lib/
│   ├── matchesEstudiante.js            # Motor de matching, espejo client-side (RF-06)
│   └── api.js                          # apiFetch() — cliente HTTP hacia el BE
├── context/
│   ├── AuthContext.tsx
│   └── PerfilEstudianteContext.tsx
└── public/images/3 sin fondo.png       # Imagen de la mascota Alumni
```

**Stack:**
- Frontend: Next.js `^16.2.9` + TypeScript + Tailwind CSS (App Router). También se usan **CSS Modules** (`*.module.css`) en landing, matches, chatbot, etc. — no es solo Tailwind.
- Backend: Express.js (`/BE`) — servidor separado con su propio `package.json` (`npm run dev` = nodemon, `npm start` = node).
- DB: Supabase (PostgreSQL) — sin NextAuth, auth custom con Magic Link / JWT.
- IA: Claude API (`@anthropic-ai/sdk`) — modelo por defecto `claude-sonnet-5` (overrideable con `CLAUDE_MODEL`), chat de la mascota en `claude-haiku-4-5-20251001`. Ver `BE/CLAUDE.md` para el detalle completo (hay **dos** integraciones de IA separadas: mascota pública vs. asistente adaptativo por rol).
- Generación de imágenes: Replicate API (`BE/controllers/replicate.controller.js`, `imageController.js`).
- Animaciones: GSAP + Framer Motion (landing).

---

## Matching — hay 3 motores distintos, no 2

No confundir estos tres — cada uno tiene su propia escala y propósito, y **no deben alinearse entre sí**:

### 1. RF-06 — estudiante ↔ exalumno (mentoría) — FUENTE DE VERDAD

BE y FE están **sincronizados** (corregido el 2026-07-02, commit `a8f37fb`):

| Criterio | Puntos | Lógica |
|---|---|---|
| Misma carrera UCR | 30 pts | Todo o nada |
| Áreas de interés en común | 30 pts | Proporcional: `(intersección / total áreas estudiante) * 30` |
| Sector exalumno ↔ área temática del proyecto | 20 pts | Todo o nada |
| Tipo de apoyo coincide (mentoría/pasantía/empleo) | 20 pts | Al menos 1 coincidencia |
| **Total máximo** | **100 pts** | |

**Archivos que implementan este algoritmo (deben mantenerse idénticos):**
1. `BE/services/matchesMentoriaService.js` — función `calcularScore()`, invocada por `generarMatchesPorUsuario()`. Persiste filas reales en la tabla `matches_mentoria`.
2. `lib/matchesEstudiante.js` — función `puntuar()`, usada por `obtenerSugeridos()` para puntuar el directorio en el cliente.

**⚠️ Matices reales de `puntuar()` (no son 100% "todo o nada" como sugiere la tabla):**
- El match de carrera y de sector se hace por **substring** (`includes`), no por igualdad estricta de ID — dos carreras con nombres parecidos pueden matchear sin ser la misma.
- El bloque de "tipo de apoyo" **ignora** la opción de financiamiento/donación como tipo de apoyo válido para este cálculo.
- `components/ExalumnoDashboard.tsx` tiene su **propia copia** del algoritmo (`puntuarEstudiante()`), ligeramente distinta de `lib/matchesEstudiante.js` → `puntuar()`. Si tocás la lógica de scoring en uno, revisá el otro — hoy pueden divergir silenciosamente.

**Flujo real (ya conectado, ya no es cosmético):**
- `lib/matchesEstudiante.js` expone `generarMatches()` → `POST /matches-mentoria/generar`.
- `contactarMatch()` → `PUT /matches-mentoria/:id/contactar` dispara el email real al exalumno.
- Estados: `sugerido → contactado → activo → cerrado` (`cerrado` con `resultado='cancelado'` = rechazado).
- Perfiles suspendidos no aparecen en los matches (RF-09.1).

### 2. RF-08.1 — panel admin "Gestión de Matches"

`BE/services/matching.service.js` — usado solo en `app/admin/matches`. Su score es
`comunes.length + bono interdisciplinario (1 pt si las facultades son distintas)`, en otra
escala completamente distinta a RF-06. **No es el mismo motor que el de arriba.**

### 3. RF-10/13 — posiciones de empleo/pasantías

`BE/services/matchesPosicionesService.js` — motor **laboral**, matchea estudiantes contra
posiciones activas publicadas por exalumnos/voluntarios. Persiste en `matches_posiciones`.

| Criterio | Puntos | Lógica |
|---|---|---|
| Carrera del estudiante ↔ sector de la posición | 35 pts | Todo o nada |
| Habilidades del CV ↔ habilidades requeridas | 35 pts | Proporcional a la intersección |
| Áreas de interés en común | 20 pts | Misma lógica que RF-06 |
| Tipo de apoyo buscado coincide | 10 pts | Todo o nada |
| **Total máximo** | **100 pts** | |

Solo los scores **> 50** aparecen en `/mis-matches` del estudiante (criterio explícito del PDF
de requisitos, ver comentarios en el archivo).

---

## Roles de usuario — son 4, no 3

- **Estudiante** — becado nivel 4-5 UCR, busca mentoring/apoyo para proyecto de graduación.
- **Exalumno** — egresado UCR, ofrece apoyo (mentoría, empleo, pasantía, colaboración, donación).
- **Voluntario** — colaborador externo (no necesariamente exalumno). Se da de alta vía `/voluntariado`
  (formulario dinámico público, RF nuevo) o `/registro/otros` (formulario legacy); ambos crean una
  `solicitud` que un admin aprueba manualmente. Al aprobar, se crea la cuenta rol 4 y se envía correo con
  enlace a `/definir-contraseña`. Tiene su propio dashboard (`components/VoluntarioDashboard.tsx`) con
  acceso a donaciones, publicar posiciones/pasantías, y (si el admin lo habilita) proyectos/mentorías/estudiantes.
  Archivos clave: `BE/controllers/voluntarios.controller.js`, `BE/services/voluntarios.store.js`,
  tabla `solicitudes_voluntarios`.
- **Admin** — gestiona verificación de exalumnos/voluntarios y la plataforma.

**⚠️ El guard de `app/admin/*` es débil en cliente:** `app/admin/layout.tsx` solo verifica que exista un
token en `localStorage` (`ct_auth`), **no valida que el rol sea admin**. Cualquier usuario autenticado
(estudiante, exalumno, voluntario) podría cargar el UI del panel admin en el navegador. La protección real
depende de que cada endpoint del BE rechace por rol (verificar `exigirRol('admin')` en las rutas antes de
asumir que algo está protegido). No tratar esto como "ya seguro" solo porque el layout parece bloquear acceso.

---

## Colores de marca (guía Alumni UCR)

```
Esmeralda:  #004C63  → primary
Celeste:    #54BCEB  → secondary
Amarillo:   #FF9B18
Naranja:    #F34B26
Blanco:     #FFFFFF
Negro:      #141414
```
Tipografías: Barlow (titulares), Elza Text (texto principal). Aplicar siempre esta guía en cualquier pantalla o componente nuevo del FE.

---

## Mascota Alumni

- Componente: `components/landing/AlumniMascot.tsx`.
- Imagen: `/public/images/3 sin fondo.png` (única imagen de la mascota que usa el código — cualquier otra imagen de mascota en `public/images/` está sin usar).
- Chat streaming vía `app/api/alumni-chat/route.ts`.
- Hoy es widget flotante — pendiente integrarla en más puntos de la landing (hero, sección de sostenibilidad, CTA final).
- **⚠️ El system prompt de `app/api/alumni-chat/route.ts` está desactualizado respecto al producto real**:
  describe roles "Estudiante, Empresa, Admin" (falta Exalumno y Voluntario) y auth "Magic Link sin
  contraseña" — el login real hoy es correo + contraseña. Corregir el prompt antes de confiar en que la
  mascota le da información correcta a un usuario sobre cómo registrarse o iniciar sesión.
- Existe una integración de IA **separada** (`GlobalChatbot.tsx` → `/claude/chat` en el BE) con prompts
  adaptativos por rol/ruta — ver `BE/CLAUDE.md` sección 0 para no confundirlas.

---

## Supabase — Tablas relevantes (verificadas contra el código)

- `usuarios` — perfil base (id, email, rol, nombre, foto_perfil).
- `informacion_estudiante` — carrera, facultad, sede, proyecto, áreas de interés.
- `informacion_exalumno` — carreras, sectores, áreas de experiencia, apoyo ofrecido.
- `matches_mentoria` — motor de matching RF-06 (estado, score).
- `matches_posiciones` — matching de posiciones/empleo (RF-10).
- `proyecto_graduacion`, `areas_interes*`, `sectores*`, `carreras*`, `facultades`, `cv_versiones`, `donaciones`.

**Nota:** no existe una vista `directorio_exalumnos` en la base de datos. El directorio se arma en `BE/services/perfilExalumno.service.js` uniendo `informacion_exalumno` con `usuarios` directamente.

---

## Funcionalidades que faltaban en versiones anteriores de este doc

- **Gamificación "Mi Legado"** (`/mi-legado`, `BE/services/fidelizacion.service.js`) — XP, insignias,
  línea de tiempo de impacto, árbol de mentorías y leaderboards, con datos reales de Supabase (no hardcodeado).
- **Bolsa de empleo/pasantías completa** (RF-10/13) — publicación de posiciones, aplicación de estudiantes,
  selección de candidatos, motor de matching propio (ver sección de matching arriba).
- **Generación de imágenes con Replicate** — `BE/controllers/replicate.controller.js`, `imageController.js`.

## Placeholders activos ("en reconstrucción")

Estas páginas existen en el árbol de rutas pero muestran un placeholder, no la funcionalidad real —
no asumir que están implementadas solo porque el archivo existe:
- `app/mis-aplicaciones/page.tsx`
- `app/mi-curriculum/preview/page.tsx`
- `app/mi-curriculum/adaptar/[id]/page.tsx`

## Tareas pendientes conocidas

- **`ANTHROPIC_API_KEY`** debe estar configurada en `BE/.env.local` para que respondan la IA de CV y el chatbot (no commitear esta key — usar `.env.local`, nunca un archivo de prueba tipo `test-key.js` trackeado por git).
- ~~Recordatorio 48h de donaciones: falta el cron~~ — **ya implementado**: `server.js` (líneas ~164-181) corre un cron con `node-cron` cada hora (`0 * * * *`) que revisa donaciones pendientes con más de **24h** (no 48h) y reenvía el correo al admin vía `enviarRecordatorioDonacionesPendientes()`.
- **Explicación de match por IA** (`obtenerExplicacionMatchIA` en `lib/matchesEstudiante.js`, ruta `/matches-mentoria/:id/explicacion-ia`) — confirmar que el BE la sirve antes de exponerla en UI.
- **Integración de la mascota en más puntos de la landing** (hoy solo widget flotante).
- **Stats dinámicos desde Supabase** — algunas métricas de la landing siguen hardcodeadas.
- **Reconciliar** el rediseño de `admin/matches` de la rama `Braks` con el oficial RF-08.1 ya en `Dev` (dos versiones distintas del mismo panel, pendiente de que Braks decida cuál queda).
- **Guard de admin en cliente débil** (ver sección de roles arriba) — evaluar si vale la pena agregar verificación de rol en `app/admin/layout.tsx`, aunque el BE ya rechace por rol.
- **`puntuarEstudiante()` duplicado** en `ExalumnoDashboard.tsx` vs `puntuar()` en `lib/matchesEstudiante.js` — evaluar si conviene unificarlos en un solo módulo compartido para evitar que diverjan.

---

## Convenciones del proyecto

- Español en comentarios, UI y mensajes de error al usuario.
- Inglés en nombres de variables/funciones/archivos.
- Tailwind CSS + CSS Modules conviven (no es solo uno u otro — usar CSS Modules para estilos de componente específicos, Tailwind para utilidades).
- `apiFetch()` de `lib/api.js` para todas las llamadas al BE.
- Autenticación: token JWT en header `Authorization: Bearer <token>` — sin cookies.
- Notificaciones al usuario: `notificar()` de `components/student/Toast`.

---

## Comandos útiles

```bash
# Arrancar FE (Next.js)
npm run dev

# Arrancar BE (Express)
cd BE && npm run dev

# Build FE
npm run build

# Lint FE
npm run lint
```

---

## Reglas de git del equipo

- El repositorio vive en `github.com/R1ve3raaTech/Conectando-Talento-UCR` (dueño: Camil, líder del proyecto desde 2026-07-06). Equipo: Camil, Stacy, Braksley, Steven.
- **Camil aprueba/mergea los PRs hacia `Dev`.** Pushear a ramas de otros compañeros requiere su autorización explícita.
- Antes de mergear `Dev` en otra rama, verificar con `git merge-tree` que no haya conflictos con trabajo en curso de otro compañero (p. ej. `admin/matches` tiene dos versiones distintas: Braks vs. RF-08.1).

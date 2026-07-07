# Alumni UCR — CLAUDE.md

> Contexto de desarrollo para Claude Code / Antigravity IDE.
> Última actualización: 2026-07-02 — verificado contra el código real de este repo.

---

## Qué es este proyecto

**Alumni UCR** es una plataforma sin fines de lucro de la Asociación de Exalumnos de la Universidad de Costa Rica.
Conecta **exalumnos** con **estudiantes becados (nivel 4-5)** para apoyo en proyectos de graduación.
No es una app de empleo genérica — el matching es académico/mentoring, no laboral.

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
- IA: Claude API (`@anthropic-ai/sdk`) — modelo por defecto `claude-sonnet-4-6` (overrideable con `CLAUDE_MODEL`), chat de la mascota en `claude-haiku-4-5-20251001`.
- Animaciones: GSAP + Framer Motion (landing).

---

## Algoritmo de Matching RF-06 (estudiante ↔ exalumno) — FUENTE DE VERDAD

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

**Flujo real (ya conectado, ya no es cosmético):**
- `lib/matchesEstudiante.js` expone `generarMatches()` → `POST /matches-mentoria/generar`.
- `contactarMatch()` → `PUT /matches-mentoria/:id/contactar` dispara el email real al exalumno.
- Estados: `sugerido → contactado → activo → cerrado` (`cerrado` con `resultado='cancelado'` = rechazado).
- Perfiles suspendidos no aparecen en los matches (RF-09.1).

**⚠️ No confundir con `BE/services/matching.service.js`** — es un motor **distinto e intencionalmente separado**, usado solo en el panel de administración (`app/admin/matches`, RF-08.1 "Gestión de Matches"). Su score es `comunes.length + bono interdisciplinario (1 pt si las facultades son distintas)`, en otra escala, y no debe alinearse con el de RF-06.

---

## Roles de usuario

- **Estudiante** — becado nivel 4-5 UCR, busca mentoring/apoyo para proyecto de graduación.
- **Exalumno** — egresado UCR, ofrece apoyo (mentoría, empleo, pasantía, colaboración, donación).
- **Admin** — gestiona verificación de exalumnos y la plataforma.

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

## Tareas pendientes conocidas

- **`ANTHROPIC_API_KEY`** debe estar configurada en `BE/.env.local` para que respondan la IA de CV y el chatbot (no commitear esta key — usar `.env.local`, nunca un archivo de prueba tipo `test-key.js` trackeado por git).
- **Recordatorio 48h de donaciones**: el endpoint existe en el BE, falta el cron/disparo.
- **Explicación de match por IA** (`obtenerExplicacionMatchIA` en `lib/matchesEstudiante.js`, ruta `/matches-mentoria/:id/explicacion-ia`) — confirmar que el BE la sirve antes de exponerla en UI.
- **Integración de la mascota en más puntos de la landing** (hoy solo widget flotante).
- **Stats dinámicos desde Supabase** — algunas métricas de la landing siguen hardcodeadas.
- **Reconciliar** el rediseño de `admin/matches` de la rama `Braks` con el oficial RF-08.1 ya en `Dev` (dos versiones distintas del mismo panel, pendiente de que Braks decida cuál queda).

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

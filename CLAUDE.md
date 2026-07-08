# Alumni UCR — CLAUDE.md

> Contexto de desarrollo para Claude Code / Antigravity IDE.
> Última actualización: 2026-07-07 — verificado contra el código real de este repo (exploración exhaustiva de app/, BE/, lib/, context/, components/).

---

## Qué es este proyecto

**Alumni UCR** es una plataforma sin fines de lucro de la Asociación de Exalumnos de la Universidad de Costa Rica.
Conecta **exalumnos** con **estudiantes becados (nivel 4-5)** para apoyo en proyectos de graduación.

**Corrección (2026-07-07):** el matching NO es solo académico/mentoring. Además del motor de mentoría (RF-06), existe una bolsa de empleo/pasantías real y funcional (RF-10/RF-13, `app/posiciones/*`, `BE/services/matchesPosicionesService.js`) con su propio scoring. Ver sección "Algoritmos de Matching" más abajo.

---

## Arquitectura

```
Conectando-Talento-UCR/
├── app/                    # Next.js (FE) — App Router
│   ├── api/                             # Route Handlers de Next.js — llaman directo a terceros, NO pasan por apiFetch/BE
│   │   ├── alumni-chat/route.ts        # Mascota Alumni (chat streaming, Anthropic)
│   │   ├── resumen-usuario/route.ts    # Resumen IA de usuario para admin (Anthropic)
│   │   └── replicate/route.js          # Generación de imágenes (Replicate)
│   ├── mis-matches/page.tsx            # Centro de matches del estudiante (RF-06)
│   ├── posiciones/, mis-posiciones/    # Bolsa de empleo/pasantías (RF-10/RF-13)
│   ├── mi-legado/                      # Gamificación del exalumno (XP, logros, árbol de impacto)
│   ├── configuracion-voluntario/       # Configuración del rol Voluntario
│   ├── configuracion/page.tsx
│   └── admin/                          # Panel admin (⚠️ sin gating de rol en cliente, ver Roles de usuario)
├── BE/                      # Express.js separado (BE independiente, NO fullstack Next.js)
│   ├── config/              # claude.js, supabase.js (service_role), supabaseAuth.js (anon), faqs.js
│   ├── middlewares/         # auth.middleware.js (JWT+bloquea suspendidos), role.middleware.js, error.middleware.js
│   ├── services/            # 68 archivos, patrón routes→controllers→services→Supabase
│   │   ├── matchesMentoriaService.js   # Motor de matching estudiante↔exalumno (RF-06)
│   │   ├── matching.service.js         # Motor DISTINTO — panel admin "Gestión de Matches" (RF-08.1)
│   │   ├── matchesPosicionesService.js # Motor DISTINTO — matching de posiciones/empleo (RF-10)
│   │   ├── claude.service.js           # 7 prompts rol-based para el chatbot (GlobalChatbot)
│   │   ├── admin.service.js            # cron de recordatorio de donaciones >24h
│   │   └── voluntarios.store.js        # acceso a solicitudes_voluntarios
│   ├── controllers/         # 59 archivos (incl. voluntarios.controller.js)
│   ├── routes/               # 41 archivos
│   ├── db/                  # migraciones SQL manuales (sin ORM, aplicar en Supabase SQL Editor)
│   └── server.js             # monta routers, CORS, cron (node-cron, cada hora)
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

**⚠️ Existe un TERCER motor, distinto de los otros dos:** `BE/services/matchesPosicionesService.js` — matching **estudiante ↔ puesto de empleo/pasantía** (RF-10/RF-13), persiste en tabla `matches_posiciones` (upsert `onConflict: 'id_estudiante,id_posicion'`). Score propio de 100 pts:

| Criterio | Puntos | Lógica |
|---|---|---|
| Carrera → facultad → sector (tabla hardcodeada `MAPA_FACULTAD_SECTORES`, 14 facultades UCR) vs. `sectores_empleo` del puesto | 35 pts | Todo o nada |
| Habilidades técnicas del CV vs. `puestos_empleo.habilidades` | 35 pts | Proporcional (intersección) |
| Áreas de interés del proyecto vs. áreas del puesto | 20 pts | Proporcional (misma lógica que RF-06) |
| `busca_empleo`/`busca_pasantia` coincide con `puesto.tipo` | 10 pts | Todo o nada |

`obtenerMisMatchesPosiciones` solo devuelve resultados con `score_match > 50` (filtro explícito en el código). También respeta RF-09.1 (exalumnos publicadores suspendidos quedan filtrados).

**Nota sobre `lib/matchesEstudiante.js` (`puntuar()`, espejo client-side de RF-06):** implementa fielmente la tabla 30/30/20/20, pero con dos matices frente al backend: (1) el match de carrera y de sector es por *substring normalizado* (`includes`), no por igualdad estricta de ID; (2) el bloque de "tipo de apoyo" (20 pts) solo compara `mentoria/pasantia/empleo` e ignora `financiamiento` del lado del estudiante. Además, `components/ExalumnoDashboard.tsx` reimplementa una copia paralela casi idéntica (`puntuarEstudiante()`, para puntuar estudiantes desde el lado del exalumno) que SÍ considera `financiamiento`↔`ofrece_donacion` y usa igualdad estricta en carrera — es decir, hay dos implementaciones ligeramente distintas del mismo algoritmo que pueden divergir si se edita una sin la otra.

---

## Roles de usuario

Son **4 roles**, no 3 (corrección 2026-07-07 — `lib/useRequireRole.ts` define `Rol = 'estudiante' | 'exalumno' | 'voluntario' | 'admin'`):

- **Estudiante** — becado nivel 4-5 UCR, busca mentoring/apoyo para proyecto de graduación.
- **Exalumno** — egresado UCR, ofrece apoyo (mentoría, empleo, pasantía, colaboración, donación).
- **Voluntario** — rol adicional para colaboradores externos que no son exalumnos ni estudiantes UCR. Se postula públicamente vía `/voluntariado` o `/registro/otros`, un admin aprueba la solicitud (`BE/controllers/voluntarios.controller.js`, tabla `solicitudes_voluntarios`) y esto crea la cuenta + envía correo para definir contraseña (`/definir-contrasena`). Dashboard propio: `components/VoluntarioDashboard.tsx`. Sus accesos (a proyectos/mentorías/estudiantes) son flags que el admin habilita individualmente, no un perfil editable tipo exalumno.
- **Admin** — gestiona verificación de exalumnos y la plataforma. **⚠️ Ninguna página bajo `app/admin/*` valida el rol `admin` en el cliente** — el layout y las páginas solo comprueban que exista un token en `localStorage` (`ct_auth`). La protección real, si existe, depende de que el backend rechace las llamadas por rol.

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
- Chat streaming vía `app/api/alumni-chat/route.ts` (Route Handler de Next.js, llama directo a Anthropic con `ANTHROPIC_API_KEY` — no pasa por `apiFetch`/BE Express).
- Hoy es widget flotante — pendiente integrarla en más puntos de la landing (hero, sección de sostenibilidad, CTA final).
- **⚠️ El `SYSTEM_PROMPT` de `app/api/alumni-chat/route.ts` describe una versión vieja/distinta del producto** (dice "Roles: Estudiante, Empresa, Admin" — no menciona Exalumno ni Voluntario; dice "Autenticación: Magic Link, sin contraseñas" — el login real es correo+contraseña, magic link es solo respaldo en registro de exalumno). Revisar antes de citarlo como fuente de verdad del producto.
- Existe un **segundo chatbot, distinto del widget de la landing**: `components/GlobalChatbot.tsx`, que sí usa `apiFetch()`/BE Express (`BE/routes` → `claude.service.js`) y adapta 7 prompts de sistema distintos según rol (`visitante/estudiante/exalumno/admin`) y `pathname` — ver `PROMPTS` en `BE/services/claude.service.js`.

---

## Supabase — Tablas relevantes (verificadas contra el código)

- `usuarios` — perfil base (id, email, rol, nombre, foto_perfil).
- `informacion_estudiante` — carrera, facultad, sede, proyecto, áreas de interés.
- `informacion_exalumno` — carreras, sectores, áreas de experiencia, apoyo ofrecido.
- `matches_mentoria` — motor de matching RF-06 (estado, score).
- `matches_posiciones` — matching de posiciones/empleo (RF-10), motor **distinto** de `matches_mentoria` (ver `BE/services/matchesPosicionesService.js`).
- `puestos_empleo`, `aplicantes` — bolsa de empleo/pasantías (RF-10/RF-13): publicación de posiciones por exalumnos y postulación de estudiantes.
- `solicitudes_voluntarios` — solicitudes de alta del rol Voluntario (nombre, tipo de ayuda, foto_perfil, biografía — 3 migraciones incrementales en `BE/db/`), gestionadas por `BE/controllers/voluntarios.controller.js`.
- `proyecto_graduacion`, `areas_interes*`, `sectores*`, `carreras*`, `facultades`, `cv_versiones`, `donaciones`.

**Nota:** no existe una vista `directorio_exalumnos` en la base de datos. El directorio se arma en `BE/services/perfilExalumno.service.js` uniendo `informacion_exalumno` con `usuarios` directamente.

---

## Gamificación "Mi Legado" (feature no trivial, antes ausente de este doc)

- Sistema de XP y logros para exalumnos: `pionero`, `mecenas`, `mentor_activo`, `mentor_oro`, `gran_impacto`.
- FE: `app/mi-legado/page.tsx` (panel) y `app/mi-legado/arbol/page.tsx` (vista fullscreen del "Árbol de Impacto Cibernético", componente `components/ArbolImpactoCibernetico.tsx`).
- BE: dominio `fidelizacion` (`/api/fidelizacion/mi-legado`, `/api/fidelizacion/leaderboards`).
- Consumido también dentro de `components/ExalumnoDashboard.tsx` (`obtenerMiLegado`, `obtenerLeaderboards`).

---

## Tareas pendientes conocidas

- **`ANTHROPIC_API_KEY`** debe estar configurada en `BE/.env.local` para que respondan la IA de CV y el chatbot (no commitear esta key — usar `.env.local`, nunca un archivo de prueba tipo `test-key.js` trackeado por git).
- ~~Recordatorio 48h de donaciones: falta el cron/disparo~~ — **corrección 2026-07-07: el cron YA existe y corre.** `BE/server.js` (~línea 164) usa `node-cron` para ejecutar `enviarRecordatorioDonacionesPendientes()` (`BE/services/admin.service.js`) **cada hora**, con umbral real de **24h** pendiente (no 48h — no hay ninguna referencia a "48h" en el código).
- **Explicación de match por IA** (`obtenerExplicacionMatchIA` en `lib/matchesEstudiante.js`, ruta `/matches-mentoria/:id/explicacion-ia`) — el BE sí la implementa (`generarExplicacionIA()` en `matchesMentoriaService.js`, llama a Claude para redactar la explicación en prosa); confirmar que esté expuesta/consumida en la UI de `mis-matches`.
- **Integración de la mascota en más puntos de la landing** (hoy solo widget flotante).
- **Stats dinámicos desde Supabase** — algunas métricas de la landing siguen hardcodeadas (p. ej. `ProyectosGraduacion.tsx` en la landing usa 10 proyectos de ejemplo explícitamente marcados como ilustrativos, no de base real).
- **Reconciliar** el rediseño de `admin/matches` de la rama `Braks` con el oficial RF-08.1 ya en `Dev` (dos versiones distintas del mismo panel, pendiente de que Braks decida cuál queda).
- **Gating de rol admin ausente en el cliente** (`app/admin/*` solo verifica token, no rol) — evaluar si vale la pena reforzarlo en frontend o si se confía 100% en el backend.
- **Placeholders "EN RECONSTRUCCIÓN"** sin funcionalidad real: `app/mis-aplicaciones/page.tsx`, `app/mi-curriculum/preview/page.tsx`, `app/mi-curriculum/adaptar/[id]/page.tsx` (adaptar CV a una posición con IA).
- **System prompt desactualizado** en `app/api/alumni-chat/route.ts` (ver sección Mascota Alumni) — no reflexiona los roles/auth reales del producto.

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

# Alumni UCR — CLAUDE.md

> Contexto de desarrollo para Claude Code / Antigravity IDE.
> Última actualización: 2026-11-03 — verificado contra el código real de este repo.

> **Nota de peso (2026-11-04):** `public/` pasó de **95 MB a 14 MB**. El culpable principal era
> `images/UCR.mp4` (**72 MB**), que ya había sido reemplazado por `video-ucr.mp4` pero quedó en el repo
> deployándose. Las imágenes que sí se usan se recomprimieron **sin cambiar dimensiones ni rutas**
> (verificado: las 51 conservan su tamaño exacto). Reglas aplicadas, por si hay que repetirlo:
> - JPEG → mozjpeg q82 progresivo.
> - Logos/gráficos planos → PNG con paleta (medido como imperceptible).
> - Fotos guardadas como PNG sin transparencia → bytes JPEG **manteniendo el nombre `.png`**
>   (precedente que ya existía en `campus.png` / `ecosistema-ucr.png`; en `gustavo-machado.png` el nombre
>   es obligatorio porque esa ruta puede estar guardada en Supabase por el seed).
> - La mascota se dejó en paleta q100 a propósito: a q80 aparecían artefactos en el borde transparente.
> - Fuente Elza Text: se agregó `elza-text.woff2` (56 KB) y el `.otf` (130 KB) quedó solo como respaldo.
>
> **Antes de subir una imagen nueva:** pasala por compresión. Una foto de perfil no debería pesar más de
> ~100 KB, y un logo plano menos de ~30 KB.
>
> **Pendientes de peso (no hechos):** `images/video-ucr.mp4` sigue en **4.7 MB** y se descarga en el hero
> del landing — hace falta `ffmpeg` para recomprimirlo (no estaba disponible). Y hay **33 `<img>` crudos**
> que no usan `next/image`, así que no se benefician de WebP/AVIF ni del redimensionado automático;
> migrarlos es el siguiente ahorro grande, pero toca render, así que requiere revisar diseño.

> **Nota de limpieza (2026-11-03):** se borraron 30 archivos del BackEnd que nunca se importaban —
> sobras del refactor BE→BackEnd, donde cada `X.js` tenía ya su reemplazo vivo `XService.js` (varios con
> typos en el nombre: `becaSocioecomica.js`, `proyectoGraducaion.js`, `responsibilidades.js`). Eran una
> trampa: editar el archivo equivocado no tenía ningún efecto. Verificado tras el borrado: los 148 módulos
> restantes del BackEnd cargan sin fallas. Si buscás un servicio y no lo hallás, es `*Service.js`.

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
├── BackEnd/                      # Express.js separado (BackEnd independiente, NO fullstack Next.js)
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
│   └── api.js                          # apiFetch() — cliente HTTP hacia el BackEnd
├── context/
│   ├── AuthContext.tsx
│   └── PerfilEstudianteContext.tsx
└── public/images/3 sin fondo.png       # Imagen de la mascota Alumni
```

**Stack:**
- Frontend: Next.js `^16.2.9` + TypeScript + Tailwind CSS (App Router). También se usan **CSS Modules** (`*.module.css`) en landing, matches, chatbot, etc. — no es solo Tailwind.
- Backend: Express.js (`/BackEnd`) — servidor separado con su propio `package.json` (`npm run dev` = nodemon, `npm start` = node).
- DB: Supabase (PostgreSQL) — sin NextAuth, auth custom con Magic Link / JWT.
- IA: Claude API (`@anthropic-ai/sdk`) — modelo por defecto `claude-sonnet-5` (overrideable con `CLAUDE_MODEL`), chat de la mascota en `claude-haiku-4-5-20251001`. Ver `BackEnd/CLAUDE.md` para el detalle completo (hay **dos** integraciones de IA separadas: mascota pública vs. asistente adaptativo por rol).
- Generación de imágenes: Replicate API. Dos implementaciones vivas y equivalentes: `app/api/replicate/route.js` (Next.js) y `BackEnd/controllers/common/replicate.controller.js` (Express, montado en `/api/replicate`). **Ninguna UI las llama todavía.**
- Animaciones: GSAP + Framer Motion (landing).

---

## Matching — hay 3 motores distintos, no 2

No confundir estos tres — cada uno tiene su propia escala y propósito, y **no deben alinearse entre sí**:

### 1. RF-06 — estudiante ↔ exalumno (mentoría) — FUENTE DE VERDAD

BackEnd y FE están **sincronizados** (corregido el 2026-07-02, commit `a8f37fb`):

| Criterio | Puntos | Lógica |
|---|---|---|
| Misma carrera UCR | 30 pts | Todo o nada |
| Áreas de interés en común | 30 pts | Proporcional: `(intersección / total áreas estudiante) * 30` |
| Sector exalumno ↔ área temática del proyecto | 20 pts | Todo o nada |
| Tipo de apoyo coincide (mentoría/pasantía/empleo) | 20 pts | Al menos 1 coincidencia |
| **Total máximo** | **100 pts** | |

**Archivos que implementan este algoritmo (deben mantenerse idénticos):**
1. `BackEnd/services/matching/matchesMentoriaService.js` — función `calcularScore()`, invocada por `generarMatchesPorUsuario()`. Persiste filas reales en la tabla `matches_mentoria`.
2. `lib/matching/matchesEstudiante.js` — función `puntuar()`, usada por `obtenerSugeridos()` para puntuar el directorio en el cliente.

**⚠️ Matices reales de `puntuar()` (no son 100% "todo o nada" como sugiere la tabla):**
- El match de carrera y de sector se hace por **substring** (`includes`), no por igualdad estricta de ID — dos carreras con nombres parecidos pueden matchear sin ser la misma.
- El bloque de "tipo de apoyo" **ignora** la opción de financiamiento/donación como tipo de apoyo válido para este cálculo.
- `components/dashboard/ExalumnoDashboard.tsx` tiene su **propia copia** del algoritmo (`puntuarEstudiante()`), ligeramente distinta de `lib/matching/matchesEstudiante.js` → `puntuar()`. Si tocás la lógica de scoring en uno, revisá el otro — hoy pueden divergir silenciosamente.

**Flujo real (ya conectado, ya no es cosmético):**
- `lib/matching/matchesEstudiante.js` expone `generarMatches()` → `POST /matches-mentoria/generar`.
- `contactarMatch()` → `PUT /matches-mentoria/:id/contactar` dispara el email real al exalumno.
- Estados: `sugerido → contactado → activo → cerrado` (`cerrado` con `resultado='cancelado'` = rechazado).
- Perfiles suspendidos no aparecen en los matches (RF-09.1).

### 2. RF-08.1 — panel admin "Gestión de Matches"

`BackEnd/services/matching/matching.service.js` — usado solo en `app/admin/matches`. Su score es
`comunes.length + bono interdisciplinario (1 pt si las facultades son distintas)`, en otra
escala completamente distinta a RF-06. **No es el mismo motor que el de arriba.**

### 3. RF-10/13 — posiciones de empleo/pasantías

`BackEnd/services/matching/matchesPosicionesService.js` — motor **laboral**, matchea estudiantes contra
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
  enlace a `/definir-contraseña`. Tiene su propio dashboard (`components/dashboard/VoluntarioDashboard.tsx`) con
  acceso a donaciones, publicar posiciones/pasantías, y (si el admin lo habilita) proyectos/mentorías/estudiantes.
  Archivos clave: `BackEnd/controllers/voluntariado/voluntarios.controller.js`, `BackEnd/services/voluntariado/voluntarios.store.js`,
  tabla `solicitudes_voluntarios`.
- **Admin** — gestiona verificación de exalumnos/voluntarios y la plataforma.

**Guard de `app/admin/*` (corregido el 2026-11-03):** `app/admin/layout.tsx` ahora valida el rol contra el
BackEnd (`obtenerPerfil()` → `roles.nombre === 'admin'`) y redirige a `/dashboard` a cualquier usuario
autenticado que no sea admin; antes solo comprobaba que existiera un token en `localStorage` (`ct_auth`), así
que un estudiante/exalumno/voluntario podía cargar el UI del panel. Aun así, la protección **real** de los
datos sigue dependiendo de que cada endpoint del BackEnd rechace por rol (verificar `exigirRol('admin')` en
las rutas): el guard del layout es solo UX, no seguridad.

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
- El system prompt de `app/api/alumni-chat/route.ts` **ya está al día** (verificado 2026-11-03): declara los
  4 roles reales y "correo y contraseña" como login. La advertencia anterior de este doc sobre roles
  "Estudiante, Empresa, Admin" y "Magic Link" quedó obsoleta — el prompt ya no dice eso.
- Existe una integración de IA **separada** (`GlobalChatbot.tsx` → `/claude/chat` en el BackEnd) con prompts
  adaptativos por rol/ruta — ver `BackEnd/CLAUDE.md` sección 0 para no confundirlas.

---

## Supabase — Tablas relevantes (verificadas contra el código)

- `usuarios` — perfil base (id, email, rol, nombre, foto_perfil).
- `informacion_estudiante` — carrera, facultad, sede, proyecto, áreas de interés.
- `informacion_exalumno` — carreras, sectores, áreas de experiencia, apoyo ofrecido.
- `matches_mentoria` — motor de matching RF-06 (estado, score).
- `matches_posiciones` — matching de posiciones/empleo (RF-10).
- `proyecto_graduacion`, `areas_interes*`, `sectores*`, `carreras*`, `facultades`, `cv_versiones`, `donaciones`.

**Nota:** no existe una vista `directorio_exalumnos` en la base de datos. El directorio se arma en `BackEnd/services/perfil/perfilExalumno.service.js` uniendo `informacion_exalumno` con `usuarios` directamente.

---

## Funcionalidades que faltaban en versiones anteriores de este doc

- **Gamificación "Mi Legado"** (`/mi-legado`, `BackEnd/services/fidelizacion/fidelizacion.service.js`) — XP, insignias,
  línea de tiempo de impacto, árbol de mentorías y leaderboards, con datos reales de Supabase (no hardcodeado).
- **Bolsa de empleo/pasantías completa** (RF-10/13) — publicación de posiciones, aplicación de estudiantes,
  selección de candidatos, motor de matching propio (ver sección de matching arriba).
- **Generación de imágenes con Replicate** — `BackEnd/controllers/common/replicate.controller.js` y
  `app/api/replicate/route.js`. El endpoint funciona, pero **ningún componente del FE lo consume todavía**.
  (`imageController.js` / `imageRoutes.js` eran un tercer borrador en ESM que no podía cargar en este
  proyecto CommonJS y no estaba montado: borrados el 2026-11-03.)

## Placeholders activos ("en reconstrucción")

Estas páginas existen en el árbol de rutas pero muestran un placeholder, no la funcionalidad real —
no asumir que están implementadas solo porque el archivo existe:
- `app/mis-aplicaciones/page.tsx`
- `app/mi-curriculum/preview/page.tsx`
- `app/mi-curriculum/adaptar/[id]/page.tsx`

## Tareas pendientes conocidas

- **`ANTHROPIC_API_KEY`** debe estar configurada en `BackEnd/.env.local` para que respondan la IA de CV y el chatbot (no commitear esta key — usar `.env.local`, nunca un archivo de prueba tipo `test-key.js` trackeado por git).
- ~~Recordatorio 48h de donaciones: falta el cron~~ — **ya implementado**: `server.js` (líneas ~164-181) corre un cron con `node-cron` cada hora (`0 * * * *`) que revisa donaciones pendientes con más de **24h** (no 48h) y reenvía el correo al admin vía `enviarRecordatorioDonacionesPendientes()`.
- **Explicación de match por IA** (`obtenerExplicacionMatchIA` en `lib/matching/matchesEstudiante.js`, ruta `/matches-mentoria/:id/explicacion-ia`) — confirmar que el BackEnd la sirve antes de exponerla en UI.
- **Integración de la mascota en más puntos de la landing** (hoy solo widget flotante).
- **Stats dinámicos desde Supabase** — algunas métricas de la landing siguen hardcodeadas.
- **Reconciliar** el rediseño de `admin/matches` de la rama `Braks` con el oficial RF-08.1 ya en `Dev` (dos versiones distintas del mismo panel, pendiente de que Braks decida cuál queda).
- ~~Guard de admin en cliente débil~~ — **ya corregido** (2026-11-03): `app/admin/layout.tsx` valida el rol
  contra el BackEnd. Ver la sección de roles arriba.
- **Feature de Replicate sin consumidor** — el endpoint de generación de imágenes funciona en dos lados pero
  ninguna pantalla lo usa. Decidir si se conecta a alguna UI o se retira.
- **`/mis-aplicaciones` enlazado pero en reconstrucción** — el menú del estudiante lleva a un placeholder.
  Valorar esconder el enlace hasta que la pantalla exista, para no mandar al usuario a un callejón.
- **`puntuarEstudiante()` duplicado** en `ExalumnoDashboard.tsx` vs `puntuar()` en `lib/matching/matchesEstudiante.js` — evaluar si conviene unificarlos en un solo módulo compartido para evitar que diverjan.

---

## Seguridad — reglas que NO se pueden romper

> Auditoría completa hecha el 2026-11-05. Lo de abajo no es teoría: cada punto
> corresponde a un agujero real que estaba abierto en este repo.

### 1. El BackEnd corre con `service_role`, así que la BD no protege nada

`config/supabase.js` usa la clave `service_role`, que **omite RLS por completo**.
Consecuencia: la base de datos **no es una red de seguridad**. Toda la
autorización vive en el código de Express. Si a un endpoint le falta una
comprobación, el dato queda expuesto — no hay segunda línea de defensa.

### 2. `exigirRol` NO alcanza: hay que verificar propiedad

`exigirRol` dice *qué es* el usuario, no *si el recurso es suyo*. Faltando eso,
había **18 endpoints con IDOR**: un estudiante autenticado podía editar o
borrar los datos de otro cambiando el id en la URL (su proyecto de graduación,
carrera, habilidades, certificaciones, experiencia), y un exalumno lo mismo con
los suyos y con las posiciones de empleo publicadas por otro.

**Al crear un endpoint que recibe un id por la URL, usá
`middlewares/ownership.middleware.js`:**

| situación | middleware |
|---|---|
| el parámetro ES el id del usuario | `exigirUsuarioPropio('idUsuario')` |
| el parámetro es el id de una fila | `exigirPropiedadFila({ tabla, columnaDueno })` |
| la fila es hija de un proyecto | `exigirPropiedadViaProyecto({ tabla })` |

El rol `admin` siempre pasa. Cuando el recurso es de otro se responde **404, no
403**, a propósito: un 403 confirmaría que ese id existe.
Cubierto por tests: `BackEnd/tests/ownership.middleware.test.js` (`npm test`).

### 3. Nunca metas texto de usuario o de IA en HTML sin escapar

Había **dos XSS** por `dangerouslySetInnerHTML`:
- `app/mentorias/exalumno/page.tsx` volcaba la salida de la IA sin escapar. La IA
  resume perfiles escritos por otros usuarios, así que un `<img src=x onerror=…>`
  en un perfil ejecutaba script **en el navegador del exalumno**. Con el JWT en
  `localStorage`, eso es robo de sesión.
- `app/proyecto-graduacion/vista-previa/page.tsx` interpolaba los campos del
  proyecto, que además se exportan a un `.doc` que se comparte con tutores.

Ambos escapan ahora **antes** de generar el HTML. Si agregás markdown o
plantillas HTML, escapá primero y generá las etiquetas después.

### 4. La clave que firma los enlaces de correo falla cerrado

`utils/aprobacionToken.js` firma los tokens de restablecer contraseña, confirmar
correo y aprobar cuentas. Tenía un respaldo literal `'dev-approval-secret'`
**publicado en este repositorio**: con él, cualquiera que supiera el UUID de un
usuario podía falsificar su enlace de reset y tomarle la cuenta. Ese respaldo se
eliminó y el servidor **ya no arranca** sin una clave real (ver
`BackEnd/.env.example` → `APPROVAL_SECRET`). No lo "arregles" devolviendo un
valor por defecto.

### 5. Todo lo que gasta dinero exige sesión

`/api/claude/chat` y `/api/replicate/generate` estaban **abiertos sin
autenticación**, y cada llamada se le factura a la asociación. Ahora exigen
sesión, y `server.js` aplica rate limiting (`limiteIA`). Las rutas de API de
Next usan `lib/auth/verificarSesionServidor.ts`, que valida el token contra el
BackEnd (`/auth/perfil`) — no dupliques esa lógica.

**Excepción conocida:** `app/api/alumni-chat/route.ts` (mascota de la landing)
es pública por diseño y **no tiene rate limit** — en serverless un contador en
memoria no persiste. Queda como exposición de costo pendiente: lo correcto es
un rate limit en el borde (Vercel WAF) o un contador en Redis/Upstash.

### 6. Rate limiting

No existía ninguno. `server.js` define tres: `limiteAuth` (20/15min, cubre
fuerza bruta de login y el adivinado del código de 6 dígitos de recuperación,
que es stateless y no puede contar intentos por sí mismo), `limiteIA` (30/10min)
y `limiteGeneral` (1000/15min). Requiere `app.set('trust proxy', 1)`, que ya
está: sin eso todos los usuarios comparten el cupo de la IP del proxy.

### Riesgos aceptados (documentados, no arreglados)

- **JWT en `localStorage`** (no en cookie `httpOnly`): cualquier XSS permite
  robar la sesión. Es la razón por la que el punto 3 es crítico. Cambiarlo a
  cookies es un rediseño del flujo de auth.
- **`mimetype` de las subidas es declarado por el cliente** y se puede falsear
  (`routes/donaciones/comprobantes.routes.js`). Mitigado: los archivos van a un
  bucket privado y se sirven por signed URL, nunca se ejecutan.

### Revisado y correcto (no tocar “por si acaso”)

- `auth.middleware.js` valida el token **contra Supabase**, no lo decodifica
  solo, bloquea cuentas suspendidas y toma el rol de la BD, no del token.
- Las rutas de `routes/admin/` exigen rol admin. Los dos endpoints de
  `reportes.routes.js` sin `exigirRol` son correctos: el estudiante crea y ve
  **sus propios** reportes.
- El código de recuperación es HMAC derivado estilo TOTP con comparación de
  tiempo constante.
- No hay inyección PostgREST: los `.ilike()` pasan el valor como parámetro y el
  único `.or()` usa una fecha generada en el servidor.
- No hay secretos commiteados, ni `eval`, ni `new Function`.

---

## Convenciones del proyecto

- Español en comentarios, UI y mensajes de error al usuario.
- Inglés en nombres de variables/funciones/archivos.
- Tailwind CSS + CSS Modules conviven (no es solo uno u otro — usar CSS Modules para estilos de componente específicos, Tailwind para utilidades).
- `apiFetch()` de `lib/api.js` para todas las llamadas al BackEnd.
- Autenticación: token JWT en header `Authorization: Bearer <token>` — sin cookies.
- Notificaciones al usuario: `notificar()` de `components/student/Toast`.

---

## Comandos útiles

```bash
# Arrancar FE (Next.js)
npm run dev

# Arrancar BackEnd (Express)
cd BackEnd && npm run dev

# Build FE
npm run build

# Lint FE (ESLint 9 flat config — ver eslint.config.mjs)
npm run lint

# Typecheck FE (lo que de verdad atrapa errores de tipos)
npx tsc --noEmit
```

**Sobre el lint (reconfigurado el 2026-11-03):** Next.js 16 eliminó el comando `next lint`, así que
`npm run lint` estaba roto (interpretaba `lint` como un directorio) y el proyecto no tenía ESLint ni
configuración. Ahora corre `eslint .` contra `eslint.config.mjs` con `eslint-config-next`.
- `BackEnd/` queda **excluido** a propósito: es un paquete Express independiente en CommonJS, y las reglas
  de Next/TS marcaban cada `require()` legítimo como error (eran 480 falsos positivos).
- El baseline está en **0 errores / ~192 warnings**. Las reglas de deuda de estilo (`no-explicit-any`,
  `react-hooks/set-state-in-effect`, etc.) están en `warn` a propósito para que el gate sea usable; al bajar
  el conteo, subirlas a `error` una por una.

---

## Reglas de git del equipo

- El repositorio vive en `github.com/R1ve3raaTech/AlumniUCR` (dueño: Camil, líder del proyecto desde 2026-07-06). Equipo: Camil, Stacy, Braksley, Steven.
  La rama por defecto del remoto es `Dev`; `main` existe y se mantiene al día con ella.
- **Camil aprueba/mergea los PRs hacia `Dev`.** Pushear a ramas de otros compañeros requiere su autorización explícita.
- Antes de mergear `Dev` en otra rama, verificar con `git merge-tree` que no haya conflictos con trabajo en curso de otro compañero (p. ej. `admin/matches` tiene dos versiones distintas: Braks vs. RF-08.1).

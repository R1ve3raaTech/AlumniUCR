# 📋 RUTAS COMPLETAS PARA POSTMAN - CONECTANDO TALENTO UCR

**Base URL:** `http://localhost:5000`

---

## 🔐 AUTENTICACIÓN

### auth.routes.js
- `POST` `/api/auth/register/estudiante` - Registrar nuevo estudiante
- `POST` `/api/auth/register/exalumno` - Registrar nuevo exalumno
- `POST` `/api/auth/login` - Login de usuario

---

## 👥 USUARIOS

### users.routes.js
- `GET` `/api/users/` - Obtener todos los usuarios (Admin)
- `GET` `/api/users/:id` - Obtener usuario por ID
- `GET` `/api/users/buscar/:nombre` - Buscar usuarios por nombre
- `GET` `/api/users/correo/:correoElectronico` - Obtener usuario por correo (Admin)
- `POST` `/api/users/` - Crear usuario
- `PUT` `/api/users/:id` - Actualizar usuario
- `DELETE` `/api/users/:id` - Eliminar usuario (Admin)

---

## 📄 CURRÍCULUM

### cv.routes.js
- `GET` `/api/cv/mi-curriculum` - Obtener mi curriculum

---

## 🏢 APLICANTES EMPLEO

### aplicantes.empleo.routes.js
- `GET` `/api/aplicantes/` - Obtener todos los aplicantes (Admin)
- `GET` `/api/aplicantes/empleo/:idEmpleo` - Obtener aplicantes por empleo
- `GET` `/api/aplicantes/usuario/:idUsuario` - Obtener aplicantes por usuario
- `GET` `/api/aplicantes/:id` - Obtener aplicante por ID
- `POST` `/api/aplicantes/` - Crear aplicante (Estudiante)
- `PUT` `/api/aplicantes/:id` - Actualizar aplicante
- `DELETE` `/api/aplicantes/:id` - Eliminar aplicante (Admin)

---

## 📚 ÁREAS DE INTERÉS

### areas.interes.routes.js
- `GET` `/api/areas-interes/buscar` - Buscar áreas por nombre
- `GET` `/api/areas-interes/` - Obtener todas las áreas de interés
- `GET` `/api/areas-interes/:id` - Obtener área de interés por ID
- `POST` `/api/areas-interes/` - Crear área de interés (Admin)
- `PUT` `/api/areas-interes/:id` - Actualizar área de interés (Admin)
- `DELETE` `/api/areas-interes/:id` - Eliminar área de interés (Admin)

---

## 👨‍🎓 ÁREAS DE INTERÉS EXALUMNOS

### areas.interes.exalumnos.routes.js
- `GET` `/api/areas-interes-exalumnos/` - Obtener áreas de interés exalumnos
- `GET` `/api/areas-interes-exalumnos/exalumno/:idExalumno` - Obtener áreas por exalumno
- `GET` `/api/areas-interes-exalumnos/area/:idAreaTematica` - Obtener exalumnos por área
- `GET` `/api/areas-interes-exalumnos/:id` - Obtener área de interés exalumno por ID
- `POST` `/api/areas-interes-exalumnos/` - Crear área de interés exalumno
- `PUT` `/api/areas-interes-exalumnos/:id` - Actualizar área de interés exalumno
- `DELETE` `/api/areas-interes-exalumnos/:id` - Eliminar área de interés exalumno

---

## 🎓 ÁREAS DE INTERÉS PROYECTOS

### areas.interes.proyecto.routes.js
- `GET` `/api/areas-interes-proyectos/` - Obtener áreas de interés de proyectos
- `GET` `/api/areas-interes-proyectos/proyecto/:idProyecto` - Obtener áreas por proyecto
- `GET` `/api/areas-interes-proyectos/area/:idAreaTematica` - Obtener proyectos por área
- `GET` `/api/areas-interes-proyectos/:id` - Obtener área de interés proyecto por ID
- `POST` `/api/areas-interes-proyectos/` - Crear área de interés proyecto (Estudiante)
- `PUT` `/api/areas-interes-proyectos/:id` - Actualizar área de interés proyecto (Estudiante)
- `DELETE` `/api/areas-interes-proyectos/:id` - Eliminar área de interés proyecto (Admin)

---

## 💰 BECAS SOCIOECONÓMICAS

### beca.socioeconomica.routes.js
- `GET` `/api/becas-socioeconomicas/buscar` - Buscar becas por nombre
- `GET` `/api/becas-socioeconomicas/` - Obtener todas las becas socioeconómicas (Admin)
- `GET` `/api/becas-socioeconomicas/:id` - Obtener beca por ID (Admin)
- `POST` `/api/becas-socioeconomicas/` - Crear beca (Admin)
- `PUT` `/api/becas-socioeconomicas/:id` - Actualizar beca (Admin)
- `DELETE` `/api/becas-socioeconomicas/:id` - Eliminar beca (Admin)

---

## 🎓 CARRERAS

### carreras.routes.js
- `GET` `/api/carreras/buscar` - Buscar carreras por nombre
- `GET` `/api/carreras/facultad/:idFacultad` - Obtener carreras por facultad
- `GET` `/api/carreras/` - Obtener todas las carreras
- `GET` `/api/carreras/:id` - Obtener carrera por ID
- `POST` `/api/carreras/` - Crear carrera (Admin)
- `PUT` `/api/carreras/:id` - Actualizar carrera (Admin)
- `DELETE` `/api/carreras/:id` - Eliminar carrera (Admin)

---

## 👤 CARRERAS POR USUARIO

### carreras.usuario.routes.js
- `GET` `/api/carreras-usuarios/` - Obtener carreras de usuarios
- `GET` `/api/carreras-usuarios/usuario/:idUsuario` - Obtener carreras por usuario
- `GET` `/api/carreras-usuarios/carrera/:idCarrera` - Obtener usuarios por carrera
- `GET` `/api/carreras-usuarios/sede/:idSede` - Obtener usuarios por sede
- `GET` `/api/carreras-usuarios/:id` - Obtener carrera-usuario por ID
- `POST` `/api/carreras-usuarios/` - Crear carrera-usuario
- `PUT` `/api/carreras-usuarios/:id` - Actualizar carrera-usuario
- `DELETE` `/api/carreras-usuarios/:id` - Eliminar carrera-usuario

---

## 📜 CERTIFICACIONES ESTUDIANTE

### certificaciones.estudiante.routes.js
- `GET` `/api/certificaciones/buscar` - Buscar certificaciones por nombre
- `GET` `/api/certificaciones/usuario/:idUsuario` - Obtener certificaciones por usuario
- `GET` `/api/certificaciones/` - Obtener todas las certificaciones (Admin)
- `GET` `/api/certificaciones/:id` - Obtener certificación por ID
- `POST` `/api/certificaciones/` - Crear certificación (Estudiante)
- `PUT` `/api/certificaciones/:id` - Actualizar certificación (Estudiante)
- `DELETE` `/api/certificaciones/:id` - Eliminar certificación (Estudiante)

---

## 🏦 DONACIONES

### donaciones.routes.js
- `GET` `/api/donaciones/` - Obtener todas las donaciones (Admin)
- `GET` `/api/donaciones/estado/:estado` - Obtener donaciones por estado (Admin)
- `GET` `/api/donaciones/usuario/:idUsuarioExalumno` - Obtener donaciones por usuario
- `GET` `/api/donaciones/proyecto/:idProyecto` - Obtener donaciones por proyecto
- `GET` `/api/donaciones/:id` - Obtener donación por ID
- `POST` `/api/donaciones/` - Crear donación (Exalumno)
- `PUT` `/api/donaciones/:id` - Actualizar donación (Admin)
- `DELETE` `/api/donaciones/:id` - Eliminar donación (Admin)

---

## 💼 EXPERIENCIA ESTUDIANTE

### experiencia.estudiante.routes.js
- `GET` `/api/experiencias/buscar` - Buscar experiencias por organización
- `GET` `/api/experiencias/usuario/:idUsuario` - Obtener experiencias por usuario
- `GET` `/api/experiencias/tipo/:tipo` - Obtener experiencias por tipo
- `GET` `/api/experiencias/` - Obtener todas las experiencias (Admin)
- `GET` `/api/experiencias/:id` - Obtener experiencia por ID
- `POST` `/api/experiencias/` - Crear experiencia (Estudiante)
- `PUT` `/api/experiencias/:id` - Actualizar experiencia (Estudiante)
- `DELETE` `/api/experiencias/:id` - Eliminar experiencia (Estudiante)

---

## 🏛️ FACULTADES

### facultades.routes.js
- `GET` `/api/facultades/buscar` - Buscar facultades por nombre
- `GET` `/api/facultades/` - Obtener todas las facultades
- `GET` `/api/facultades/:id` - Obtener facultad por ID
- `POST` `/api/facultades/` - Crear facultad (Admin)
- `PUT` `/api/facultades/:id` - Actualizar facultad (Admin)
- `DELETE` `/api/facultades/:id` - Eliminar facultad (Admin)

---

## 🛠️ HABILIDADES ESTUDIANTE

### habilidades.estudiante.routes.js
- `GET` `/api/habilidades/buscar/tecnicas` - Buscar habilidades técnicas
- `GET` `/api/habilidades/buscar/idiomas` - Buscar idiomas
- `GET` `/api/habilidades/usuario/:idUsuario` - Obtener habilidades por usuario
- `GET` `/api/habilidades/` - Obtener todas las habilidades (Admin)
- `GET` `/api/habilidades/:id` - Obtener habilidad por ID
- `POST` `/api/habilidades/` - Crear habilidad (Estudiante)
- `PUT` `/api/habilidades/:id` - Actualizar habilidad (Estudiante)
- `DELETE` `/api/habilidades/:id` - Eliminar habilidad (Estudiante)

---

## 📝 INFORMACIÓN ESTUDIANTE

### informacion.estudiante.routes.js
- `GET` `/api/informacion-estudiantes/buscan-empleo` - Obtener estudiantes que buscan empleo
- `GET` `/api/informacion-estudiantes/buscan-pasantia` - Obtener estudiantes que buscan pasantía
- `GET` `/api/informacion-estudiantes/buscan-mentoria` - Obtener estudiantes que buscan mentoría
- `GET` `/api/informacion-estudiantes/usuario/:idUsuario` - Obtener información por usuario
- `GET` `/api/informacion-estudiantes/` - Obtener toda la información de estudiantes (Admin)
- `POST` `/api/informacion-estudiantes/` - Crear información de estudiante
- `PUT` `/api/informacion-estudiantes/usuario/:idUsuario` - Actualizar información de estudiante
- `DELETE` `/api/informacion-estudiantes/usuario/:idUsuario` - Eliminar información de estudiante (Admin)

---

## 👨‍🎓 INFORMACIÓN EXALUMNO

### informacion.exalumno.routes.js
- `GET` `/api/informacion-exalumnos/mentores` - Obtener exalumnos mentores
- `GET` `/api/informacion-exalumnos/ofrecen-empleo` - Obtener exalumnos que ofrecen empleo
- `GET` `/api/informacion-exalumnos/ofrecen-pasantia` - Obtener exalumnos que ofrecen pasantía
- `GET` `/api/informacion-exalumnos/ofrecen-donacion` - Obtener exalumnos que ofrecen donación
- `GET` `/api/informacion-exalumnos/usuario/:idUsuario` - Obtener información de exalumno por usuario
- `GET` `/api/informacion-exalumnos/` - Obtener toda la información de exalumnos (Admin)
- `POST` `/api/informacion-exalumnos/` - Crear información de exalumno
- `PUT` `/api/informacion-exalumnos/usuario/:idUsuario` - Actualizar información de exalumno
- `DELETE` `/api/informacion-exalumnos/usuario/:idUsuario` - Eliminar información de exalumno (Admin)

---

## 🤝 NECESIDADES ESPECÍFICAS

### necesidades.especificas.routes.js
- `GET` `/api/necesidades-especificas/buscar` - Buscar necesidades por nombre
- `GET` `/api/necesidades-especificas/` - Obtener todas las necesidades específicas
- `GET` `/api/necesidades-especificas/:id` - Obtener necesidad específica por ID
- `POST` `/api/necesidades-especificas/` - Crear necesidad específica (Admin)
- `PUT` `/api/necesidades-especificas/:id` - Actualizar necesidad específica (Admin)
- `DELETE` `/api/necesidades-especificas/:id` - Eliminar necesidad específica (Admin)

---

## 🎓 PROYECTO DE GRADUACIÓN

### proyecto.graduacion.routes.js
- `GET` `/api/proyectos-graduacion/finalizados` - Obtener proyectos finalizados
- `GET` `/api/proyectos-graduacion/usuario/:idUsuario` - Obtener proyectos por usuario
- `GET` `/api/proyectos-graduacion/area/:areaTematica` - Buscar proyectos por área
- `GET` `/api/proyectos-graduacion/` - Obtener todos los proyectos de graduación
- `GET` `/api/proyectos-graduacion/:id` - Obtener proyecto de graduación por ID
- `POST` `/api/proyectos-graduacion/` - Crear proyecto de graduación (Estudiante)
- `PUT` `/api/proyectos-graduacion/:id` - Actualizar proyecto de graduación (Estudiante)
- `DELETE` `/api/proyectos-graduacion/:id` - Eliminar proyecto de graduación (Admin)

---

## 🔧 PROYECTO - NECESIDAD

### proyecto.necesidad.routes.js
- `GET` `/api/proyectos-necesidades/proyecto/:idProyecto` - Obtener necesidades por proyecto
- `GET` `/api/proyectos-necesidades/necesidad/:idNecesidad` - Obtener proyectos por necesidad
- `GET` `/api/proyectos-necesidades/` - Obtener todas las necesidades de proyectos
- `GET` `/api/proyectos-necesidades/:id` - Obtener proyecto-necesidad por ID
- `POST` `/api/proyectos-necesidades/` - Crear proyecto-necesidad (Estudiante)
- `PUT` `/api/proyectos-necesidades/:id` - Actualizar proyecto-necesidad (Estudiante)
- `DELETE` `/api/proyectos-necesidades/:id` - Eliminar proyecto-necesidad (Admin)

---

## 💼 PUESTO EMPLEO

### puesto.empleo.routes.js
- `GET` `/api/puestos-empleo/activos` - Obtener puestos activos
- `GET` `/api/puestos-empleo/usuario/:idUsuario` - Obtener puestos por usuario
- `GET` `/api/puestos-empleo/empresa/:empresa` - Buscar puestos por empresa
- `GET` `/api/puestos-empleo/titulo/:titulo` - Buscar puestos por título
- `GET` `/api/puestos-empleo/` - Obtener todos los puestos de empleo (Admin)
- `GET` `/api/puestos-empleo/:id` - Obtener puesto de empleo por ID
- `POST` `/api/puestos-empleo/` - Crear puesto de empleo (Exalumno)
- `PUT` `/api/puestos-empleo/:id` - Actualizar puesto de empleo (Exalumno)
- `DELETE` `/api/puestos-empleo/:id` - Eliminar puesto de empleo (Admin)

---

## 📋 REPORTE DE USUARIO

### reporte.usuario.routes.js
- `GET` `/api/reportes-usuarios/reportado/:idUsuarioReportado` - Obtener reportes por usuario reportado (Admin)
- `GET` `/api/reportes-usuarios/emisor/:idUsuarioEmisor` - Obtener reportes por emisor (Admin)
- `GET` `/api/reportes-usuarios/motivo/:motivo` - Buscar reportes por motivo (Admin)
- `GET` `/api/reportes-usuarios/` - Obtener todos los reportes (Admin)
- `GET` `/api/reportes-usuarios/:id` - Obtener reporte por ID (Admin)
- `POST` `/api/reportes-usuarios/` - Crear reporte de usuario
- `PUT` `/api/reportes-usuarios/:id` - Actualizar reporte (Admin)
- `DELETE` `/api/reportes-usuarios/:id` - Eliminar reporte (Admin)

---

## 📌 RESPONSABILIDADES

### responsabilidad.routes.js
- `GET` `/api/responsabilidades/buscar/:nombre` - Buscar responsabilidades por nombre
- `GET` `/api/responsabilidades/` - Obtener todas las responsabilidades
- `GET` `/api/responsabilidades/:id` - Obtener responsabilidad por ID
- `POST` `/api/responsabilidades/` - Crear responsabilidad (Admin)
- `PUT` `/api/responsabilidades/:id` - Actualizar responsabilidad (Admin)
- `DELETE` `/api/responsabilidades/:id` - Eliminar responsabilidad (Admin)

---

## 💼 RESPONSABILIDADES EMPLEO

### responsabilidad.empleo.routes.js
- `GET` `/api/responsabilidades-empleo/empleo/:idEmpleo` - Obtener responsabilidades por empleo
- `GET` `/api/responsabilidades-empleo/responsabilidad/:idResponsabilidad` - Obtener empleos por responsabilidad
- `GET` `/api/responsabilidades-empleo/` - Obtener todas las responsabilidades de empleo (Admin)
- `GET` `/api/responsabilidades-empleo/:id` - Obtener responsabilidad-empleo por ID
- `POST` `/api/responsabilidades-empleo/` - Crear responsabilidad-empleo
- `PUT` `/api/responsabilidades-empleo/:id` - Actualizar responsabilidad-empleo
- `DELETE` `/api/responsabilidades-empleo/:id` - Eliminar responsabilidad-empleo

---

## 👔 ROLES

### rol.routes.js
- `GET` `/api/roles/buscar/:nombre` - Buscar roles por nombre (Admin)
- `GET` `/api/roles/` - Obtener todos los roles (Admin)
- `GET` `/api/roles/:id` - Obtener rol por ID (Admin)
- `POST` `/api/roles/` - Crear rol (Admin)
- `PUT` `/api/roles/:id` - Actualizar rol (Admin)
- `DELETE` `/api/roles/:id` - Eliminar rol (Admin)

---

## 🏭 SECTOR

### sector.routes.js
- `GET` `/api/sectores/buscar/:nombre` - Buscar sectores por nombre
- `GET` `/api/sectores/` - Obtener todos los sectores
- `GET` `/api/sectores/:id` - Obtener sector por ID
- `POST` `/api/sectores/` - Crear sector (Admin)
- `PUT` `/api/sectores/:id` - Actualizar sector (Admin)
- `DELETE` `/api/sectores/:id` - Eliminar sector (Admin)

---

## 🏢 SECTOR EMPLEO

### sector.empleo.routes.js
- `GET` `/api/sectores-empleo/empleo/:idEmpleo` - Obtener sectores por empleo
- `GET` `/api/sectores-empleo/sector/:idSector` - Obtener empleos por sector
- `GET` `/api/sectores-empleo/` - Obtener todos los sectores de empleo (Admin)
- `GET` `/api/sectores-empleo/:id` - Obtener sector-empleo por ID
- `POST` `/api/sectores-empleo/` - Crear sector-empleo
- `PUT` `/api/sectores-empleo/:id` - Actualizar sector-empleo
- `DELETE` `/api/sectores-empleo/:id` - Eliminar sector-empleo

---

## 👨‍💼 SECTOR EXALUMNO

### sector.exalumno.routes.js
- `GET` `/api/sectores-exalumnos/exalumno/:idExalumno` - Obtener sectores por exalumno
- `GET` `/api/sectores-exalumnos/sector/:idSector` - Obtener exalumnos por sector
- `GET` `/api/sectores-exalumnos/` - Obtener todos los sectores de exalumno (Admin)
- `GET` `/api/sectores-exalumnos/:id` - Obtener sector-exalumno por ID
- `POST` `/api/sectores-exalumnos/` - Crear sector-exalumno
- `PUT` `/api/sectores-exalumnos/:id` - Actualizar sector-exalumno
- `DELETE` `/api/sectores-exalumnos/:id` - Eliminar sector-exalumno

---

## 🏫 SEDES UCR

### sede.UCR.routes.js
- `GET` `/api/sedes-ucr/buscar/:nombre` - Buscar sedes por nombre
- `GET` `/api/sedes-ucr/` - Obtener todas las sedes de la UCR
- `GET` `/api/sedes-ucr/:id` - Obtener sede de la UCR por ID
- `POST` `/api/sedes-ucr/` - Crear sede de la UCR (Admin)
- `PUT` `/api/sedes-ucr/:id` - Actualizar sede de la UCR (Admin)
- `DELETE` `/api/sedes-ucr/:id` - Eliminar sede de la UCR (Admin)

---

## 💳 TIPOS DE PAGO

### tipo.pago.routes.js
- `GET` `/api/tipos-pago/buscar/:descripcion` - Buscar tipos de pago por descripción
- `GET` `/api/tipos-pago/` - Obtener todos los tipos de pago
- `GET` `/api/tipos-pago/:id` - Obtener tipo de pago por ID
- `POST` `/api/tipos-pago/` - Crear tipo de pago (Admin)
- `PUT` `/api/tipos-pago/:id` - Actualizar tipo de pago (Admin)
- `DELETE` `/api/tipos-pago/:id` - Eliminar tipo de pago (Admin)

---

## 📂 TIPOS DE PROYECTO

### tipo.proyecto.routes.js
- `GET` `/api/tipos-proyecto/buscar/:nombre` - Buscar tipos de proyecto por nombre
- `GET` `/api/tipos-proyecto/` - Obtener todos los tipos de proyecto
- `GET` `/api/tipos-proyecto/:id` - Obtener tipo de proyecto por ID
- `POST` `/api/tipos-proyecto/` - Crear tipo de proyecto (Admin)
- `PUT` `/api/tipos-proyecto/:id` - Actualizar tipo de proyecto (Admin)
- `DELETE` `/api/tipos-proyecto/:id` - Eliminar tipo de proyecto (Admin)

---

## ✅ HEALTH CHECK

- `GET` `/api/health` - Verificar que el servidor está corriendo

---

## 📌 NOTAS IMPORTANTES

1. **Token de Autenticación**: Después de hacer login o registrarse, incluye el token en el header:
   ```
   Authorization: Bearer <tu_token_aqui>
   ```

2. **Roles disponibles**:
   - `admin` - Administrador
   - `estudiante` - Estudiante de la UCR
   - `exalumno` - Exalumno de la UCR

3. **Métodos HTTP**:
   - `GET` - Obtener información
   - `POST` - Crear información nueva
   - `PUT` - Actualizar información existente
   - `DELETE` - Eliminar información

4. **Formato de datos**: Las solicitudes POST y PUT generalmente requieren `Content-Type: application/json` en el header

---

**Documento generado el:** 2026-06-11

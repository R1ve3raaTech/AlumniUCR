-- Seed de demostración para el Matching Interdisciplinario.
-- Vincula estudiantes (carrera/facultad), exalumnos mentores (áreas temáticas)
-- y proyectos de graduación (áreas temáticas) usando ids REALES del catálogo.
-- Es idempotente: limpia su propio set antes de insertarlo.
-- Áreas (areas_interes): 1 Tecnología, 2 Salud, 3 Educación, 4 Medio Ambiente,
-- 5 Arte, 6 Cs Sociales, 7 Agro, 8 Emprendimiento, 9 Ingeniería, 12 Comunicación,
-- 14 Investigación. Carreras: 50 Ing Civil, 52 Ing Computación, 36 Psicología,
-- 18 Computación, 33 Comunicación, 60 Medicina. Sede 1, tipo_proyecto 1 (TFG).

-- ── Limpieza idempotente ────────────────────────────────────────────────
delete from areas_interes_proyecto where id_proyecto in (
  select id from proyecto_graduacion where titulo_proyecto in (
    'Infraestructura resiliente para comunidades rurales',
    'Plataforma de salud mental estudiantil',
    'IA para diagnóstico agrícola en zonas rurales'
  )
);
delete from proyecto_graduacion where titulo_proyecto in (
  'Infraestructura resiliente para comunidades rurales',
  'Plataforma de salud mental estudiantil',
  'IA para diagnóstico agrícola en zonas rurales'
);
delete from areas_interes_exalumno where id_exalumno in (
  '11e2cb4f-60cc-4b9b-a2c8-0bd258d732a9','a444cc51-8c91-48cb-a4a8-d978a98775a9',
  '3236091d-e98f-4376-8e94-eeae2d989cb5','7160123f-8141-4254-9641-0e370f08e925',
  '999f1d6d-e27e-420e-8f23-d55702b5dae3'
);
delete from carreras_usuario where id_usuario in (
  '1b6f6a87-af9e-4f6d-ab8e-5075b563677b','c1c06412-2679-4c80-a4ad-442fcf34e34d',
  'f1bd6728-8ced-48ab-a94f-54fee58ebe22','11e2cb4f-60cc-4b9b-a2c8-0bd258d732a9',
  'a444cc51-8c91-48cb-a4a8-d978a98775a9','3236091d-e98f-4376-8e94-eeae2d989cb5',
  '7160123f-8141-4254-9641-0e370f08e925','999f1d6d-e27e-420e-8f23-d55702b5dae3'
);

-- ── Carrera/facultad de estudiantes y mentores ──────────────────────────
insert into carreras_usuario (id_carrera, id_usuario, id_sede, ano_graduacion) values
  (50,'1b6f6a87-af9e-4f6d-ab8e-5075b563677b',1,null),   -- cjimenez → Ing. Civil
  (36,'c1c06412-2679-4c80-a4ad-442fcf34e34d',1,null),   -- ctorres → Psicología
  (18,'f1bd6728-8ced-48ab-a94f-54fee58ebe22',1,null),   -- maria.jimenez → Computación
  (52,'11e2cb4f-60cc-4b9b-a2c8-0bd258d732a9',1,2016),   -- Roberto Soto → Ing. Computación
  (50,'a444cc51-8c91-48cb-a4a8-d978a98775a9',1,2018),   -- Ana Quesada → Ing. Civil
  (36,'3236091d-e98f-4376-8e94-eeae2d989cb5',1,2012),   -- Maria Solis → Psicología
  (33,'7160123f-8141-4254-9641-0e370f08e925',1,2015),   -- chris → Comunicación
  (60,'999f1d6d-e27e-420e-8f23-d55702b5dae3',1,2014);   -- juan.perez → Medicina

-- ── Exalumnos que ofrecen mentoría ──────────────────────────────────────
insert into informacion_exalumno
  (id_usuario, ofrece_mentoria, ofrece_empleo, ofrece_pasantia, ofrece_colaboracion, ofrece_donacion, estado, empresa, cargo, anos_experiencia)
values
  ('11e2cb4f-60cc-4b9b-a2c8-0bd258d732a9', true, false, true,  true,  false, true, 'TechGlobal',  'Senior Project Manager', 8),
  ('a444cc51-8c91-48cb-a4a8-d978a98775a9', true, false, false, true,  false, true, 'ConstruCR',   'Ingeniera de Proyectos', 6),
  ('3236091d-e98f-4376-8e94-eeae2d989cb5', true, false, false, true,  false, true, 'BienestarUCR','Psicóloga Clínica', 10),
  ('7160123f-8141-4254-9641-0e370f08e925', true, true,  true,  true,  false, true, 'MediaLab',    'Director Creativo', 9),
  ('999f1d6d-e27e-420e-8f23-d55702b5dae3', true, false, false, true,  false, true, 'Hospital CR', 'Médico Investigador', 12)
on conflict (id_usuario) do update set
  ofrece_mentoria = excluded.ofrece_mentoria,
  estado = excluded.estado,
  empresa = excluded.empresa,
  cargo = excluded.cargo,
  anos_experiencia = excluded.anos_experiencia;

-- ── Áreas temáticas de cada mentor ──────────────────────────────────────
insert into areas_interes_exalumno (id_exalumno, id_area_tematica) values
  ('11e2cb4f-60cc-4b9b-a2c8-0bd258d732a9',1),('11e2cb4f-60cc-4b9b-a2c8-0bd258d732a9',9),('11e2cb4f-60cc-4b9b-a2c8-0bd258d732a9',8),
  ('a444cc51-8c91-48cb-a4a8-d978a98775a9',9),('a444cc51-8c91-48cb-a4a8-d978a98775a9',4),
  ('3236091d-e98f-4376-8e94-eeae2d989cb5',2),('3236091d-e98f-4376-8e94-eeae2d989cb5',6),('3236091d-e98f-4376-8e94-eeae2d989cb5',3),
  ('7160123f-8141-4254-9641-0e370f08e925',12),('7160123f-8141-4254-9641-0e370f08e925',5),('7160123f-8141-4254-9641-0e370f08e925',1),
  ('999f1d6d-e27e-420e-8f23-d55702b5dae3',2),('999f1d6d-e27e-420e-8f23-d55702b5dae3',14);

-- ── Proyectos de graduación de los estudiantes ──────────────────────────
insert into proyecto_graduacion
  (id_estudiante, titulo_proyecto, descripcion, id_tipo_proyecto, porcentaje_avance, proyecto_finalizado)
values
  ('1b6f6a87-af9e-4f6d-ab8e-5075b563677b','Infraestructura resiliente para comunidades rurales','Diseño de infraestructura sostenible y de bajo costo para comunidades vulnerables.',1,65,false),
  ('c1c06412-2679-4c80-a4ad-442fcf34e34d','Plataforma de salud mental estudiantil','App de acompañamiento psicológico y prevención para estudiantes universitarios.',1,40,false),
  ('f1bd6728-8ced-48ab-a94f-54fee58ebe22','IA para diagnóstico agrícola en zonas rurales','Modelo de visión por computadora para detectar plagas en cultivos.',1,30,false);

-- ── Áreas temáticas de cada proyecto ────────────────────────────────────
insert into areas_interes_proyecto (id_proyecto, id_area_tematica)
select pg.id, x.a
from proyecto_graduacion pg
join (values
  ('Infraestructura resiliente para comunidades rurales', 9),
  ('Infraestructura resiliente para comunidades rurales', 4),
  ('Infraestructura resiliente para comunidades rurales', 1),
  ('Plataforma de salud mental estudiantil', 2),
  ('Plataforma de salud mental estudiantil', 1),
  ('Plataforma de salud mental estudiantil', 3),
  ('IA para diagnóstico agrícola en zonas rurales', 1),
  ('IA para diagnóstico agrícola en zonas rurales', 7),
  ('IA para diagnóstico agrícola en zonas rurales', 14)
) x(titulo, a) on x.titulo = pg.titulo_proyecto;

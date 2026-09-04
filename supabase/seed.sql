-- Laburin — datos de prueba
-- Usa el usuario real creado desde el dashboard (Authentication → Users):
-- UID 0a161863-5e8f-456f-b5ed-b0256b0d5768

-- ============================================================================
-- Criterios de scoring (RF-12: stack, modalidad, ubicación)
-- ============================================================================

insert into public.criterios_scoring
  (id, user_id, nombre, peso, tipo_coincidencia, campo_objetivo, valor_comparacion, rango_min, rango_max, activo)
values
  ('21111111-1111-1111-1111-111111111101', '0a161863-5e8f-456f-b5ed-b0256b0d5768',
   'Stack SQL / QA', 8, 'contiene', 'stack_tecnologico', 'sql', null, null, true),
  ('21111111-1111-1111-1111-111111111102', '0a161863-5e8f-456f-b5ed-b0256b0d5768',
   'Modalidad remota', 10, 'exacto', 'modalidad', 'remoto', null, null, true),
  ('21111111-1111-1111-1111-111111111103', '0a161863-5e8f-456f-b5ed-b0256b0d5768',
   'Zona oeste / Castelar', 25, 'contiene', 'ubicacion', 'castelar', null, null, true),
  ('21111111-1111-1111-1111-111111111104', '0a161863-5e8f-456f-b5ed-b0256b0d5768',
   'Antigüedad de publicación (hs)', 15, 'rango_numerico', 'fecha_publicacion', null, 0, 24, true),
  ('21111111-1111-1111-1111-111111111105', '0a161863-5e8f-456f-b5ed-b0256b0d5768',
   'Selenium / Cypress', 5, 'contiene', 'stack_tecnologico', 'selenium', null, null, false);

-- ============================================================================
-- Ofertas
-- ============================================================================

insert into public.ofertas
  (id, user_id, empresa, rol, ubicacion, modalidad, stack_tecnologico, fuente, fecha_publicacion, puntaje_scoring)
values
  ('31111111-1111-1111-1111-111111111101', '0a161863-5e8f-456f-b5ed-b0256b0d5768',
   'Globant', 'QA Analyst Jr', 'Castelar, Buenos Aires', 'hibrido',
   array['sql','selenium','testing'], 'LinkedIn Guest API', current_date - 1, 91.5),
  ('31111111-1111-1111-1111-111111111102', '0a161863-5e8f-456f-b5ed-b0256b0d5768',
   'GetOnBrd', 'Data Analyst Trainee', 'Remoto', 'remoto',
   array['sql','excel','power bi'], 'GetOnBrd', current_date - 2, 84.0),
  ('31111111-1111-1111-1111-111111111103', '0a161863-5e8f-456f-b5ed-b0256b0d5768',
   'Mercado Libre', 'QA Manual Semi Sr', 'CABA', 'hibrido',
   array['cypress','testing','api'], 'Indeed Argentina', current_date - 1, 68.0),
  ('31111111-1111-1111-1111-111111111104', '0a161863-5e8f-456f-b5ed-b0256b0d5768',
   'Remotive Inc', 'Data Entry Specialist', 'Remoto', 'remoto',
   array['excel','sheets','data entry'], 'Remotive', current_date - 3, 73.5),
  ('31111111-1111-1111-1111-111111111105', '0a161863-5e8f-456f-b5ed-b0256b0d5768',
   'Vacantes Digitales SA', 'Administrativo Jr', 'Morón, Buenos Aires', 'presencial',
   array['excel','atencion al cliente'], 'Vacantes Digitales', current_date - 1, 61.0),
  ('31111111-1111-1111-1111-111111111106', '0a161863-5e8f-456f-b5ed-b0256b0d5768',
   'Himalayas Remote', 'QA Automation Engineer', 'Remoto - LATAM', 'remoto',
   array['cypress','selenium','sql','api'], 'Himalayas', current_date, 95.0),
  ('31111111-1111-1111-1111-111111111107', '0a161863-5e8f-456f-b5ed-b0256b0d5768',
   'RemoteOK Startup', 'Data Analyst Jr', 'Remoto', 'remoto',
   array['sql','python','snowflake'], 'RemoteOK', current_date, 88.0),
  ('31111111-1111-1111-1111-111111111108', '0a161863-5e8f-456f-b5ed-b0256b0d5768',
   'Despegar', 'QA Tester Pasante', 'Castelar, Buenos Aires', 'presencial',
   array['testing','sql'], 'Carga manual', current_date - 4, 79.0);

-- ============================================================================
-- Postulaciones (solo algunas ofertas fueron trackeadas — cardinalidad 0..1)
-- ============================================================================

insert into public.postulaciones (id, oferta_id, estado, fecha_postulacion)
values
  ('41111111-1111-1111-1111-111111111101', '31111111-1111-1111-1111-111111111101', 'entrevista', current_date - 5),
  ('41111111-1111-1111-1111-111111111102', '31111111-1111-1111-1111-111111111102', 'en_proceso', current_date - 4),
  ('41111111-1111-1111-1111-111111111103', '31111111-1111-1111-1111-111111111106', 'aplicado', current_date - 2),
  ('41111111-1111-1111-1111-111111111104', '31111111-1111-1111-1111-111111111108', 'rechazado', current_date - 10),
  ('41111111-1111-1111-1111-111111111105', '31111111-1111-1111-1111-111111111107', 'por_aplicar', null);

-- ============================================================================
-- Interacciones
-- ============================================================================

insert into public.interacciones (postulacion_id, tipo, fecha, notas)
values
  ('41111111-1111-1111-1111-111111111101', 'mail', now() - interval '5 days', 'Envié CV y carta de presentación.'),
  ('41111111-1111-1111-1111-111111111101', 'llamada', now() - interval '3 days', 'RRHH confirmó siguiente etapa: entrevista técnica.'),
  ('41111111-1111-1111-1111-111111111101', 'entrevista', now() - interval '1 days', 'Entrevista técnica con el lead de QA, quedan en avisar en una semana.'),
  ('41111111-1111-1111-1111-111111111102', 'mail', now() - interval '4 days', 'Postulación enviada vía formulario de GetOnBrd.'),
  ('41111111-1111-1111-1111-111111111102', 'nota', now() - interval '2 days', 'Vi que el puesto sigue publicado, puede que todavía estén filtrando CVs.'),
  ('41111111-1111-1111-1111-111111111104', 'mail', now() - interval '10 days', 'Aplicación enviada.'),
  ('41111111-1111-1111-1111-111111111104', 'mail', now() - interval '8 days', 'Respuesta automática: "no seguimos adelante con tu candidatura".');

-- ============================================================================
-- Recordatorios
-- ============================================================================

insert into public.recordatorios (postulacion_id, dias_inactividad, estado, fecha_generado, fecha_resuelto)
values
  ('41111111-1111-1111-1111-111111111102', 5, 'activo', now() - interval '1 days', null),
  ('41111111-1111-1111-1111-111111111105', 7, 'activo', now(), null),
  ('41111111-1111-1111-1111-111111111101', 5, 'resuelto', now() - interval '4 days', now() - interval '3 days');

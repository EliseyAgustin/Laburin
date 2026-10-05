-- Laburin — umbral de inactividad configurable por usuario (RF-14)
-- Reemplaza la constante hardcodeada de 7 días del motor de recordatorios.

alter table public.perfil_usuario
  add column dias_inactividad_recordatorio integer not null default 7
  constraint perfil_usuario_dias_inactividad_rango
    check (dias_inactividad_recordatorio between 1 and 90);

comment on column public.perfil_usuario.dias_inactividad_recordatorio is
  'Días sin actividad tras los cuales una postulación abierta genera un recordatorio (RF-14).';

-- rollback:
-- alter table public.perfil_usuario drop column dias_inactividad_recordatorio;

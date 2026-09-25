-- Laburin — historial de cambios de estado de las postulaciones
-- Habilita el embudo real, la conversión entre etapas y el tiempo por etapa del panel de métricas (RF-17).
-- Lo registra un trigger sobre postulaciones, así cubre cualquier camino de escritura (drag-and-drop, Ficha, SQL).

create table public.postulacion_historial_estados (
  id                uuid primary key default gen_random_uuid(),
  -- Denormalizado desde postulaciones.user_id, igual que en el resto de las tablas hijas, para la RLS.
  user_id           uuid not null references auth.users (id) on delete cascade,
  postulacion_id    uuid not null references public.postulaciones (id) on delete cascade,
  -- null en la fila inicial: la postulación se creó directamente en estado_nuevo.
  estado_anterior   public.estado_postulacion_enum,
  estado_nuevo      public.estado_postulacion_enum not null,
  fecha             timestamptz not null default now(),
  -- true en las filas del backfill: la fecha es aproximada (updated_at) y no hay recorrido previo conocido.
  es_estimado       boolean not null default false
);

comment on table public.postulacion_historial_estados is 'Registro append-only de cada cambio de estado de una postulación. Lo escribe un trigger; los clientes solo pueden leerlo.';

create index postulacion_historial_estados_postulacion_fecha_idx
  on public.postulacion_historial_estados (postulacion_id, fecha);
create index postulacion_historial_estados_user_id_idx
  on public.postulacion_historial_estados (user_id);

-- ============================================================================
-- Backfill: una fila ancla por postulación existente (estado actual, fecha aproximada).
-- Se hace antes de crear los triggers para que el trigger de INSERT no la duplique.
-- Solo se conoce el estado actual: el recorrido anterior no se puede reconstruir.
-- ============================================================================

insert into public.postulacion_historial_estados
  (user_id, postulacion_id, estado_anterior, estado_nuevo, fecha, es_estimado)
select user_id, id, null, estado, updated_at, true
from public.postulaciones;

-- ============================================================================
-- Trigger: registra la creación y cada cambio de estado.
-- security definer para poder escribir aunque los clientes no tengan permiso de INSERT sobre la tabla
-- (así nadie puede falsificar el historial desde la API); search_path vacío por seguridad.
-- ============================================================================

create function public.registrar_historial_estado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.postulacion_historial_estados
      (user_id, postulacion_id, estado_anterior, estado_nuevo, fecha)
    values (new.user_id, new.id, null, new.estado, new.created_at);
  else
    -- clock_timestamp() y no now(): dos cambios en la misma transacción deben quedar ordenados.
    insert into public.postulacion_historial_estados
      (user_id, postulacion_id, estado_anterior, estado_nuevo, fecha)
    values (new.user_id, new.id, old.estado, new.estado, clock_timestamp());
  end if;
  return null;
end;
$$;

create trigger registrar_historial_estado_insert
  after insert on public.postulaciones
  for each row execute function public.registrar_historial_estado();

create trigger registrar_historial_estado_update
  after update of estado on public.postulaciones
  for each row
  when (old.estado is distinct from new.estado)
  execute function public.registrar_historial_estado();

-- ============================================================================
-- RLS: solo lectura para el dueño. Sin políticas de INSERT/UPDATE/DELETE, los clientes no pueden escribir.
-- ============================================================================

alter table public.postulacion_historial_estados enable row level security;

create policy "historial_estados_propios" on public.postulacion_historial_estados
  for select
  using (auth.uid() = user_id);

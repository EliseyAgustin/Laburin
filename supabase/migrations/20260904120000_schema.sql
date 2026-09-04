-- Laburin — esquema inicial
-- Entidades: ofertas, postulaciones, interacciones, criterios_scoring, recordatorios
-- Usuarios gestionados por Supabase Auth (auth.users), no se crea tabla propia.

-- ============================================================================
-- Extensiones
-- ============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ============================================================================
-- Tipos enumerados
-- ============================================================================

create type public.modalidad_enum as enum ('remoto', 'hibrido', 'presencial');

create type public.estado_postulacion_enum as enum (
  'por_aplicar', 'aplicado', 'en_proceso', 'entrevista', 'oferta', 'rechazado'
);

create type public.tipo_interaccion_enum as enum ('mail', 'llamada', 'entrevista', 'nota');

create type public.tipo_coincidencia_enum as enum ('exacto', 'contiene', 'rango_numerico');

create type public.estado_recordatorio_enum as enum ('activo', 'resuelto');

-- ============================================================================
-- Tablas
-- ============================================================================

create table public.ofertas (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  empresa             text not null,
  rol                 text not null,
  ubicacion           text,
  modalidad           public.modalidad_enum,
  stack_tecnologico   text[] not null default '{}',
  fuente              text,
  fecha_publicacion   date,
  puntaje_scoring     numeric(5, 2),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.ofertas is 'Puestos encontrados por el motor de búsqueda o cargados manualmente.';

create table public.postulaciones (
  id                  uuid primary key default gen_random_uuid(),
  -- Denormalizado desde ofertas.user_id (ver trigger sync_postulacion_user_id) para
  -- simplificar las políticas de RLS e indexar el filtro por usuario directamente.
  user_id             uuid not null references auth.users (id) on delete cascade,
  oferta_id           uuid not null unique references public.ofertas (id) on delete cascade,
  estado              public.estado_postulacion_enum not null default 'por_aplicar',
  fecha_postulacion   date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.postulaciones is 'Una oferta que el usuario decidió seguir en el tablero Kanban.';

create table public.interacciones (
  id                uuid primary key default gen_random_uuid(),
  -- Denormalizado desde postulaciones.user_id (ver trigger sync_interaccion_user_id).
  user_id           uuid not null references auth.users (id) on delete cascade,
  postulacion_id    uuid not null references public.postulaciones (id) on delete cascade,
  tipo              public.tipo_interaccion_enum not null,
  fecha             timestamptz not null default now(),
  notas             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.interacciones is 'Evento registrado en la ficha de una postulación (llamado, entrevista, mail, nota).';

create table public.criterios_scoring (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,
  nombre              text not null,
  peso                numeric(5, 2) not null default 1.0,
  tipo_coincidencia   public.tipo_coincidencia_enum not null,
  campo_objetivo      text not null,
  valor_comparacion   text,
  rango_min           numeric,
  rango_max           numeric,
  activo              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint criterios_scoring_config_valida check (
    (tipo_coincidencia = 'rango_numerico' and rango_min is not null and rango_max is not null)
    or (tipo_coincidencia <> 'rango_numerico' and valor_comparacion is not null)
  )
);

comment on table public.criterios_scoring is 'Parámetro configurable del motor de scoring (stack, modalidad, ubicación) por usuario.';

create table public.recordatorios (
  id                  uuid primary key default gen_random_uuid(),
  -- Denormalizado desde postulaciones.user_id (ver trigger sync_recordatorio_user_id).
  user_id             uuid not null references auth.users (id) on delete cascade,
  postulacion_id      uuid not null references public.postulaciones (id) on delete cascade,
  dias_inactividad    integer not null,
  estado              public.estado_recordatorio_enum not null default 'activo',
  fecha_generado      timestamptz not null default now(),
  fecha_resuelto      timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

comment on table public.recordatorios is 'Alerta generada cuando una postulación no tiene novedades por N días.';

-- ============================================================================
-- Índices
-- ============================================================================

create index ofertas_user_id_idx on public.ofertas (user_id);
create index ofertas_fecha_publicacion_idx on public.ofertas (fecha_publicacion);
create index ofertas_puntaje_scoring_idx on public.ofertas (puntaje_scoring desc);
create index ofertas_stack_tecnologico_idx on public.ofertas using gin (stack_tecnologico);

create index postulaciones_user_id_idx on public.postulaciones (user_id);
create index postulaciones_estado_idx on public.postulaciones (estado);

create index interacciones_user_id_idx on public.interacciones (user_id);
create index interacciones_postulacion_id_idx on public.interacciones (postulacion_id);
create index interacciones_fecha_idx on public.interacciones (fecha);

create index criterios_scoring_user_id_idx on public.criterios_scoring (user_id);
create index criterios_scoring_activo_idx on public.criterios_scoring (activo);

create index recordatorios_user_id_idx on public.recordatorios (user_id);
create index recordatorios_postulacion_id_idx on public.recordatorios (postulacion_id);
create index recordatorios_estado_idx on public.recordatorios (estado);

-- ============================================================================
-- Función y triggers: updated_at automático
-- ============================================================================

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.ofertas
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.postulaciones
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.interacciones
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.criterios_scoring
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.recordatorios
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Funciones y triggers: sincronizar user_id denormalizado desde la fila padre
--
-- Los formularios del cliente no deben poder decidir el user_id de una fila
-- hija -- siempre se deriva del dueño real de la oferta/postulación asociada.
-- Esto además cierra el hueco de seguridad donde alguien podría intentar
-- crear una postulación/interacción/recordatorio apuntando al registro de
-- otro usuario: al pisar user_id con el valor real, la política de RLS
-- (auth.uid() = user_id) lo rechaza igual que si hubiera mentido a mano.
-- ============================================================================

create function public.sync_postulacion_user_id()
returns trigger
language plpgsql
as $$
begin
  select o.user_id into new.user_id
  from public.ofertas o
  where o.id = new.oferta_id;
  return new;
end;
$$;

create trigger sync_postulacion_user_id before insert or update of oferta_id
  on public.postulaciones
  for each row execute function public.sync_postulacion_user_id();

create function public.sync_interaccion_user_id()
returns trigger
language plpgsql
as $$
begin
  select p.user_id into new.user_id
  from public.postulaciones p
  where p.id = new.postulacion_id;
  return new;
end;
$$;

create trigger sync_interaccion_user_id before insert or update of postulacion_id
  on public.interacciones
  for each row execute function public.sync_interaccion_user_id();

create function public.sync_recordatorio_user_id()
returns trigger
language plpgsql
as $$
begin
  select p.user_id into new.user_id
  from public.postulaciones p
  where p.id = new.postulacion_id;
  return new;
end;
$$;

create trigger sync_recordatorio_user_id before insert or update of postulacion_id
  on public.recordatorios
  for each row execute function public.sync_recordatorio_user_id();

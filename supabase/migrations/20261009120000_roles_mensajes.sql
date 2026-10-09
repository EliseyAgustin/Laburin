-- Laburin — roles y mensajes del administrador a los candidatos (Tanda B)
-- Todo en una transacción: si algo falla, no queda nada a medio aplicar.
--
-- En Supabase, las tablas, vistas y funciones nuevas de "public" se crean con permisos para anon y authenticated
-- (privilegios por defecto). Por eso cada objeto nuevo empieza con REVOKE ALL y recién después se otorga lo mínimo.

begin;

-- ============================================================================
-- Roles. Tabla aparte: los usuarios solo la leen, nadie puede escribirse un rol.
-- Sin fila = candidato. El rol administrador se asigna a mano desde el SQL Editor.
-- ============================================================================
create type public.rol_enum as enum ('candidato', 'administrador');

create table public.roles_usuario (
  user_id uuid primary key references auth.users (id) on delete cascade,
  rol     public.rol_enum not null default 'candidato'
);

comment on table public.roles_usuario is 'Rol de cada usuario. Sin fila = candidato. Solo lectura desde la API: el rol administrador se asigna por SQL.';

alter table public.roles_usuario enable row level security;

create policy "rol_propio_lectura" on public.roles_usuario
  for select using (auth.uid() = user_id);

revoke all on public.roles_usuario from public, anon, authenticated;
grant select on public.roles_usuario to authenticated;

-- ============================================================================
-- es_administrador(): security definer para usarla en políticas y vistas sin recursión.
-- ============================================================================
create or replace function public.es_administrador()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.roles_usuario
    where user_id = auth.uid() and rol = 'administrador'
  );
$$;

revoke all on function public.es_administrador() from public, anon, authenticated;
grant execute on function public.es_administrador() to authenticated;

-- ============================================================================
-- Nombre del candidato (el administrador no puede leer auth.users).
-- ============================================================================
alter table public.perfil_usuario
  add column nombre text
  constraint perfil_usuario_nombre_largo
    check (nombre is null or char_length(btrim(nombre)) between 1 and 100);

comment on column public.perfil_usuario.nombre is 'Nombre para mostrar; lo ve el equipo de Laburin (administrador) en la pantalla Candidatos.';

-- ============================================================================
-- Vista para el administrador: solo columnas del perfil de búsqueda, solo si es administrador,
-- y sin los administradores. perfil_usuario no gana ninguna política nueva.
-- La vista es actualizable y corre con permisos del dueño: por eso se le quitan TODOS los permisos
-- a anon y authenticated y se otorga únicamente SELECT. Sin esto se podrían modificar perfiles por la vista.
-- ============================================================================
create view public.candidatos with (security_barrier = true) as
select p.user_id,
       p.nombre,
       p.rol_buscado,
       p.stack_interes,
       p.modalidad_preferida,
       p.ubicacion,
       p.seniority,
       p.created_at as registrado_el
from public.perfil_usuario p
where public.es_administrador()
  and not exists (
    select 1 from public.roles_usuario r
    where r.user_id = p.user_id and r.rol = 'administrador'
  );

comment on view public.candidatos is 'Perfil de búsqueda de cada candidato, visible solo para el administrador. Solo lectura.';

revoke all on public.candidatos from public, anon, authenticated;
grant select on public.candidatos to authenticated;

-- ============================================================================
-- Mensajes. remitente_id null = mensaje del sistema (bienvenida).
-- ============================================================================
create table public.mensajes (
  id              uuid primary key default gen_random_uuid(),
  remitente_id    uuid references auth.users (id) on delete cascade,
  destinatario_id uuid not null references auth.users (id) on delete cascade,
  tipo            text not null default 'admin' check (tipo in ('admin', 'bienvenida')),
  texto           text not null check (char_length(btrim(texto)) between 1 and 1000),
  leido           boolean not null default false,
  created_at      timestamptz not null default now()
);

comment on table public.mensajes is 'Mensajes del equipo de Laburin (administrador o sistema) a los candidatos.';

create index mensajes_destinatario_idx on public.mensajes (destinatario_id, created_at desc);
create index mensajes_remitente_idx on public.mensajes (remitente_id, destinatario_id);
-- Una sola bienvenida por persona, aunque el trigger se dispare más de una vez.
create unique index mensajes_una_bienvenida_idx on public.mensajes (destinatario_id) where tipo = 'bienvenida';

alter table public.mensajes enable row level security;

-- El candidato ve y gestiona solo lo que recibió.
create policy "mensajes_recibidos_lectura" on public.mensajes
  for select using (auth.uid() = destinatario_id);
create policy "mensajes_recibidos_leido" on public.mensajes
  for update using (auth.uid() = destinatario_id) with check (auth.uid() = destinatario_id);
create policy "mensajes_recibidos_borrado" on public.mensajes
  for delete using (auth.uid() = destinatario_id);

-- El administrador ve lo que envió y puede enviar (solo como él mismo y solo de tipo 'admin').
create policy "mensajes_enviados_lectura" on public.mensajes
  for select using (public.es_administrador() and remitente_id = auth.uid());
create policy "mensajes_envio_administrador" on public.mensajes
  for insert with check (public.es_administrador() and remitente_id = auth.uid() and tipo = 'admin');

-- Permisos mínimos: de un mensaje solo se puede cambiar "leido" (no el texto, el remitente ni el destinatario).
revoke all on public.mensajes from public, anon, authenticated;
grant select, insert, delete on public.mensajes to authenticated;
grant update (leido) on public.mensajes to authenticated;

-- ============================================================================
-- Bienvenida automática al completar el perfil de búsqueda (con un rol cargado).
-- Se dispara solo en la transición a "perfil completo": quien usa "Omitir por ahora" no la recibe.
-- ============================================================================
create or replace function public.enviar_mensaje_bienvenida()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_enviar boolean := false;
begin
  if new.onboarding_completado and new.rol_buscado is not null then
    if tg_op = 'INSERT' then
      v_enviar := true;
    elsif tg_op = 'UPDATE' then
      -- OLD solo se consulta acá adentro, donde existe seguro.
      if not old.onboarding_completado or old.rol_buscado is null then
        v_enviar := true;
      end if;
    end if;
  end if;

  if v_enviar then
    insert into public.mensajes (remitente_id, destinatario_id, tipo, texto)
    values (null, new.user_id, 'bienvenida',
            'Tu perfil quedó registrado y vamos a tener en cuenta tu solicitud.')
    on conflict do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.enviar_mensaje_bienvenida() from public, anon, authenticated;

create trigger perfil_usuario_bienvenida
  after insert or update on public.perfil_usuario
  for each row execute function public.enviar_mensaje_bienvenida();

commit;

-- rollback (correr aparte si hace falta deshacer):
-- begin;
-- drop trigger perfil_usuario_bienvenida on public.perfil_usuario;
-- drop function public.enviar_mensaje_bienvenida();
-- drop table public.mensajes;
-- drop view public.candidatos;
-- alter table public.perfil_usuario drop column nombre;
-- drop function public.es_administrador();
-- drop table public.roles_usuario;
-- drop type public.rol_enum;
-- commit;

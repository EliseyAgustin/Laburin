-- Laburin — perfil de usuario y onboarding
-- Preferencias capturadas en el wizard de onboarding, usadas para generar
-- los primeros criterios_scoring automáticamente.

create type public.seniority_enum as enum ('junior', 'semi_senior', 'senior');

create table public.perfil_usuario (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null unique references auth.users (id) on delete cascade,
  rol_buscado           text,
  stack_interes         text[] not null default '{}',
  modalidad_preferida   public.modalidad_enum,
  ubicacion             text,
  seniority             public.seniority_enum,
  onboarding_completado boolean not null default false,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

comment on table public.perfil_usuario is 'Preferencias de búsqueda capturadas en el onboarding; origen de los criterios_scoring iniciales.';

alter table public.perfil_usuario enable row level security;

create policy "perfil_usuario_propio" on public.perfil_usuario
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_updated_at before update on public.perfil_usuario
  for each row execute function public.set_updated_at();

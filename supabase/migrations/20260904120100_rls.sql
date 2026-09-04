-- Laburin — Row Level Security
-- Todas las tablas de dominio tienen user_id directo (ver 20260904120000_schema.sql),
-- así que una única política "for all" por tabla alcanza para las 4 operaciones.

alter table public.ofertas enable row level security;
alter table public.postulaciones enable row level security;
alter table public.interacciones enable row level security;
alter table public.criterios_scoring enable row level security;
alter table public.recordatorios enable row level security;

create policy "ofertas_propias" on public.ofertas
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "postulaciones_propias" on public.postulaciones
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "interacciones_propias" on public.interacciones
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "criterios_scoring_propios" on public.criterios_scoring
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "recordatorios_propios" on public.recordatorios
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

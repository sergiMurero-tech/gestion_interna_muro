-- ============================================================
-- Gestión Interna Muro CF · Esquema inicial
-- ============================================================
-- Ejecuta este fichero en Supabase: SQL Editor -> New query -> pega -> Run.
-- Ejecuta las migraciones en orden: 0001, 0002, 0003, 0004.

create extension if not exists "pgcrypto";

-- ---------- Perfiles (extiende auth.users) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  nombre      text not null default '',
  email       text not null default '',
  rol         text not null default 'entrenador' check (rol in ('admin', 'entrenador')),
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- Equipos ----------
create table if not exists public.equipos (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  categoria     text not null default '',
  temporada     text not null default '',
  entrenador_id uuid references public.profiles (id) on delete set null,
  activo        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------- Asignación entrenador <-> equipo (visibilidad) ----------
create table if not exists public.entrenador_equipos (
  entrenador_id uuid not null references public.profiles (id) on delete cascade,
  equipo_id     uuid not null references public.equipos (id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (entrenador_id, equipo_id)
);

-- ---------- Jugadores ----------
create table if not exists public.jugadores (
  id             uuid primary key default gen_random_uuid(),
  nombre_completo text not null,
  equipo_id      uuid references public.equipos (id) on delete set null,
  temporada      text not null default '',
  activo         boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ---------- Licencias federativas (PDF en Storage) ----------
create table if not exists public.licencias (
  id              uuid primary key default gen_random_uuid(),
  jugador_id      uuid not null references public.jugadores (id) on delete cascade,
  temporada       text not null default '',
  nombre_archivo  text not null,
  url_archivo     text not null,          -- ruta dentro del bucket 'licencias'
  fecha_subida    timestamptz not null default now(),
  usuario_subida  uuid references public.profiles (id) on delete set null,
  unique (jugador_id)                     -- una licencia vigente por jugador
);

-- ---------- Historial de documentos generados (sin datos médicos) ----------
create table if not exists public.documentos_generados (
  id               uuid primary key default gen_random_uuid(),
  jugador_id       uuid references public.jugadores (id) on delete set null,
  equipo_id        uuid references public.equipos (id) on delete set null,
  usuario_id       uuid references public.profiles (id) on delete set null,
  fecha_generacion timestamptz not null default now(),
  tipo_documento   text not null default 'parte_lesion'
);

create index if not exists idx_equipos_entrenador on public.equipos (entrenador_id);
create index if not exists idx_jugadores_equipo on public.jugadores (equipo_id);
create index if not exists idx_licencias_jugador on public.licencias (jugador_id);
create index if not exists idx_docs_jugador on public.documentos_generados (jugador_id);
create index if not exists idx_ent_eq_entrenador on public.entrenador_equipos (entrenador_id);

-- ---------- Alta automática de perfil al registrarse ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, email, rol, activo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    coalesce(new.email, ''),
    'entrenador',   -- todo nuevo registro entra como entrenador; el admin lo promociona
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

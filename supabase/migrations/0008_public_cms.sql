-- ============================================================
-- Módulo web público + CMS
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Medios en equipos / jugadores ----------
alter table public.equipos   add column if not exists foto_url text;
alter table public.equipos   add column if not exists descripcion text not null default '';
alter table public.jugadores add column if not exists foto_url text;
alter table public.jugadores add column if not exists dorsal integer;

-- ---------- Cuerpo técnico (público, por equipo) ----------
create table if not exists public.cuerpo_tecnico (
  id         uuid primary key default gen_random_uuid(),
  equipo_id  uuid references public.equipos (id) on delete cascade,
  nombre     text not null,
  cargo      text not null default '',
  foto_url   text,
  orden      integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Noticias ----------
create table if not exists public.noticias (
  id                uuid primary key default gen_random_uuid(),
  titulo            text not null,
  slug              text not null unique,
  resumen           text not null default '',
  contenido         text not null default '',          -- HTML enriquecido
  imagen_url        text,
  galeria           jsonb not null default '[]'::jsonb, -- ["url", ...]
  adjuntos          jsonb not null default '[]'::jsonb, -- [{"nombre","url"}, ...]
  destacada         boolean not null default false,
  publicada         boolean not null default true,
  fecha_publicacion timestamptz not null default now(),
  autor_id          uuid references public.profiles (id) on delete set null,
  created_at        timestamptz not null default now()
);
create index if not exists idx_noticias_fecha on public.noticias (fecha_publicacion desc);

-- ---------- Páginas CMS (Historia, Estadio, y las que cree el admin) ----------
create table if not exists public.paginas (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  titulo     text not null,
  contenido  text not null default '',                 -- HTML enriquecido
  imagen_url text,
  galeria    jsonb not null default '[]'::jsonb,
  publicada  boolean not null default true,
  orden      integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- Patrocinadores ----------
create table if not exists public.patrocinadores (
  id         uuid primary key default gen_random_uuid(),
  nombre     text not null,
  logo_url   text,
  enlace     text,
  orden      integer not null default 0,
  visible    boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- Directiva ----------
create table if not exists public.directiva (
  id          uuid primary key default gen_random_uuid(),
  cargo       text not null default '',
  nombre      text not null,
  foto_url    text,
  descripcion text not null default '',
  orden       integer not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- Menú dinámico (apartados y subapartados) ----------
create table if not exists public.menu_items (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  tipo       text not null default 'ruta' check (tipo in ('ruta', 'externa', 'pagina')),
  destino    text not null default '',                 -- ruta interna, URL externa o slug de página
  parent_id  uuid references public.menu_items (id) on delete cascade,
  orden      integer not null default 0,
  visible    boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_menu_parent on public.menu_items (parent_id, orden);

-- ---------- Configuración del sitio (fila única) ----------
create table if not exists public.site_config (
  id              integer primary key default 1,
  inscripciones_url text not null default '',
  contacto        jsonb not null default '{}'::jsonb,   -- {direccion,telefono,email,redes:{},mapa_embed}
  estadio         jsonb not null default '{}'::jsonb,   -- {nombre,direccion,info,fotos:[]}
  constraint site_config_singleton check (id = 1)
);
insert into public.site_config (id) values (1) on conflict (id) do nothing;

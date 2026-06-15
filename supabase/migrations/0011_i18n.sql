-- ============================================================
-- Internacionalización: campos en valenciano (sufijo _va).
-- ------------------------------------------------------------
-- Los campos existentes se consideran la versión en castellano.
-- Si el campo _va está vacío, la web pública mostrará el castellano
-- como fallback.
-- ============================================================

-- Noticias
alter table public.noticias add column if not exists titulo_va    text;
alter table public.noticias add column if not exists resumen_va   text;
alter table public.noticias add column if not exists contenido_va text;

-- Páginas CMS
alter table public.paginas add column if not exists titulo_va    text;
alter table public.paginas add column if not exists contenido_va text;

-- Etiqueta del menú dinámico
alter table public.menu_items add column if not exists label_va text;

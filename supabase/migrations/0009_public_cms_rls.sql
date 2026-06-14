-- ============================================================
-- RLS del módulo público: lectura pública (anon) + escritura admin
-- ============================================================

-- Equipos y jugadores: ahora también legibles públicamente si están activos
-- (la web pública muestra equipos y jugadores). Admin/entrenador/coordinador
-- siguen viendo además los inactivos.
drop policy if exists equipos_select on public.equipos;
create policy equipos_select on public.equipos
  for select using (activo = true or public.can_view_all() or public.coach_can_see_team(id));

drop policy if exists jugadores_select on public.jugadores;
create policy jugadores_select on public.jugadores
  for select using (
    activo = true
    or public.can_view_all()
    or (equipo_id is not null and public.coach_can_see_team(equipo_id))
  );

-- Activar RLS en las tablas nuevas.
alter table public.cuerpo_tecnico   enable row level security;
alter table public.noticias         enable row level security;
alter table public.paginas          enable row level security;
alter table public.patrocinadores   enable row level security;
alter table public.directiva         enable row level security;
alter table public.menu_items        enable row level security;
alter table public.site_config       enable row level security;

-- Helper: política estándar "lee todo el mundo, escribe solo admin".
-- (se define por tabla)

-- cuerpo_tecnico
drop policy if exists ct_select on public.cuerpo_tecnico;
create policy ct_select on public.cuerpo_tecnico for select using (true);
drop policy if exists ct_write on public.cuerpo_tecnico;
create policy ct_write on public.cuerpo_tecnico for all using (public.is_admin()) with check (public.is_admin());

-- noticias (públicas: solo publicadas; admin: todas)
drop policy if exists noticias_select on public.noticias;
create policy noticias_select on public.noticias
  for select using (publicada = true or public.is_admin());
drop policy if exists noticias_write on public.noticias;
create policy noticias_write on public.noticias for all using (public.is_admin()) with check (public.is_admin());

-- paginas
drop policy if exists paginas_select on public.paginas;
create policy paginas_select on public.paginas
  for select using (publicada = true or public.is_admin());
drop policy if exists paginas_write on public.paginas;
create policy paginas_write on public.paginas for all using (public.is_admin()) with check (public.is_admin());

-- patrocinadores
drop policy if exists patro_select on public.patrocinadores;
create policy patro_select on public.patrocinadores
  for select using (visible = true or public.is_admin());
drop policy if exists patro_write on public.patrocinadores;
create policy patro_write on public.patrocinadores for all using (public.is_admin()) with check (public.is_admin());

-- directiva
drop policy if exists directiva_select on public.directiva;
create policy directiva_select on public.directiva for select using (true);
drop policy if exists directiva_write on public.directiva;
create policy directiva_write on public.directiva for all using (public.is_admin()) with check (public.is_admin());

-- menu_items
drop policy if exists menu_select on public.menu_items;
create policy menu_select on public.menu_items
  for select using (visible = true or public.is_admin());
drop policy if exists menu_write on public.menu_items;
create policy menu_write on public.menu_items for all using (public.is_admin()) with check (public.is_admin());

-- site_config
drop policy if exists config_select on public.site_config;
create policy config_select on public.site_config for select using (true);
drop policy if exists config_write on public.site_config;
create policy config_write on public.site_config for all using (public.is_admin()) with check (public.is_admin());

-- ---------- Storage: bucket público de medios ----------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists media_select on storage.objects;
create policy media_select on storage.objects for select using (bucket_id = 'media');
drop policy if exists media_insert on storage.objects;
create policy media_insert on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());
drop policy if exists media_update on storage.objects;
create policy media_update on storage.objects for update using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
drop policy if exists media_delete on storage.objects;
create policy media_delete on storage.objects for delete using (bucket_id = 'media' and public.is_admin());

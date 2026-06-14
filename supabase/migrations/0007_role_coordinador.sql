-- ============================================================
-- Nuevo rol "coordinador": ve TODOS los equipos (solo lectura
-- + generación de partes), pero no gestiona nada.
-- ============================================================

-- 1) Permitir el nuevo rol.
alter table public.profiles drop constraint if exists profiles_rol_check;
alter table public.profiles
  add constraint profiles_rol_check check (rol in ('admin', 'entrenador', 'coordinador'));

-- 2) Helpers.
create or replace function public.is_coordinator()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and rol = 'coordinador' and activo
  );
$$;

-- ¿Puede ver todos los equipos? (admin o coordinador)
create or replace function public.can_view_all()
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin() or public.is_coordinator();
$$;

-- can_see_team ahora contempla al coordinador.
create or replace function public.can_see_team(team uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.can_view_all() or public.coach_can_see_team(team);
$$;

-- 3) Políticas de LECTURA: sustituir is_admin() por can_view_all().
drop policy if exists equipos_select on public.equipos;
create policy equipos_select on public.equipos
  for select using (public.can_view_all() or public.coach_can_see_team(id));

drop policy if exists jugadores_select on public.jugadores;
create policy jugadores_select on public.jugadores
  for select using (
    public.can_view_all()
    or (equipo_id is not null and public.coach_can_see_team(equipo_id))
  );

drop policy if exists licencias_select on public.licencias;
create policy licencias_select on public.licencias
  for select using (
    public.can_view_all()
    or exists (
      select 1 from public.jugadores j
      where j.id = jugador_id
        and j.equipo_id is not null
        and public.coach_can_see_team(j.equipo_id)
    )
  );

drop policy if exists docs_select on public.documentos_generados;
create policy docs_select on public.documentos_generados
  for select using (
    public.can_view_all()
    or usuario_id = auth.uid()
    or (equipo_id is not null and public.coach_can_see_team(equipo_id))
  );

drop policy if exists docs_insert on public.documentos_generados;
create policy docs_insert on public.documentos_generados
  for insert with check (
    usuario_id = auth.uid()
    and (
      public.can_view_all()
      or (equipo_id is not null and public.coach_can_see_team(equipo_id))
    )
  );

-- 4) Descarga de licencias desde Storage: el coordinador también puede.
drop policy if exists licencias_storage_select on storage.objects;
create policy licencias_storage_select on storage.objects
  for select using (
    bucket_id = 'licencias'
    and (
      public.can_view_all()
      or exists (
        select 1 from public.jugadores j
        where j.id::text = (storage.foldername(name))[1]
          and j.equipo_id is not null
          and public.coach_can_see_team(j.equipo_id)
      )
    )
  );

-- Las políticas de ESCRITURA siguen siendo solo para admin (sin cambios).

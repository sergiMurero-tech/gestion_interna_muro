-- ============================================================
-- Funciones auxiliares + Row Level Security
-- ============================================================

-- is_admin(): ¿el usuario actual es admin activo?
-- SECURITY DEFINER para evitar recursión de RLS sobre profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and rol = 'admin' and activo
  );
$$;

-- coach_can_see_team(): el entrenador ve el equipo si es el principal o está asignado.
create or replace function public.coach_can_see_team(team uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.equipos e
    where e.id = team and e.entrenador_id = auth.uid()
  ) or exists (
    select 1 from public.entrenador_equipos ee
    where ee.equipo_id = team and ee.entrenador_id = auth.uid()
  );
$$;

-- can_see_team(): admin ve todo; entrenador según asignación.
create or replace function public.can_see_team(team uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select public.is_admin() or public.coach_can_see_team(team);
$$;

-- ---------- Activar RLS ----------
alter table public.profiles            enable row level security;
alter table public.equipos             enable row level security;
alter table public.entrenador_equipos  enable row level security;
alter table public.jugadores           enable row level security;
alter table public.licencias           enable row level security;
alter table public.documentos_generados enable row level security;

-- ---------- profiles ----------
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists profiles_delete on public.profiles;
create policy profiles_delete on public.profiles
  for delete using (public.is_admin());

-- ---------- equipos ----------
drop policy if exists equipos_select on public.equipos;
create policy equipos_select on public.equipos
  for select using (public.is_admin() or public.coach_can_see_team(id));

drop policy if exists equipos_admin_write on public.equipos;
create policy equipos_admin_write on public.equipos
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- entrenador_equipos ----------
drop policy if exists ent_eq_select on public.entrenador_equipos;
create policy ent_eq_select on public.entrenador_equipos
  for select using (public.is_admin() or entrenador_id = auth.uid());

drop policy if exists ent_eq_admin_write on public.entrenador_equipos;
create policy ent_eq_admin_write on public.entrenador_equipos
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- jugadores ----------
drop policy if exists jugadores_select on public.jugadores;
create policy jugadores_select on public.jugadores
  for select using (
    public.is_admin()
    or (equipo_id is not null and public.coach_can_see_team(equipo_id))
  );

drop policy if exists jugadores_admin_write on public.jugadores;
create policy jugadores_admin_write on public.jugadores
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- licencias ----------
drop policy if exists licencias_select on public.licencias;
create policy licencias_select on public.licencias
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.jugadores j
      where j.id = jugador_id
        and j.equipo_id is not null
        and public.coach_can_see_team(j.equipo_id)
    )
  );

drop policy if exists licencias_admin_write on public.licencias;
create policy licencias_admin_write on public.licencias
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- documentos_generados ----------
drop policy if exists docs_select on public.documentos_generados;
create policy docs_select on public.documentos_generados
  for select using (
    public.is_admin()
    or usuario_id = auth.uid()
    or (equipo_id is not null and public.coach_can_see_team(equipo_id))
  );

drop policy if exists docs_insert on public.documentos_generados;
create policy docs_insert on public.documentos_generados
  for insert with check (
    usuario_id = auth.uid()
    and (
      public.is_admin()
      or (equipo_id is not null and public.coach_can_see_team(equipo_id))
    )
  );

drop policy if exists docs_admin_delete on public.documentos_generados;
create policy docs_admin_delete on public.documentos_generados
  for delete using (public.is_admin());

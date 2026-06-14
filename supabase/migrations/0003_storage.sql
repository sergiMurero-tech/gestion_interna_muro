-- ============================================================
-- Storage: bucket privado para licencias federativas (PDF)
-- ============================================================
-- Ruta de cada fichero: '<jugador_id>/<nombre>.pdf'
-- (la primera carpeta es el UUID del jugador, usado para los permisos)

insert into storage.buckets (id, name, public)
values ('licencias', 'licencias', false)
on conflict (id) do nothing;

-- SELECT (descargar / signed url): admin, o entrenador con acceso al equipo del jugador.
drop policy if exists licencias_storage_select on storage.objects;
create policy licencias_storage_select on storage.objects
  for select using (
    bucket_id = 'licencias'
    and (
      public.is_admin()
      or exists (
        select 1 from public.jugadores j
        where j.id::text = (storage.foldername(name))[1]
          and j.equipo_id is not null
          and public.coach_can_see_team(j.equipo_id)
      )
    )
  );

-- INSERT / UPDATE / DELETE: solo administradores.
drop policy if exists licencias_storage_insert on storage.objects;
create policy licencias_storage_insert on storage.objects
  for insert with check (bucket_id = 'licencias' and public.is_admin());

drop policy if exists licencias_storage_update on storage.objects;
create policy licencias_storage_update on storage.objects
  for update using (bucket_id = 'licencias' and public.is_admin())
  with check (bucket_id = 'licencias' and public.is_admin());

drop policy if exists licencias_storage_delete on storage.objects;
create policy licencias_storage_delete on storage.objects
  for delete using (bucket_id = 'licencias' and public.is_admin());

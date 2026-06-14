-- ============================================================
-- Datos de ejemplo: equipos del Muro CF (temporada 2025/2026)
-- Opcional. Puedes editarlos o borrarlos desde la app.
-- ============================================================

insert into public.equipos (nombre, categoria, temporada)
select v.nombre, v.categoria, '2025/2026'
from (values
  ('Amateur A',    'Amateur'),
  ('Amateur B',    'Amateur'),
  ('Juvenil A',    'Juvenil'),
  ('Juvenil B',    'Juvenil'),
  ('Cadete',       'Cadete'),
  ('Infantil A',   'Infantil'),
  ('Infantil B',   'Infantil'),
  ('Alevín A',     'Alevín'),
  ('Alevín B',     'Alevín'),
  ('Benjamín A',   'Benjamín'),
  ('Benjamín B',   'Benjamín'),
  ('Prebenjamín',  'Prebenjamín')
) as v(nombre, categoria)
where not exists (
  select 1 from public.equipos e where e.nombre = v.nombre and e.temporada = '2025/2026'
);

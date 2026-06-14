-- ============================================================
-- Menú por defecto + páginas base (editable después desde el CMS)
-- ============================================================

-- Apartados de primer nivel.
insert into public.menu_items (label, tipo, destino, orden)
select v.label, 'ruta', v.destino, v.orden
from (values
  ('Club',            '/club',            1),
  ('Área Deportiva',  '/area-deportiva',  2),
  ('Noticias',        '/noticias',        3),
  ('Inscripciones',   '/inscripciones',   4)
) as v(label, destino, orden)
where not exists (select 1 from public.menu_items m where m.label = v.label and m.parent_id is null);

-- Subapartados de "Club".
insert into public.menu_items (label, tipo, destino, orden, parent_id)
select v.label, 'ruta', v.destino, v.orden, (select id from public.menu_items where label = 'Club' and parent_id is null)
from (values
  ('Historia',        '/club/historia',        1),
  ('Directiva',       '/club/directiva',       2),
  ('Estadio',         '/club/estadio',         3),
  ('Patrocinadores',  '/club/patrocinadores',  4),
  ('Contacto',        '/club/contacto',        5)
) as v(label, destino, orden)
where exists (select 1 from public.menu_items where label = 'Club' and parent_id is null)
  and not exists (
    select 1 from public.menu_items m
    where m.label = v.label
      and m.parent_id = (select id from public.menu_items where label = 'Club' and parent_id is null)
  );

-- Página de Historia (editable).
insert into public.paginas (slug, titulo, contenido)
values ('historia', 'Historia del club', '<p>Edita esta página desde Gestión Web → Páginas.</p>')
on conflict (slug) do nothing;

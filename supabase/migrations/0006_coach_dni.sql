-- ============================================================
-- Acceso de entrenadores por DNI (sin contraseña visible)
-- ============================================================
-- El superadmin da de alta a cada entrenador con su DNI y nombre.
-- Internamente se crea un usuario de Supabase con email sintético
-- '<dni>@muro.local' y el propio DNI como contraseña. El entrenador
-- solo teclea su DNI para entrar.
--
-- IMPORTANTE: en Supabase -> Authentication -> Providers -> Email,
-- desactiva "Confirm email" (los emails son sintéticos, no se envían).

alter table public.profiles add column if not exists dni text;

create unique index if not exists profiles_dni_key
  on public.profiles (dni)
  where dni is not null;

-- Recrea el alta automática de perfil incluyendo el DNI.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nombre, email, dni, rol, activo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nombre', ''),
    coalesce(new.email, ''),
    nullif(new.raw_user_meta_data ->> 'dni', ''),
    'entrenador',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

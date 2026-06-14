-- ============================================================
-- Convierte tu usuario en administrador.
-- ============================================================
-- 1) Regístrate primero desde la app (o crea el usuario en
--    Authentication -> Users del panel de Supabase).
-- 2) Sustituye el email y ejecuta esta consulta UNA vez.

update public.profiles
set rol = 'admin', activo = true
where email = 'desarrollo4@glop.es';

-- Comprueba el resultado:
-- select id, email, rol, activo from public.profiles;

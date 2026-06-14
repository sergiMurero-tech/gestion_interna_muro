# Gestión Interna Muro CF

Aplicación web (PWA, responsive) para la gestión interna del Muro Club de Fútbol.

- **Administradores** (desde ordenador): gestionan equipos, jugadores, licencias federativas y entrenadores.
- **Entrenadores** (desde el móvil): consultan sus equipos y, cuando un jugador se lesiona, obtienen en segundos el **parte de lesiones** + la **licencia federativa** para descargar o compartir.

Stack: React + TypeScript + Vite + Tailwind · Supabase (Auth, PostgreSQL, Storage) · pdf-lib · Vercel.

---

## 1. Configurar Supabase

1. En tu proyecto de Supabase, abre **SQL Editor** y ejecuta, **en orden**, los ficheros de `supabase/migrations/`:
   - `0001_init.sql` — tablas y alta automática de perfiles.
   - `0002_functions_rls.sql` — funciones de permisos y políticas RLS.
   - `0003_storage.sql` — bucket privado `licencias` y sus permisos.
   - `0004_seed_teams.sql` — *(opcional)* equipos de ejemplo del club.
2. **Regístrate** desde la app (o crea el usuario en *Authentication → Users*).
3. Ejecuta `0005_make_admin.sql` (ajusta el email) para convertir tu cuenta en administrador.

> La seguridad de los datos la garantiza el **Row Level Security** definido en `0002`: cada usuario solo ve lo que le corresponde según su rol y los equipos asignados. La `anon key` es pública por diseño; no concede acceso por sí sola.

## 2. Variables de entorno

Copia `.env.example` a `.env.local` y rellena:

```
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon public key>
```

(Project Settings → API → *Project URL* y *Project API keys → anon public*.)

## 3. Desarrollo local

```bash
npm install
npm run dev
```

## 4. Despliegue en Vercel

1. Entra en [vercel.com](https://vercel.com) con tu cuenta de GitHub e **importa este repositorio** (una sola vez).
2. En *Settings → Environment Variables* añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Cada `git push` desplegará automáticamente (Preview en ramas, Production en la rama principal). Vite y `vercel.json` ya están configurados.

---

## Flujo del entrenador (objetivo < 30 s)

Equipo → Jugador → **Obtener documentación por lesión** → Descargar o compartir **Parte + Licencia**.

- Si el jugador no tiene licencia subida, el proceso se bloquea con el aviso correspondiente.
- En el parte oficial **solo se rellena la fecha** (por defecto hoy, editable). El resto lo completan familia y personal médico.
- En móvil, “Compartir” usa la *Web Share API* para adjuntar ambos PDF a WhatsApp, correo, etc.

## La plantilla del parte

Es `public/templates/parte-lesiones.pdf` (la oficial de la Mutualidad, con escudo, sello, club y firma ya incluidos). Las coordenadas donde se escribe la fecha están en `src/lib/pdf.ts`. Si cambias de plantilla, ajusta ahí `POS` y `LINE_Y`.

## Protección de datos (RGPD)

- Acceso con usuario y contraseña; HTTPS en Vercel; almacenamiento cifrado en Supabase.
- Permisos por rol vía RLS. **No se guardan datos médicos** (ni diagnósticos, ni lesiones).
- El historial registra quién generó cada documento y cuándo, sin información clínica.
- Para borrar temporadas antiguas, elimina equipos/jugadores/licencias desde el panel o por SQL.

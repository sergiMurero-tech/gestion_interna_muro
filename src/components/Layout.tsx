import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Rol } from '../types/db'

const ROL_LABEL: Record<Rol, string> = {
  admin: 'Admin',
  coordinador: 'Coordinador',
  entrenador: 'Entrenador',
}

export default function Layout() {
  const { profile, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const links = [
    { to: '/gestion', label: 'Equipos', end: true },
    ...(isAdmin
      ? [
          { to: '/gestion/admin', label: 'Panel', end: true },
          { to: '/gestion/admin/equipos', label: 'Equipos', end: false },
          { to: '/gestion/admin/jugadores', label: 'Jugadores', end: false },
          { to: '/gestion/admin/licencias', label: 'Licencias', end: false },
          { to: '/gestion/admin/entrenadores', label: 'Entrenadores', end: false },
          { to: '/gestion/admin/historial', label: 'Historial', end: false },
          { to: '/gestion/web', label: 'Gestión Web', end: false },
        ]
      : []),
  ]

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b-4 border-gold bg-black text-white shadow-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/gestion')} className="flex items-center gap-2.5 font-bold">
            <img
              src="/club-crest.png"
              alt="Escudo Muro CF"
              className="h-9 w-9 object-contain"
            />
            <span className="text-lg font-extrabold uppercase tracking-wide">Muro CF · Gestión</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-300 sm:block">
              {profile?.nombre || profile?.email} · <span className="text-gold">{ROL_LABEL[profile?.rol ?? 'entrenador']}</span>
            </span>
            <a href="/" className="hidden rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20 sm:block">
              Ver web
            </a>
            <button onClick={() => signOut()} className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20">
              Salir
            </button>
          </div>
        </div>
        {links.length > 1 && (
          <nav className="border-t border-white/10 bg-zinc-950">
            <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 py-1.5">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition ${
                      isActive ? 'bg-gold text-black' : 'text-zinc-300 hover:bg-white/10'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5">
        <Outlet />
      </main>
    </div>
  )
}

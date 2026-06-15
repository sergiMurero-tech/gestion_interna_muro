import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Rol } from '../types/db'
import ThemeToggle from './ThemeToggle'

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
      <header className="sticky top-0 z-40 border-b-4 border-gold bg-black/95 text-white shadow-lg backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/gestion')} className="group flex items-center gap-2.5">
            <img
              src="/club-crest.png"
              alt="Escudo Muro CF"
              className="h-10 w-10 object-contain transition-transform duration-300 group-hover:rotate-[-6deg]"
            />
            <span className="h-display text-2xl tracking-wider">Muro <span className="text-gold">CF</span> · Gestión</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-zinc-300 sm:block">
              {profile?.nombre || profile?.email} · <span className="text-gold">{ROL_LABEL[profile?.rol ?? 'entrenador']}</span>
            </span>
            <a href="/" className="hidden rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium hover:bg-white/20 sm:block">
              Ver web
            </a>
            <ThemeToggle />
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
                    `whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                      isActive ? 'bg-gold-grad text-black shadow-gold' : 'text-zinc-300 hover:bg-white/10 hover:text-white'
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

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
    { to: '/', label: 'Equipos', end: true },
    ...(isAdmin
      ? [
          { to: '/admin', label: 'Panel', end: false },
          { to: '/admin/equipos', label: 'Equipos', end: false },
          { to: '/admin/jugadores', label: 'Jugadores', end: false },
          { to: '/admin/licencias', label: 'Licencias', end: false },
          { to: '/admin/entrenadores', label: 'Entrenadores', end: false },
          { to: '/admin/historial', label: 'Historial', end: false },
        ]
      : []),
  ]

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 bg-muro text-white shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-white/15 font-black">M</span>
            <span className="text-lg">Muro CF</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm opacity-90 sm:block">
              {profile?.nombre || profile?.email} · {ROL_LABEL[profile?.rol ?? 'entrenador']}
            </span>
            <button onClick={() => signOut()} className="rounded-md bg-white/15 px-3 py-1.5 text-sm font-medium hover:bg-white/25">
              Salir
            </button>
          </div>
        </div>
        {links.length > 1 && (
          <nav className="border-t border-white/15 bg-muro-dark/40">
            <div className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 py-1.5">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition ${
                      isActive ? 'bg-white text-muro' : 'text-white/90 hover:bg-white/15'
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

import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { buildMenuTree, getConfig, getMenuItems, isExternal, menuHref, type MenuNode } from '../../lib/cms'
import type { SiteConfig } from '../../types/db'
import ThemeToggle from '../ThemeToggle'

export default function PublicLayout() {
  const [nodes, setNodes] = useState<MenuNode[]>([])
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [openMobile, setOpenMobile] = useState(false)
  const location = useLocation()

  useEffect(() => {
    getMenuItems().then((items) => setNodes(buildMenuTree(items)))
    getConfig().then(setConfig)
  }, [])

  useEffect(() => {
    setOpenMobile(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b-4 border-gold bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/club-crest.png" alt="Escudo Muro CF" className="h-10 w-10 object-contain" />
            <span className="text-lg font-extrabold uppercase tracking-wide">Muro CF</span>
          </Link>

          {/* Menú escritorio */}
          <nav className="hidden items-center gap-1 lg:flex">
            {nodes.map((n) => (
              <DesktopMenuItem key={n.item.id} node={n} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/acceso" className="btn-primary hidden sm:inline-flex">
              Acceso
            </Link>
            <button
              className="rounded-md bg-white/10 p-2 lg:hidden"
              onClick={() => setOpenMobile((v) => !v)}
              aria-label="Menú"
            >
              <span className="block h-0.5 w-6 bg-white" />
              <span className="mt-1.5 block h-0.5 w-6 bg-white" />
              <span className="mt-1.5 block h-0.5 w-6 bg-white" />
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {openMobile && (
          <nav className="border-t border-white/10 bg-zinc-950 px-4 py-3 lg:hidden">
            {nodes.map((n) => (
              <MobileMenuItem key={n.item.id} node={n} />
            ))}
            <Link to="/acceso" className="btn-primary mt-3 w-full">
              Acceso
            </Link>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <PublicFooter config={config} />
    </div>
  )
}

function DesktopMenuItem({ node }: { node: MenuNode }) {
  const navigate = useNavigate()
  const { item, children } = node
  const href = menuHref(item)

  if (children.length === 0) {
    return isExternal(item) ? (
      <a href={href} target="_blank" rel="noreferrer" className="rounded-md px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10">
        {item.label}
      </a>
    ) : (
      <Link to={href} className="rounded-md px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10">
        {item.label}
      </Link>
    )
  }

  return (
    <div className="group relative">
      <button
        onClick={() => navigate(href)}
        className="rounded-md px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-white/10"
      >
        {item.label} <span className="text-xs text-gold">▾</span>
      </button>
      <div className="invisible absolute left-0 top-full z-50 min-w-48 rounded-lg border border-zinc-800 bg-zinc-900 py-1 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100">
        {children.map((c) =>
          c.tipo === 'externa' ? (
            <a key={c.id} href={menuHref(c)} target="_blank" rel="noreferrer" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
              {c.label}
            </a>
          ) : (
            <Link key={c.id} to={menuHref(c)} className="block px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
              {c.label}
            </Link>
          ),
        )}
      </div>
    </div>
  )
}

function MobileMenuItem({ node }: { node: MenuNode }) {
  const { item, children } = node
  return (
    <div className="py-1">
      {isExternal(item) ? (
        <a href={menuHref(item)} target="_blank" rel="noreferrer" className="block py-1.5 font-semibold text-white">
          {item.label}
        </a>
      ) : (
        <Link to={menuHref(item)} className="block py-1.5 font-semibold text-white">
          {item.label}
        </Link>
      )}
      {children.length > 0 && (
        <div className="ml-3 border-l border-zinc-800 pl-3">
          {children.map((c) =>
            c.tipo === 'externa' ? (
              <a key={c.id} href={menuHref(c)} target="_blank" rel="noreferrer" className="block py-1 text-sm text-zinc-300">
                {c.label}
              </a>
            ) : (
              <Link key={c.id} to={menuHref(c)} className="block py-1 text-sm text-zinc-300">
                {c.label}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  )
}

function PublicFooter({ config }: { config: SiteConfig | null }) {
  const c = config?.contacto
  const redes = c?.redes ?? {}
  return (
    <footer className="border-t-4 border-gold bg-black px-4 py-8 text-sm text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <img src="/club-crest.png" alt="" className="h-10 w-10 object-contain" />
          <div>
            <div className="font-bold text-white">Muro Club de Fútbol</div>
            {c?.direccion && <div>{c.direccion}</div>}
            {c?.telefono && <div>Tel. {c.telefono}</div>}
            {c?.email && <div>{c.email}</div>}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {redes.facebook && <a href={redes.facebook} target="_blank" rel="noreferrer" className="hover:text-gold">Facebook</a>}
          {redes.instagram && <a href={redes.instagram} target="_blank" rel="noreferrer" className="hover:text-gold">Instagram</a>}
          {redes.x && <a href={redes.x} target="_blank" rel="noreferrer" className="hover:text-gold">X / Twitter</a>}
          {redes.youtube && <a href={redes.youtube} target="_blank" rel="noreferrer" className="hover:text-gold">YouTube</a>}
        </div>
      </div>
      <div className="mx-auto mt-6 max-w-6xl text-xs text-zinc-600">
        © {new Date().getFullYear()} Muro Club de Fútbol · <Link to="/acceso" className="hover:text-gold">Acceso área privada</Link>
      </div>
    </footer>
  )
}

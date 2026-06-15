import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { buildMenuTree, getConfig, getMenuItems, isExternal, menuHref, type MenuNode } from '../../lib/cms'
import type { SiteConfig } from '../../types/db'
import ThemeToggle from '../ThemeToggle'
import SocialLinks from './SocialLinks'
import SponsorsMarquee from './SponsorsMarquee'

export default function PublicLayout() {
  const [nodes, setNodes] = useState<MenuNode[]>([])
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [openMobile, setOpenMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    getMenuItems().then((items) => setNodes(buildMenuTree(items)))
    getConfig().then(setConfig)
  }, [])

  useEffect(() => {
    setOpenMobile(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="flex min-h-full flex-col">
      <header
        className={`sticky top-0 z-40 border-b-4 border-gold bg-black/95 text-white backdrop-blur transition-all ${
          scrolled ? 'shadow-2xl' : ''
        }`}
      >
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-all ${
            scrolled ? 'py-2' : 'py-3'
          }`}
        >
          <Link to="/" className="group flex items-center gap-3">
            <img
              src="/club-crest.png"
              alt="Escudo Muro CF"
              className={`object-contain transition-all duration-300 group-hover:rotate-[-6deg] ${
                scrolled ? 'h-9 w-9' : 'h-12 w-12'
              }`}
            />
            <span className="h-display text-2xl tracking-wider sm:text-3xl">
              Muro <span className="text-gold">CF</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {nodes.map((n) => (
              <DesktopMenuItem key={n.item.id} node={n} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/acceso"
              className="hidden items-center gap-2 rounded-lg bg-gold-grad px-4 py-2 text-sm font-bold uppercase tracking-wider text-zinc-950 shadow-gold transition hover:shadow-glow sm:inline-flex"
            >
              <LockIcon className="h-4 w-4" />
              Acceso
            </Link>
            <button
              className="grid h-10 w-10 place-items-center rounded-md bg-white/10 transition hover:bg-white/20 lg:hidden"
              onClick={() => setOpenMobile((v) => !v)}
              aria-label="Menú"
            >
              <BurgerIcon open={openMobile} />
            </button>
          </div>
        </div>

        {openMobile && (
          <nav className="border-t border-white/10 bg-black px-4 py-3 lg:hidden">
            {nodes.map((n) => (
              <MobileMenuItem key={n.item.id} node={n} />
            ))}
            <Link to="/acceso" className="btn-primary mt-3 w-full">
              <LockIcon className="h-4 w-4" />
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
  const { item, children } = node
  const href = menuHref(item)

  if (children.length === 0) {
    return isExternal(item) ? (
      <a href={href} target="_blank" rel="noreferrer" className="nav-link text-zinc-200 hover:text-white">
        {item.label}
      </a>
    ) : (
      <NavLink
        to={href}
        end={href === '/'}
        className={({ isActive }) =>
          `nav-link text-zinc-200 hover:text-white ${isActive ? 'is-active text-white' : ''}`
        }
      >
        {item.label}
      </NavLink>
    )
  }

  return (
    <div className="group relative">
      <button className="nav-link text-zinc-200 hover:text-white">
        {item.label}
        <Chevron className="ml-1 h-3 w-3 text-gold transition-transform group-hover:rotate-180" />
      </button>
      <div className="invisible absolute left-1/2 top-full z-50 min-w-56 -translate-x-1/2 translate-y-1 rounded-xl border border-white/10 bg-black/95 p-1 opacity-0 shadow-2xl backdrop-blur transition group-hover:visible group-hover:opacity-100">
        {children.map((c) =>
          c.tipo === 'externa' ? (
            <a
              key={c.id}
              href={menuHref(c)}
              target="_blank"
              rel="noreferrer"
              className="block rounded-lg px-4 py-2 text-sm text-zinc-200 transition hover:bg-gold hover:text-black"
            >
              {c.label}
            </a>
          ) : (
            <Link
              key={c.id}
              to={menuHref(c)}
              className="block rounded-lg px-4 py-2 text-sm text-zinc-200 transition hover:bg-gold hover:text-black"
            >
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
        <a href={menuHref(item)} target="_blank" rel="noreferrer" className="block py-1.5 font-bold uppercase tracking-wider text-white">
          {item.label}
        </a>
      ) : (
        <Link to={menuHref(item)} className="block py-1.5 font-bold uppercase tracking-wider text-white">
          {item.label}
        </Link>
      )}
      {children.length > 0 && (
        <div className="ml-3 border-l border-gold/40 pl-3">
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
    <footer className="relative mt-16 bg-black px-4 pb-8 text-sm text-zinc-400">
      <div className="diagonal-divider" />
      <div className="pt-10">
        <div className="mx-auto grid max-w-6xl items-center gap-8 sm:grid-cols-[auto_1fr_auto]">
          <div className="flex items-center gap-3">
            <img src="/club-crest.png" alt="" className="h-12 w-12 object-contain" />
            <div>
              <div className="h-display text-2xl text-white">Muro Club de Fútbol</div>
              {c?.direccion && <div>{c.direccion}</div>}
              {c?.telefono && <div>Tel. {c.telefono}</div>}
              {c?.email && <div>{c.email}</div>}
            </div>
          </div>
          <div className="min-w-0">
            <SponsorsMarquee />
          </div>
          <SocialLinks redes={redes} />
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 pt-4 text-xs text-zinc-600">
          © {new Date().getFullYear()} Muro Club de Fútbol · ¡Sentiment blanc i negre! ·{' '}
          <Link to="/acceso" className="hover:text-gold">
            Acceso área privada
          </Link>
        </div>
      </div>
    </footer>
  )
}

// ---------- Iconos inline ----------

function LockIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}
function Chevron({ className = 'h-3 w-3' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      {open ? (
        <>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </>
      ) : (
        <>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </>
      )}
    </svg>
  )
}

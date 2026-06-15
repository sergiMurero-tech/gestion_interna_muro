import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Noticia } from '../../types/db'
import Spinner from '../../components/Spinner'

function formatFecha(x: string) {
  return new Date(x).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

const ACCESOS = [
  {
    label: 'Área Deportiva',
    desc: 'Equipos del club',
    to: '/area-deportiva',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4" />
      </svg>
    ),
  },
  {
    label: 'Noticias',
    desc: 'Actualidad del club',
    to: '/noticias',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h13a3 3 0 0 1 3 3v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4z" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    ),
  },
  {
    label: 'Inscripciones',
    desc: 'Únete al club',
    to: '/inscripciones',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    label: 'Contacto',
    desc: 'Habla con nosotros',
    to: '/club/contacto',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92V21a1 1 0 0 1-1.1 1 19.7 19.7 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.7 19.7 0 0 1 3 4.1 1 1 0 0 1 4 3h4.1a1 1 0 0 1 1 .8 11.9 11.9 0 0 0 .6 2.6 1 1 0 0 1-.2 1L8 8.9a16 16 0 0 0 6 6l1.5-1.5a1 1 0 0 1 1-.2 11.9 11.9 0 0 0 2.6.6 1 1 0 0 1 .9 1z" />
      </svg>
    ),
  },
]

export default function PublicHome() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('noticias')
      .select('*')
      .eq('publicada', true)
      .order('fecha_publicacion', { ascending: false })
      .limit(9)
      .then(({ data }) => {
        setNoticias((data as Noticia[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label="Cargando…" />

  const hero = noticias.find((n) => n.destacada) ?? noticias[0]
  const resto = noticias.filter((n) => n.id !== hero?.id).slice(0, 6)

  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="relative isolate overflow-hidden bg-black text-white">
        {hero?.imagen_url ? (
          <img
            src={hero.imagen_url}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-50"
          />
        ) : (
          <div className="absolute inset-0 bg-stripes-gold opacity-30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/30 blur-3xl" aria-hidden />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-red-600/20 blur-3xl" aria-hidden />

        <div className="relative mx-auto grid min-h-[60vh] max-w-6xl items-center gap-8 px-4 py-20 sm:min-h-[70vh] lg:grid-cols-[1.2fr_0.8fr]">
          <div className="animate-fade-up">
            <span className="eyebrow">Muro Club de Fútbol</span>
            <h1 className="h-display text-shadow text-6xl text-white sm:text-7xl lg:text-8xl">
              Sentiment <br />
              <span className="text-gold">blanc i negre</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-zinc-200 text-balance">
              La cantera, el primer equipo y toda la actualidad del Muro CF en un mismo sitio.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/area-deportiva" className="btn-primary px-6 py-3 text-base">
                Conocer los equipos
              </Link>
              <Link
                to="/noticias"
                className="btn inline-flex items-center gap-2 border border-white/30 text-white hover:border-gold hover:text-gold"
              >
                Ver noticias →
              </Link>
            </div>
          </div>

          {hero && (
            <Link
              to={`/noticias/${hero.slug}`}
              className="group relative block animate-fade-up overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
            >
              <div className="relative aspect-[4/5] sm:aspect-[3/4]">
                {hero.imagen_url ? (
                  <img
                    src={hero.imagen_url}
                    alt={hero.titulo}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                    <img src="/club-crest.png" alt="" className="h-24 w-24 opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                {hero.destacada && (
                  <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-black">
                    ★ Destacada
                  </span>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                  <span className="text-xs uppercase tracking-widest text-gold">{formatFecha(hero.fecha_publicacion)}</span>
                  <h2 className="mt-1 text-2xl font-extrabold leading-tight text-shadow line-clamp-3">{hero.titulo}</h2>
                </div>
              </div>
            </Link>
          )}
        </div>

        <div className="diagonal-divider" />
      </section>

      {/* ---------- ACCESOS RÁPIDOS ---------- */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="eyebrow">Empieza aquí</span>
            <h2 className="section-title">
              Accesos <span className="text-gold">rápidos</span>
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ACCESOS.map((a, i) => (
            <Link
              key={a.to}
              to={a.to}
              style={{ animationDelay: `${i * 60}ms` }}
              className="card-hover group flex animate-fade-up flex-col gap-3 p-5"
            >
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gold/10 text-gold transition group-hover:bg-gold group-hover:text-black">
                <span className="block h-6 w-6">{a.icon}</span>
              </span>
              <div>
                <div className="h-display text-xl text-zinc-900 dark:text-white">{a.label}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{a.desc}</div>
              </div>
              <span className="mt-auto inline-flex items-center text-sm font-semibold text-gold opacity-0 transition group-hover:opacity-100">
                Ver más →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- ÚLTIMAS NOTICIAS ---------- */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="eyebrow">Actualidad</span>
            <h2 className="section-title">
              Últimas <span className="text-gold">noticias</span>
            </h2>
          </div>
          <Link to="/noticias" className="hidden text-sm font-semibold text-gold hover:underline sm:inline">
            Ver todas →
          </Link>
        </div>

        {resto.length === 0 ? (
          <div className="card p-8 text-center text-zinc-500 dark:text-zinc-400">
            No hay más noticias por ahora.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resto.map((n, i) => (
              <Link
                key={n.id}
                to={`/noticias/${n.slug}`}
                style={{ animationDelay: `${i * 60}ms` }}
                className="card-hover group animate-fade-up overflow-hidden p-0"
              >
                <div className="relative h-44 overflow-hidden">
                  {n.imagen_url ? (
                    <img
                      src={n.imagen_url}
                      alt={n.titulo}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                      <img src="/club-crest.png" alt="" className="h-16 w-16 opacity-30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition group-hover:opacity-100" />
                </div>
                <div className="p-5">
                  <span className="text-xs uppercase tracking-widest text-gold">{formatFecha(n.fecha_publicacion)}</span>
                  <h3 className="mt-1 font-extrabold text-zinc-900 group-hover:text-gold dark:text-white">{n.titulo}</h3>
                  {n.resumen && <p className="mt-2 text-sm text-zinc-500 line-clamp-2 dark:text-zinc-400">{n.resumen}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

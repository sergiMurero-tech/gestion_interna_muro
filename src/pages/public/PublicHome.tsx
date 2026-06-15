import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Noticia } from '../../types/db'
import Spinner from '../../components/Spinner'

function formatFecha(x: string) {
  return new Date(x).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

const ACCESOS = [
  { label: 'Área Deportiva', to: '/area-deportiva' },
  { label: 'Noticias', to: '/noticias' },
  { label: 'Inscripciones', to: '/inscripciones' },
  { label: 'Contacto', to: '/club/contacto' },
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
      .limit(8)
      .then(({ data }) => {
        setNoticias((data as Noticia[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label="Cargando…" />

  const hero = noticias.find((n) => n.destacada) ?? noticias[0]
  const resto = noticias.filter((n) => n.id !== hero?.id)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {hero && (
        <Link
          to={`/noticias/${hero.slug}`}
          className="group relative mb-10 block h-72 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 sm:h-96"
        >
          {hero.imagen_url ? (
            <img
              src={hero.imagen_url}
              alt={hero.titulo}
              className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
              <img src="/club-crest.png" alt="" className="h-24 w-24 opacity-30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white drop-shadow-md">
            <span className="mb-2 block text-xs text-zinc-200">{formatFecha(hero.fecha_publicacion)}</span>
            <h2 className="text-3xl font-extrabold text-white">{hero.titulo}</h2>
            {hero.resumen && <p className="mt-2 max-w-2xl text-zinc-100 line-clamp-2">{hero.resumen}</p>}
          </div>
        </Link>
      )}

      <section className="mb-12">
        <h1 className="mb-6 text-3xl font-extrabold text-zinc-900 dark:text-white">
          Accesos <span className="text-gold">rápidos</span>
        </h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {ACCESOS.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="card flex items-center justify-center border-gold/40 p-6 text-center text-lg font-bold text-gold transition hover:border-gold hover:shadow-md"
            >
              {a.label}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-3xl font-extrabold text-zinc-900 dark:text-white">
          Últimas <span className="text-gold">noticias</span>
        </h2>
        {resto.length === 0 ? (
          <div className="card p-6 text-center text-zinc-500 dark:text-zinc-400">No hay más noticias por ahora.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resto.map((n) => (
              <Link
                key={n.id}
                to={`/noticias/${n.slug}`}
                className="card group overflow-hidden p-0 transition hover:border-gold hover:shadow-md"
              >
                {n.imagen_url ? (
                  <img src={n.imagen_url} alt={n.titulo} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                    <img src="/club-crest.png" alt="" className="h-16 w-16 opacity-30" />
                  </div>
                )}
                <div className="p-4">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatFecha(n.fecha_publicacion)}</span>
                  <h3 className="mt-1 font-bold text-zinc-900 dark:text-white">{n.titulo}</h3>
                  {n.resumen && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">{n.resumen}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

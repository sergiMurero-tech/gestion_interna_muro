import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Noticia } from '../../types/db'
import Spinner from '../../components/Spinner'

function formatFecha(x: string) {
  return new Date(x).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function NoticiasPage() {
  const [items, setItems] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('noticias')
      .select('*')
      .eq('publicada', true)
      .order('fecha_publicacion', { ascending: false })
      .then(({ data }) => {
        setItems((data as Noticia[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label="Cargando noticias…" />

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <span className="eyebrow">Actualidad</span>
      <h1 className="section-title mb-10">
        Noti<span className="text-gold">cias</span>
      </h1>

      {items.length === 0 ? (
        <div className="card p-8 text-center text-zinc-500 dark:text-zinc-400">No hay noticias publicadas.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((n, i) => (
            <Link
              key={n.id}
              to={`/noticias/${n.slug}`}
              style={{ animationDelay: `${i * 50}ms` }}
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
                {n.destacada && (
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-black">
                    ★ Destacada
                  </span>
                )}
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
    </div>
  )
}

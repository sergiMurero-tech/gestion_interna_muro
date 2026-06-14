import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Noticia } from '../../types/db'
import Spinner from '../../components/Spinner'

function formatFecha(x: string) {
  return new Date(x).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('noticias')
      .select('*')
      .eq('publicada', true)
      .order('fecha_publicacion', { ascending: false })
      .then(({ data }) => {
        setNoticias((data as Noticia[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label="Cargando noticias…" />

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold text-white">Noticias</h1>
      {noticias.length === 0 ? (
        <div className="card p-6 text-center text-zinc-400">No hay noticias publicadas.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {noticias.map((n) => (
            <Link
              key={n.id}
              to={`/noticias/${n.slug}`}
              className="card group overflow-hidden p-0 transition hover:border-gold hover:shadow-md"
            >
              {n.imagen_url ? (
                <img src={n.imagen_url} alt={n.titulo} className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-zinc-800">
                  <img src="/club-crest.png" alt="" className="h-16 w-16 opacity-30" />
                </div>
              )}
              <div className="p-4">
                <span className="text-xs text-zinc-400">{formatFecha(n.fecha_publicacion)}</span>
                <h2 className="mt-1 font-bold text-white">{n.titulo}</h2>
                {n.resumen && <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{n.resumen}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

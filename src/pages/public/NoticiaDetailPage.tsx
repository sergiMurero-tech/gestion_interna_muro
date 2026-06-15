import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Noticia } from '../../types/db'
import Spinner from '../../components/Spinner'

function formatFecha(x: string) {
  return new Date(x).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function NoticiaDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [noticia, setNoticia] = useState<Noticia | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }
    supabase
      .from('noticias')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => {
        setNoticia((data as Noticia) ?? null)
        setLoading(false)
      })
  }, [slug])

  if (loading) return <Spinner label="Cargando noticia…" />

  if (!noticia) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="card p-6 text-center text-zinc-600 dark:text-zinc-300">
          <p className="mb-4">Noticia no encontrada.</p>
          <Link to="/noticias" className="btn-secondary inline-block">
            Volver a noticias
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/noticias" className="mb-4 inline-block text-sm text-gold hover:underline">
        ← Volver a noticias
      </Link>

      <span className="mb-2 block text-sm text-zinc-500 dark:text-zinc-400">{formatFecha(noticia.fecha_publicacion)}</span>
      <h1 className="mb-6 text-3xl font-extrabold text-zinc-900 dark:text-white">{noticia.titulo}</h1>

      {noticia.imagen_url && (
        <div className="mb-6 flex justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900">
          <img
            src={noticia.imagen_url}
            alt={noticia.titulo}
            className="max-h-[70vh] w-auto rounded-xl object-contain"
          />
        </div>
      )}

      <div className="richtext" dangerouslySetInnerHTML={{ __html: noticia.contenido }} />

      {noticia.galeria?.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-white">Galería</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {noticia.galeria.map((src, i) => (
              <img key={i} src={src} alt="" className="h-40 w-full rounded-lg object-cover" />
            ))}
          </div>
        </div>
      )}

      {noticia.adjuntos?.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-white">Adjuntos</h2>
          <div className="flex flex-wrap gap-3">
            {noticia.adjuntos.map((a, i) => (
              <a
                key={i}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                {a.nombre}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

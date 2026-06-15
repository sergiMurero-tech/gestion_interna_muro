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
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="card p-8 text-center text-zinc-600 dark:text-zinc-300">
          <p className="mb-4">Noticia no encontrada.</p>
          <Link to="/noticias" className="btn-secondary inline-block">
            Volver a noticias
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="animate-fade-up">
      <header className="relative isolate overflow-hidden bg-black text-white">
        {noticia.imagen_url && (
          <>
            <img src={noticia.imagen_url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30" />
          </>
        )}
        <div className="relative mx-auto max-w-3xl px-4 py-16">
          <Link to="/noticias" className="text-sm text-gold hover:underline">
            ← Volver a noticias
          </Link>
          <span className="mt-4 block text-xs uppercase tracking-widest text-gold">{formatFecha(noticia.fecha_publicacion)}</span>
          <h1 className="h-display mt-2 text-4xl text-white text-shadow sm:text-5xl">{noticia.titulo}</h1>
          {noticia.resumen && <p className="mt-4 max-w-2xl text-lg text-zinc-200 text-balance">{noticia.resumen}</p>}
        </div>
        <div className="diagonal-divider" />
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {noticia.imagen_url && (
          <div className="mb-8 flex justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
            <img
              src={noticia.imagen_url}
              alt={noticia.titulo}
              className="max-h-[70vh] w-auto rounded-2xl object-contain"
            />
          </div>
        )}

        <div className="richtext" dangerouslySetInnerHTML={{ __html: noticia.contenido }} />

        {noticia.galeria?.length > 0 && (
          <section className="mt-10">
            <span className="eyebrow">Galería</span>
            <h2 className="section-title mb-5 text-3xl">Imágenes</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {noticia.galeria.map((src, i) => (
                <img key={i} src={src} alt="" className="aspect-square w-full rounded-xl object-cover" />
              ))}
            </div>
          </section>
        )}

        {noticia.adjuntos?.length > 0 && (
          <section className="mt-10">
            <span className="eyebrow">Documentos</span>
            <h2 className="section-title mb-5 text-3xl">Adjuntos</h2>
            <div className="flex flex-wrap gap-2">
              {noticia.adjuntos.map((a, i) => (
                <a key={i} href={a.url} target="_blank" rel="noreferrer" className="btn-secondary">
                  ↓ {a.nombre}
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}

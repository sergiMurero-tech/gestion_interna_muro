import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Pagina } from '../../types/db'
import Spinner from '../../components/Spinner'

export default function CmsPage({ slug }: { slug?: string }) {
  const params = useParams<{ slug: string }>()
  const resolvedSlug = slug ?? params.slug
  const [pagina, setPagina] = useState<Pagina | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!resolvedSlug) {
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('paginas')
      .select('*')
      .eq('slug', resolvedSlug)
      .maybeSingle()
      .then(({ data }) => {
        setPagina((data as Pagina) ?? null)
        setLoading(false)
      })
  }, [resolvedSlug])

  if (loading) return <Spinner label="Cargando…" />

  if (!pagina) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="card p-6 text-center text-zinc-600 dark:text-zinc-300">Página no encontrada.</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold text-zinc-900 dark:text-white">{pagina.titulo}</h1>

      {pagina.imagen_url && (
        <img
          src={pagina.imagen_url}
          alt={pagina.titulo}
          className="mb-6 w-full rounded-xl object-cover"
        />
      )}

      <div className="richtext" dangerouslySetInnerHTML={{ __html: pagina.contenido }} />

      {pagina.galeria?.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold text-zinc-900 dark:text-white">Galería</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {pagina.galeria.map((src, i) => (
              <img key={i} src={src} alt="" className="h-40 w-full rounded-lg object-cover" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

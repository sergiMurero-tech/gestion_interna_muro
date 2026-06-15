import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Pagina } from '../../types/db'
import Spinner from '../../components/Spinner'
import { pickLang, useLang } from '../../lib/i18n'

export default function CmsPage({ slug }: { slug?: string }) {
  const { lang, t } = useLang()
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

  if (loading) return <Spinner label={t('state.loading')} />

  if (!pagina) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="card p-8 text-center text-zinc-600 dark:text-zinc-300">{t('cms.not_found')}</div>
      </div>
    )
  }

  const titulo = pickLang(pagina, 'titulo', lang)
  const contenido = pickLang(pagina, 'contenido', lang)

  return (
    <article>
      <header className="relative isolate overflow-hidden bg-black text-white">
        {pagina.imagen_url ? (
          <>
            <img src={pagina.imagen_url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
          </>
        ) : (
          <div className="absolute inset-0 bg-stripes-gold opacity-15" />
        )}
        <div className="relative mx-auto max-w-3xl px-4 py-16">
          <span className="eyebrow">{t('cms.eyebrow')}</span>
          <h1 className="h-display text-shadow text-5xl text-white sm:text-6xl">{titulo}</h1>
        </div>
        <div className="diagonal-divider" />
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12">
        {pagina.imagen_url && (
          <div className="mb-8 flex justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
            <img src={pagina.imagen_url} alt={titulo} className="max-h-[60vh] w-auto rounded-2xl object-contain" />
          </div>
        )}
        <div className="richtext" dangerouslySetInnerHTML={{ __html: contenido }} />

        {pagina.galeria?.length > 0 && (
          <section className="mt-10">
            <span className="eyebrow">{t('noticias.galeria_eyebrow')}</span>
            <h2 className="section-title mb-5 text-3xl">{t('noticias.imagenes')}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {pagina.galeria.map((src, i) => (
                <img key={i} src={src} alt="" className="aspect-square w-full rounded-xl object-cover" />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}

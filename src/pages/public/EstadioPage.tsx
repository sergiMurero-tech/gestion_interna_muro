import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { EstadioInfo } from '../../types/db'
import Spinner from '../../components/Spinner'
import { useLang } from '../../lib/i18n'

export default function EstadioPage() {
  const { t } = useLang()
  const [estadio, setEstadio] = useState<EstadioInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('site_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        setEstadio((data?.estadio as EstadioInfo) ?? null)
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label={t('state.loading')} />

  const e = estadio ?? {}
  const cover = e.fotos?.[0]
  const restoFotos = (e.fotos ?? []).slice(1)
  const vacio = !e.direccion && !e.info && (!e.fotos || e.fotos.length === 0)

  if (vacio) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="card p-8 text-center text-zinc-500 dark:text-zinc-400">
          {t('estadio.empty')}
        </div>
      </div>
    )
  }

  return (
    <article>
      <header className="relative isolate overflow-hidden bg-black text-white">
        {cover ? (
          <img src={cover} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-50" />
        ) : (
          <div className="absolute inset-0 bg-stripes-gold opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
        <div className="relative mx-auto max-w-6xl px-4 py-20">
          <span className="eyebrow">{t('estadio.eyebrow')}</span>
          <h1 className="h-display text-shadow text-5xl text-white sm:text-7xl">{e.nombre || t('estadio.default_title')}</h1>
          {e.direccion && <p className="mt-3 text-lg text-zinc-200">{e.direccion}</p>}
        </div>
        <div className="diagonal-divider" />
      </header>

      <div className="mx-auto max-w-3xl px-4 py-12">
        {e.info && <div className="richtext" dangerouslySetInnerHTML={{ __html: e.info }} />}
      </div>

      {restoFotos.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <span className="eyebrow">{t('estadio.galeria_eyebrow')}</span>
          <h2 className="section-title mb-6 text-3xl">{t('estadio.galeria_title')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {restoFotos.map((src, i) => (
              <img key={i} src={src} alt="" className="aspect-[4/3] w-full rounded-xl object-cover transition hover:opacity-90" />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

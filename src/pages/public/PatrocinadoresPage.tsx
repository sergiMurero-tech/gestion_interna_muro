import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Patrocinador } from '../../types/db'
import Spinner from '../../components/Spinner'
import { useLang } from '../../lib/i18n'

export default function PatrocinadoresPage() {
  const { t } = useLang()
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('patrocinadores')
      .select('*')
      .eq('visible', true)
      .order('orden')
      .then(({ data }) => {
        setPatrocinadores((data as Patrocinador[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label={t('state.loading')} />

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <span className="eyebrow">{t('patroc.eyebrow')}</span>
      <h1 className="section-title mb-10">
        {t('patroc.title.before')}<span className="text-gold">{t('patroc.title.after')}</span>
      </h1>

      {patrocinadores.length === 0 ? (
        <div className="card p-8 text-center text-zinc-500 dark:text-zinc-400">{t('patroc.empty')}</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {patrocinadores.map((p, i) => {
            const inner = p.logo_url ? (
              <img src={p.logo_url} alt={p.nombre} className="h-24 w-full object-contain" />
            ) : (
              <span className="flex h-24 items-center justify-center text-center text-sm font-semibold text-zinc-700">
                {p.nombre}
              </span>
            )
            const cls =
              'group relative block animate-fade-up overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-gold hover:shadow-glow dark:border-zinc-800'
            const style = { animationDelay: `${i * 50}ms` }
            return p.enlace ? (
              <a key={p.id} href={p.enlace} target="_blank" rel="noreferrer" title={p.nombre} className={cls} style={style}>
                {inner}
                <span className="mt-3 block text-center text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-gold">
                  {t('patroc.visit')}
                </span>
              </a>
            ) : (
              <div key={p.id} title={p.nombre} className={cls} style={style}>
                {inner}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

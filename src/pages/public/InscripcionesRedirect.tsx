import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/Spinner'
import { useLang } from '../../lib/i18n'

export default function InscripcionesRedirect() {
  const { t } = useLang()
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('site_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        const target = typeof data?.inscripciones_url === 'string' ? data.inscripciones_url.trim() : ''
        if (target) {
          setUrl(target)
          window.location.replace(target)
        }
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label={t('state.loading')} />

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      {url ? (
        <div className="card animate-pulse-gold flex flex-col items-center gap-4 p-10 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <p className="text-zinc-600 dark:text-zinc-300">{t('insc.redirigiendo')}</p>
          <a href={url} className="btn-primary px-6 py-3 text-base">
            {t('insc.continuar')}
          </a>
        </div>
      ) : (
        <div className="card p-10 text-center text-zinc-500 dark:text-zinc-400">
          {t('insc.no_disponible')}
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { ContactoInfo } from '../../types/db'
import Spinner from '../../components/Spinner'
import SocialLinks from '../../components/public/SocialLinks'
import { useLang } from '../../lib/i18n'

const REDES: { key: keyof NonNullable<ContactoInfo['redes']>; label: string }[] = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'x', label: 'X' },
  { key: 'youtube', label: 'YouTube' },
]

/** Solo las URL de "embed" de los mapas se pueden mostrar dentro de un iframe. */
function isEmbeddable(url: string): boolean {
  return /\/maps\/embed|\/embed\?|google\.com\/maps\/embed|output=embed/.test(url)
}

export default function ContactoPage() {
  const { t } = useLang()
  const [contacto, setContacto] = useState<ContactoInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('site_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        setContacto((data?.contacto as ContactoInfo) ?? null)
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label={t('state.loading')} />

  const c = contacto ?? {}
  const redes = c.redes ?? {}
  const mapa = c.mapa_embed?.trim()

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <span className="eyebrow">{t('contacto.eyebrow')}</span>
      <h1 className="section-title mb-10">
        {t('contacto.title.before')}<span className="text-gold">{t('contacto.title.after')}</span>
      </h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          {c.direccion && (
            <InfoRow
              label={t('contacto.label_direccion')}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              }
            >
              {c.direccion}
            </InfoRow>
          )}
          {c.telefono && (
            <InfoRow
              label={t('contacto.label_telefono')}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92V21a1 1 0 0 1-1.1 1 19.7 19.7 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.7 19.7 0 0 1 3 4.1 1 1 0 0 1 4 3h4.1a1 1 0 0 1 1 .8 11.9 11.9 0 0 0 .6 2.6 1 1 0 0 1-.2 1L8 8.9a16 16 0 0 0 6 6l1.5-1.5a1 1 0 0 1 1-.2 11.9 11.9 0 0 0 2.6.6 1 1 0 0 1 .9 1z" />
                </svg>
              }
            >
              <a href={`tel:${c.telefono}`} className="hover:text-gold">
                {c.telefono}
              </a>
            </InfoRow>
          )}
          {c.email && (
            <InfoRow
              label={t('contacto.label_email')}
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
            >
              <a href={`mailto:${c.email}`} className="hover:text-gold">
                {c.email}
              </a>
            </InfoRow>
          )}
          {REDES.some((r) => redes[r.key]) && (
            <div className="card p-5">
              <span className="eyebrow">{t('contacto.label_redes')}</span>
              <SocialLinks redes={redes} className="mt-2 text-zinc-700 dark:text-zinc-200" />
            </div>
          )}
          {!c.direccion && !c.telefono && !c.email && !REDES.some((r) => redes[r.key]) && (
            <p className="card p-6 text-center text-zinc-500 dark:text-zinc-400">{t('contacto.empty')}</p>
          )}
        </div>

        {mapa && (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            {mapa.startsWith('<') ? (
              <div className="aspect-video w-full [&>iframe]:h-full [&>iframe]:w-full" dangerouslySetInnerHTML={{ __html: mapa }} />
            ) : isEmbeddable(mapa) ? (
              <iframe src={mapa} title="Mapa" className="h-80 w-full" loading="lazy" />
            ) : (
              <a href={mapa} target="_blank" rel="noreferrer" className="btn-secondary m-4">
                {t('contacto.mapa_link')}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="card flex items-start gap-4 p-5">
      <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-gold/10 text-gold">
        <span className="block h-5 w-5">{icon}</span>
      </span>
      <div>
        <div className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">{label}</div>
        <div className="text-zinc-900 dark:text-white">{children}</div>
      </div>
    </div>
  )
}

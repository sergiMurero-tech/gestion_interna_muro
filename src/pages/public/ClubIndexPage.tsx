import { Link } from 'react-router-dom'
import { useLang } from '../../lib/i18n'

export default function ClubIndexPage() {
  const { t } = useLang()

  const SECCIONES = [
    {
      label: t('club.historia.label'),
      desc: t('club.historia.desc'),
      to: '/club/historia',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v5l3 2" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      ),
    },
    {
      label: t('club.directiva.label'),
      desc: t('club.directiva.desc'),
      to: '/club/directiva',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M17 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: t('club.estadio.label'),
      desc: t('club.estadio.desc'),
      to: '/club/estadio',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-6 9 6" />
          <path d="M5 9v11h14V9" />
          <path d="M9 20v-6h6v6" />
        </svg>
      ),
    },
    {
      label: t('club.patrocinadores.label'),
      desc: t('club.patrocinadores.desc'),
      to: '/club/patrocinadores',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
    {
      label: t('club.contacto.label'),
      desc: t('club.contacto.desc'),
      to: '/club/contacto',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92V21a1 1 0 0 1-1.1 1 19.7 19.7 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.7 19.7 0 0 1 3 4.1 1 1 0 0 1 4 3h4.1a1 1 0 0 1 1 .8 11.9 11.9 0 0 0 .6 2.6 1 1 0 0 1-.2 1L8 8.9a16 16 0 0 0 6 6l1.5-1.5a1 1 0 0 1 1-.2 11.9 11.9 0 0 0 2.6.6 1 1 0 0 1 .9 1z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <span className="eyebrow">{t('club.eyebrow')}</span>
      <h1 className="section-title mb-10">
        {t('club.title.before')} <span className="text-gold">{t('club.title.after')}</span>
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECCIONES.map((s, i) => (
          <Link
            key={s.to}
            to={s.to}
            style={{ animationDelay: `${i * 60}ms` }}
            className="card-hover group flex animate-fade-up items-start gap-4 p-6"
          >
            <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-gold/10 text-gold transition group-hover:bg-gold group-hover:text-black">
              <span className="block h-6 w-6">{s.icon}</span>
            </span>
            <div>
              <div className="h-display text-xl text-zinc-900 dark:text-white">{s.label}</div>
              <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{s.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

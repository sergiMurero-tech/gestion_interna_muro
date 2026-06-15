import { Link } from 'react-router-dom'
import { useLang } from '../../../lib/i18n'

export default function WebIndexPage() {
  const { t } = useLang()
  const SECCIONES = [
    { to: '/gestion/web/noticias', label: t('admin.web.noticias'), desc: t('admin.web.noticias_desc') },
    { to: '/gestion/web/paginas', label: t('admin.web.paginas'), desc: t('admin.web.paginas_desc') },
    { to: '/gestion/web/directiva', label: t('admin.web.directiva'), desc: t('admin.web.directiva_desc') },
    { to: '/gestion/web/patrocinadores', label: t('admin.web.patrocinadores'), desc: t('admin.web.patrocinadores_desc') },
    { to: '/gestion/web/menu', label: t('admin.web.menu'), desc: t('admin.web.menu_desc') },
    { to: '/gestion/web/config', label: t('admin.web.config'), desc: t('admin.web.config_desc') },
  ]

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">{t('admin.web.title')}</h1>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">{t('admin.web.subtitle')}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECCIONES.map((s) => (
          <Link key={s.to} to={s.to} className="card p-4 transition hover:border-gold">
            <div className="text-lg font-semibold text-gold">{s.label}</div>
            <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{s.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

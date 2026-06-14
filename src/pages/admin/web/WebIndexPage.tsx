import { Link } from 'react-router-dom'

const SECCIONES = [
  { to: '/gestion/web/noticias', label: 'Noticias', desc: 'Crear, editar, publicar y destacar noticias.' },
  { to: '/gestion/web/paginas', label: 'Páginas', desc: 'Historia y páginas informativas editables.' },
  { to: '/gestion/web/directiva', label: 'Directiva', desc: 'Cargos y miembros de la directiva.' },
  { to: '/gestion/web/patrocinadores', label: 'Patrocinadores', desc: 'Logos, enlaces y orden.' },
  { to: '/gestion/web/menu', label: 'Menú', desc: 'Apartados y subapartados del menú público.' },
  { to: '/gestion/web/config', label: 'Configuración', desc: 'Inscripciones, contacto y estadio.' },
]

export default function WebIndexPage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Gestión Web</h1>
      <p className="mb-4 text-sm text-zinc-400">Administra el contenido de la web pública del club.</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SECCIONES.map((s) => (
          <Link key={s.to} to={s.to} className="card p-4 transition hover:border-gold">
            <div className="text-lg font-semibold text-gold">{s.label}</div>
            <div className="mt-1 text-sm text-zinc-400">{s.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'

const SECCIONES = [
  { label: 'Historia', to: '/club/historia' },
  { label: 'Directiva', to: '/club/directiva' },
  { label: 'Estadio', to: '/club/estadio' },
  { label: 'Patrocinadores', to: '/club/patrocinadores' },
  { label: 'Contacto', to: '/club/contacto' },
]

export default function ClubIndexPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold text-zinc-900 dark:text-white">
        El <span className="text-gold">Club</span>
      </h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {SECCIONES.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="card flex items-center justify-center border-gold/40 p-8 text-center text-lg font-bold text-gold transition hover:border-gold hover:shadow-md"
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

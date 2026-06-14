import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Equipo } from '../../types/db'
import Spinner from '../../components/Spinner'

export default function AreaDeportivaPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('equipos')
      .select('*')
      .eq('activo', true)
      .order('nombre')
      .then(({ data }) => {
        setEquipos((data as Equipo[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label="Cargando equipos…" />

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold text-zinc-900 dark:text-white">
        Área <span className="text-gold">Deportiva</span>
      </h1>
      {equipos.length === 0 ? (
        <div className="card p-6 text-center text-zinc-500 dark:text-zinc-400">No hay equipos disponibles.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {equipos.map((e) => (
            <Link
              key={e.id}
              to={`/area-deportiva/${e.id}`}
              className="card group overflow-hidden p-0 transition hover:border-gold hover:shadow-md"
            >
              {e.foto_url ? (
                <img src={e.foto_url} alt={e.nombre} className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  <img src="/club-crest.png" alt="" className="h-16 w-16 opacity-30" />
                </div>
              )}
              <div className="p-4">
                <h2 className="font-bold text-zinc-900 dark:text-white">{e.nombre}</h2>
                <p className="text-sm text-gold">{e.categoria}</p>
                <p className="text-xs text-zinc-500">{e.temporada}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

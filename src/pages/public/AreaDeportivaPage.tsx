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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <span className="eyebrow">El club en juego</span>
      <h1 className="section-title mb-10">
        Área <span className="text-gold">Deportiva</span>
      </h1>

      {equipos.length === 0 ? (
        <div className="card p-8 text-center text-zinc-500 dark:text-zinc-400">No hay equipos disponibles.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {equipos.map((e, i) => (
            <Link
              key={e.id}
              to={`/area-deportiva/${e.id}`}
              style={{ animationDelay: `${i * 50}ms` }}
              className="card-hover group animate-fade-up overflow-hidden p-0"
            >
              <div className="relative h-48 overflow-hidden">
                {e.foto_url ? (
                  <img
                    src={e.foto_url}
                    alt={e.nombre}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                    <img src="/club-crest.png" alt="" className="h-20 w-20 opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h2 className="h-display text-2xl text-shadow">{e.nombre}</h2>
                  <p className="text-xs uppercase tracking-widest text-gold">{e.categoria}</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Temporada {e.temporada || '—'}</span>
                <span className="text-sm font-semibold text-gold opacity-0 transition group-hover:opacity-100">Ver equipo →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

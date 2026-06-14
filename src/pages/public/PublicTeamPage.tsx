import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Equipo, Jugador, CuerpoTecnico } from '../../types/db'
import Spinner from '../../components/Spinner'

export default function PublicTeamPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const [equipo, setEquipo] = useState<Equipo | null>(null)
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [tecnicos, setTecnicos] = useState<CuerpoTecnico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!teamId) {
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      supabase.from('equipos').select('*').eq('id', teamId).maybeSingle(),
      supabase
        .from('jugadores')
        .select('*')
        .eq('equipo_id', teamId)
        .eq('activo', true)
        .order('nombre_completo'),
      supabase.from('cuerpo_tecnico').select('*').eq('equipo_id', teamId).order('orden'),
    ]).then(([eq, ju, ct]) => {
      setEquipo((eq.data as Equipo) ?? null)
      setJugadores((ju.data as Jugador[]) ?? [])
      setTecnicos((ct.data as CuerpoTecnico[]) ?? [])
      setLoading(false)
    })
  }, [teamId])

  if (loading) return <Spinner label="Cargando equipo…" />

  if (!equipo) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="card p-6 text-center text-zinc-600 dark:text-zinc-300">
          <p className="mb-4">Equipo no encontrado.</p>
          <Link to="/area-deportiva" className="btn-secondary inline-block">
            Volver al área deportiva
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/area-deportiva" className="mb-4 inline-block text-sm text-gold hover:underline">
        ← Volver al área deportiva
      </Link>

      <div className="card mb-10 overflow-hidden p-0">
        {equipo.foto_url ? (
          <img src={equipo.foto_url} alt={equipo.nombre} className="h-56 w-full object-cover sm:h-72" />
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800 sm:h-72">
            <img src="/club-crest.png" alt="" className="h-24 w-24 opacity-30" />
          </div>
        )}
        <div className="p-6">
          <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white">{equipo.nombre}</h1>
          <p className="mt-1 text-gold">
            {equipo.categoria}
            {equipo.temporada ? ` · ${equipo.temporada}` : ''}
          </p>
          {equipo.descripcion && (
            <p className="mt-3 whitespace-pre-line text-zinc-600 dark:text-zinc-300">{equipo.descripcion}</p>
          )}
        </div>
      </div>

      <section className="mb-10">
        <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Jugadores</h2>
        {jugadores.length === 0 ? (
          <p className="text-zinc-500">—</p>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {jugadores.map((j) => (
              <div key={j.id} className="card overflow-hidden p-0">
                <div className="relative">
                  {j.foto_url ? (
                    <img src={j.foto_url} alt={j.nombre_completo} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                      <img src="/club-crest.png" alt="" className="h-16 w-16 opacity-30" />
                    </div>
                  )}
                  {j.dorsal != null && (
                    <span className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gold text-sm font-bold text-zinc-950">
                      {j.dorsal}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-semibold text-zinc-900 dark:text-white">{j.nombre_completo}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-white">Cuerpo técnico</h2>
        {tecnicos.length === 0 ? (
          <p className="text-zinc-500">—</p>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {tecnicos.map((t) => (
              <div key={t.id} className="card overflow-hidden p-0">
                {t.foto_url ? (
                  <img src={t.foto_url} alt={t.nombre} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                    <img src="/club-crest.png" alt="" className="h-16 w-16 opacity-30" />
                  </div>
                )}
                <div className="p-3">
                  <p className="font-semibold text-zinc-900 dark:text-white">{t.nombre}</p>
                  <p className="text-sm text-gold">{t.cargo}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

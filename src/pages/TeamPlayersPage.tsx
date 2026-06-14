import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Equipo, Jugador } from '../types/db'
import Spinner from '../components/Spinner'
import LicenseBadge from '../components/LicenseBadge'

export default function TeamPlayersPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const [team, setTeam] = useState<Equipo | null>(null)
  const [players, setPlayers] = useState<Jugador[]>([])
  const [licensed, setLicensed] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!teamId) return
    setLoading(true)
    ;(async () => {
      const [{ data: t }, { data: js }] = await Promise.all([
        supabase.from('equipos').select('*').eq('id', teamId).maybeSingle(),
        supabase.from('jugadores').select('*').eq('equipo_id', teamId).eq('activo', true).order('nombre_completo'),
      ])
      setTeam(t ?? null)
      const list = js ?? []
      setPlayers(list)
      if (list.length) {
        const { data: lics } = await supabase
          .from('licencias')
          .select('jugador_id')
          .in('jugador_id', list.map((p) => p.id))
        setLicensed(new Set((lics ?? []).map((l) => l.jugador_id)))
      }
      setLoading(false)
    })()
  }, [teamId])

  if (loading) return <Spinner label="Cargando jugadores…" />

  return (
    <div>
      <Link to="/" className="mb-2 inline-block text-sm text-muro hover:underline">
        ← Equipos
      </Link>
      <h1 className="mb-1 text-2xl font-bold">{team?.nombre ?? 'Equipo'}</h1>
      <p className="mb-4 text-sm text-slate-500">
        {team?.categoria} · {team?.temporada}
      </p>

      {players.length === 0 ? (
        <div className="card p-6 text-center text-slate-500">Este equipo no tiene jugadores.</div>
      ) : (
        <div className="space-y-2">
          {players.map((p) => (
            <Link
              key={p.id}
              to={`/jugadores/${p.id}`}
              className="card flex items-center justify-between gap-3 p-4 transition hover:border-muro"
            >
              <span className="font-medium">{p.nombre_completo}</span>
              <LicenseBadge has={licensed.has(p.id)} />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

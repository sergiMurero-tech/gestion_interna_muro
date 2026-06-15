import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Equipo, Jugador } from '../types/db'
import Spinner from '../components/Spinner'
import LicenseBadge from '../components/LicenseBadge'
import { useLang } from '../lib/i18n'

export default function TeamPlayersPage() {
  const { t } = useLang()
  const { teamId } = useParams<{ teamId: string }>()
  const [team, setTeam] = useState<Equipo | null>(null)
  const [players, setPlayers] = useState<Jugador[]>([])
  const [licensed, setLicensed] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!teamId) return
    setLoading(true)
    ;(async () => {
      const [{ data: eq }, { data: js }] = await Promise.all([
        supabase.from('equipos').select('*').eq('id', teamId).maybeSingle(),
        supabase.from('jugadores').select('*').eq('equipo_id', teamId).eq('activo', true).order('nombre_completo'),
      ])
      setTeam(eq ?? null)
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

  if (loading) return <Spinner label={t('gestion.players.loading')} />

  return (
    <div>
      <Link to="/gestion" className="mb-2 inline-block text-sm text-gold hover:underline">
        {t('gestion.players.back')}
      </Link>
      <h1 className="mb-1 text-2xl font-bold">{team?.nombre ?? t('gestion.player.equipo')}</h1>
      <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
        {team?.categoria} · {team?.temporada}
      </p>

      {players.length === 0 ? (
        <div className="card p-6 text-center text-zinc-500 dark:text-zinc-400">{t('gestion.players.empty')}</div>
      ) : (
        <div className="space-y-2">
          {players.map((p) => (
            <Link
              key={p.id}
              to={`/gestion/jugadores/${p.id}`}
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

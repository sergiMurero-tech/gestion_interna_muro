import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Equipo } from '../types/db'
import Spinner from '../components/Spinner'
import { useLang } from '../lib/i18n'

export default function TeamsPage() {
  const { isAdmin } = useAuth()
  const { t } = useLang()
  const [teams, setTeams] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('equipos')
      .select('*')
      .eq('activo', true)
      .order('nombre')
      .then(({ data }) => {
        setTeams(data ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label={t('state.loading')} />

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{t('gestion.equipos.title')}</h1>
      {teams.length === 0 ? (
        <div className="card p-6 text-center text-zinc-500 dark:text-zinc-400">
          {isAdmin ? t('gestion.equipos.empty_admin') : t('gestion.equipos.empty_coach')}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {teams.map((t) => (
            <Link
              key={t.id}
              to={`/gestion/equipos/${t.id}`}
              className="card flex flex-col gap-1 p-4 transition hover:border-muro hover:shadow-md"
            >
              <span className="text-lg font-semibold">{t.nombre}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{t.categoria}</span>
              <span className="text-xs text-zinc-500">{t.temporada}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

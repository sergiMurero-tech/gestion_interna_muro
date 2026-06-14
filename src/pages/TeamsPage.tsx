import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Equipo } from '../types/db'
import Spinner from '../components/Spinner'

export default function TeamsPage() {
  const { isAdmin } = useAuth()
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

  if (loading) return <Spinner label="Cargando equipos…" />

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Equipos</h1>
      {teams.length === 0 ? (
        <div className="card p-6 text-center text-zinc-400">
          {isAdmin
            ? 'No hay equipos. Crea uno desde el panel de administración.'
            : 'Aún no tienes equipos asignados. Contacta con el administrador.'}
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
              <span className="text-xs text-zinc-400">{t.categoria}</span>
              <span className="text-xs text-zinc-500">{t.temporada}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

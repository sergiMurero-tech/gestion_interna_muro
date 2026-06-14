import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/Spinner'

interface Stats {
  equipos: number
  jugadores: number
  entrenadores: number
  licencias: number
  sinLicencia: number
}

interface RecentDoc {
  id: string
  fecha_generacion: string
  jugador: string
  equipo: string
  usuario: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<RecentDoc[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const count = (q: { count: number | null }) => q.count ?? 0

      const [equipos, jugadores, entrenadores, licencias, jugadoresActivos, licIds] = await Promise.all([
        supabase.from('equipos').select('*', { count: 'exact', head: true }),
        supabase.from('jugadores').select('*', { count: 'exact', head: true }).eq('activo', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('rol', 'entrenador'),
        supabase.from('licencias').select('*', { count: 'exact', head: true }),
        supabase.from('jugadores').select('id').eq('activo', true),
        supabase.from('licencias').select('jugador_id'),
      ])

      const licSet = new Set((licIds.data ?? []).map((l) => l.jugador_id))
      const sinLicencia = (jugadoresActivos.data ?? []).filter((p) => !licSet.has(p.id)).length

      setStats({
        equipos: count(equipos),
        jugadores: count(jugadores),
        entrenadores: count(entrenadores),
        licencias: count(licencias),
        sinLicencia,
      })

      const { data: docs } = await supabase
        .from('documentos_generados')
        .select('id, fecha_generacion, jugadores(nombre_completo), equipos(nombre), profiles(nombre, email)')
        .order('fecha_generacion', { ascending: false })
        .limit(8)

      setRecent(
        (docs ?? []).map((d: Record<string, unknown>) => ({
          id: d.id as string,
          fecha_generacion: d.fecha_generacion as string,
          jugador: (d.jugadores as { nombre_completo?: string } | null)?.nombre_completo ?? '—',
          equipo: (d.equipos as { nombre?: string } | null)?.nombre ?? '—',
          usuario:
            (d.profiles as { nombre?: string; email?: string } | null)?.nombre ||
            (d.profiles as { email?: string } | null)?.email ||
            '—',
        })),
      )
      setLoading(false)
    })()
  }, [])

  if (loading) return <Spinner label="Cargando panel…" />

  const cards = [
    { label: 'Equipos', value: stats?.equipos, to: '/admin/equipos' },
    { label: 'Jugadores', value: stats?.jugadores, to: '/admin/jugadores' },
    { label: 'Entrenadores', value: stats?.entrenadores, to: '/admin/entrenadores' },
    { label: 'Licencias subidas', value: stats?.licencias, to: '/admin/licencias' },
    { label: 'Jugadores sin licencia', value: stats?.sinLicencia, to: '/admin/licencias?filtro=sin', danger: true },
  ]

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Panel de administración</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            to={c.to}
            className={`card p-4 transition hover:shadow-md ${c.danger && (c.value ?? 0) > 0 ? 'border-red-500/40 bg-red-500/10' : ''}`}
          >
            <div className={`text-3xl font-black ${c.danger && (c.value ?? 0) > 0 ? 'text-red-400' : 'text-gold'}`}>
              {c.value ?? 0}
            </div>
            <div className="mt-1 text-sm text-zinc-300">{c.label}</div>
          </Link>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold">Últimos documentos generados</h2>
      <div className="card overflow-hidden">
        {recent.length === 0 ? (
          <p className="p-4 text-sm text-zinc-400">Todavía no se ha generado documentación.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-800/60 text-left text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Jugador</th>
                <th className="px-4 py-2">Equipo</th>
                <th className="px-4 py-2">Generado por</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((d) => (
                <tr key={d.id} className="border-t border-zinc-800">
                  <td className="whitespace-nowrap px-4 py-2">
                    {new Date(d.fecha_generacion).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-2">{d.jugador}</td>
                  <td className="px-4 py-2">{d.equipo}</td>
                  <td className="px-4 py-2">{d.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

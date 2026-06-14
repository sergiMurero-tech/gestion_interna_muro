import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/Spinner'

interface Row {
  id: string
  fecha_generacion: string
  tipo_documento: string
  jugador: string
  equipo: string
  usuario: string
}

export default function HistoryPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase
        .from('documentos_generados')
        .select('id, fecha_generacion, tipo_documento, jugadores(nombre_completo), equipos(nombre), profiles(nombre, email)')
        .order('fecha_generacion', { ascending: false })
        .limit(300)

      setRows(
        (data ?? []).map((d: Record<string, unknown>) => ({
          id: d.id as string,
          fecha_generacion: d.fecha_generacion as string,
          tipo_documento: d.tipo_documento as string,
          jugador: (d.jugadores as { nombre_completo?: string } | null)?.nombre_completo ?? '—',
          equipo: (d.equipos as { nombre?: string } | null)?.nombre ?? '—',
          usuario:
            (d.profiles as { nombre?: string } | null)?.nombre ||
            (d.profiles as { email?: string } | null)?.email ||
            '—',
        })),
      )
      setLoading(false)
    })()
  }, [])

  if (loading) return <Spinner label="Cargando historial…" />

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Historial de documentos</h1>
      <div className="card overflow-x-auto">
        {rows.length === 0 ? (
          <p className="p-4 text-sm text-zinc-400">No hay documentos generados.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-800/60 text-left text-xs uppercase text-zinc-400">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Tipo</th>
                <th className="px-4 py-2">Jugador</th>
                <th className="px-4 py-2">Equipo</th>
                <th className="px-4 py-2">Generado por</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-zinc-800">
                  <td className="whitespace-nowrap px-4 py-2">
                    {new Date(r.fecha_generacion).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-4 py-2">{r.tipo_documento === 'parte_lesion' ? 'Parte de lesión' : r.tipo_documento}</td>
                  <td className="px-4 py-2">{r.jugador}</td>
                  <td className="px-4 py-2">{r.equipo}</td>
                  <td className="px-4 py-2">{r.usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

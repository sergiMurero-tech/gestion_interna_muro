import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Patrocinador } from '../../types/db'
import Spinner from '../../components/Spinner'

export default function PatrocinadoresPage() {
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('patrocinadores')
      .select('*')
      .eq('visible', true)
      .order('orden')
      .then(({ data }) => {
        setPatrocinadores((data as Patrocinador[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label="Cargando patrocinadores…" />

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold text-zinc-900 dark:text-white">Patrocinadores</h1>
      {patrocinadores.length === 0 ? (
        <div className="card p-6 text-center text-zinc-500 dark:text-zinc-400">No hay patrocinadores.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {patrocinadores.map((p) => {
            const inner = p.logo_url ? (
              <img src={p.logo_url} alt={p.nombre} className="h-24 w-full object-contain" />
            ) : (
              <span className="flex h-24 items-center justify-center text-center text-sm font-semibold text-zinc-700">
                {p.nombre}
              </span>
            )
            return p.enlace ? (
              <a
                key={p.id}
                href={p.enlace}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg bg-white p-4 transition hover:opacity-90"
                title={p.nombre}
              >
                {inner}
              </a>
            ) : (
              <div key={p.id} className="rounded-lg bg-white p-4" title={p.nombre}>
                {inner}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

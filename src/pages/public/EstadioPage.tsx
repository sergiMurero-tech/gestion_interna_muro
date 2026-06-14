import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { EstadioInfo } from '../../types/db'
import Spinner from '../../components/Spinner'

export default function EstadioPage() {
  const [estadio, setEstadio] = useState<EstadioInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('site_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        setEstadio((data?.estadio as EstadioInfo) ?? null)
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label="Cargando…" />

  const e = estadio ?? {}

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold text-white">{e.nombre || 'Estadio'}</h1>

      {e.direccion && (
        <p className="mb-4 text-zinc-300">
          <span className="font-semibold text-gold">Dirección:</span> {e.direccion}
        </p>
      )}

      {e.info && <p className="mb-8 whitespace-pre-line text-zinc-300">{e.info}</p>}

      {e.fotos && e.fotos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {e.fotos.map((src, i) => (
            <img key={i} src={src} alt="" className="h-40 w-full rounded-lg object-cover" />
          ))}
        </div>
      )}

      {!e.direccion && !e.info && (!e.fotos || e.fotos.length === 0) && (
        <div className="card p-6 text-center text-zinc-400">
          No hay información del estadio disponible.
        </div>
      )}
    </div>
  )
}

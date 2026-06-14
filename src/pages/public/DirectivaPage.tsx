import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Directivo } from '../../types/db'
import Spinner from '../../components/Spinner'

export default function DirectivaPage() {
  const [directivos, setDirectivos] = useState<Directivo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('directiva')
      .select('*')
      .order('orden')
      .then(({ data }) => {
        setDirectivos((data as Directivo[]) ?? [])
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label="Cargando directiva…" />

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold text-zinc-900 dark:text-white">Directiva</h1>
      {directivos.length === 0 ? (
        <div className="card p-6 text-center text-zinc-500 dark:text-zinc-400">No hay miembros de la directiva.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {directivos.map((d) => (
            <div key={d.id} className="card overflow-hidden p-0">
              {d.foto_url ? (
                <img src={d.foto_url} alt={d.nombre} className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                  <img src="/club-crest.png" alt="" className="h-16 w-16 opacity-30" />
                </div>
              )}
              <div className="p-4">
                <h2 className="font-bold text-zinc-900 dark:text-white">{d.nombre}</h2>
                <p className="text-sm text-gold">{d.cargo}</p>
                {d.descripcion && <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{d.descripcion}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

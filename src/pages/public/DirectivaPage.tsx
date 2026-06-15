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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <span className="eyebrow">Equipo de gestión</span>
      <h1 className="section-title mb-10">
        Direc<span className="text-gold">tiva</span>
      </h1>

      {directivos.length === 0 ? (
        <div className="card p-8 text-center text-zinc-500 dark:text-zinc-400">No hay miembros de la directiva.</div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {directivos.map((d, i) => (
            <div
              key={d.id}
              style={{ animationDelay: `${i * 50}ms` }}
              className="card-hover group animate-fade-up overflow-hidden p-0"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {d.foto_url ? (
                  <img src={d.foto_url} alt={d.nombre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                    <img src="/club-crest.png" alt="" className="h-20 w-20 opacity-30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <span className="text-xs uppercase tracking-widest text-gold">{d.cargo}</span>
                  <h2 className="h-display text-2xl text-shadow">{d.nombre}</h2>
                </div>
              </div>
              {d.descripcion && (
                <div className="p-4">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{d.descripcion}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

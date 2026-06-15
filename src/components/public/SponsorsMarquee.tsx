import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Patrocinador } from '../../types/db'

/** Carrusel infinito de logos de patrocinadores (sin dependencias, CSS marquee). */
export default function SponsorsMarquee() {
  const [items, setItems] = useState<Patrocinador[]>([])

  useEffect(() => {
    supabase
      .from('patrocinadores')
      .select('*')
      .eq('visible', true)
      .order('orden')
      .then(({ data }) => setItems((data ?? []) as Patrocinador[]))
  }, [])

  if (items.length === 0) return null

  // Duplicamos la lista para que el bucle CSS sea continuo sin saltos.
  const loop = [...items, ...items]

  return (
    <div className="group relative overflow-hidden">
      <div className="marquee-track flex items-center gap-8 py-2 group-hover:[animation-play-state:paused]">
        {loop.map((p, i) => {
          const inner = p.logo_url ? (
            <img
              src={p.logo_url}
              alt={p.nombre}
              loading="lazy"
              className="h-12 max-w-[140px] object-contain opacity-90 brightness-0 invert transition group-hover:opacity-100"
            />
          ) : (
            <span className="whitespace-nowrap text-sm font-semibold text-zinc-300">{p.nombre}</span>
          )
          return p.enlace ? (
            <a key={i} href={p.enlace} target="_blank" rel="noreferrer" className="shrink-0">
              {inner}
            </a>
          ) : (
            <span key={i} className="shrink-0">
              {inner}
            </span>
          )
        })}
      </div>
    </div>
  )
}

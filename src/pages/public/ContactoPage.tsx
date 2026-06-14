import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { ContactoInfo } from '../../types/db'
import Spinner from '../../components/Spinner'

const REDES: { key: keyof NonNullable<ContactoInfo['redes']>; label: string }[] = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'x', label: 'X' },
  { key: 'youtube', label: 'YouTube' },
]

export default function ContactoPage() {
  const [contacto, setContacto] = useState<ContactoInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('site_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        setContacto((data?.contacto as ContactoInfo) ?? null)
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label="Cargando…" />

  const c = contacto ?? {}
  const redes = c.redes ?? {}
  const mapa = c.mapa_embed?.trim()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-extrabold text-zinc-900 dark:text-white">Contacto</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="card space-y-4 p-6">
          {c.direccion && (
            <p className="text-zinc-600 dark:text-zinc-300">
              <span className="block text-sm font-semibold text-gold">Dirección</span>
              {c.direccion}
            </p>
          )}
          {c.telefono && (
            <p className="text-zinc-600 dark:text-zinc-300">
              <span className="block text-sm font-semibold text-gold">Teléfono</span>
              <a href={`tel:${c.telefono}`} className="hover:underline">
                {c.telefono}
              </a>
            </p>
          )}
          {c.email && (
            <p className="text-zinc-600 dark:text-zinc-300">
              <span className="block text-sm font-semibold text-gold">Email</span>
              <a href={`mailto:${c.email}`} className="hover:underline">
                {c.email}
              </a>
            </p>
          )}

          {REDES.some((r) => redes[r.key]) && (
            <div>
              <span className="block text-sm font-semibold text-gold">Redes sociales</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {REDES.map((r) =>
                  redes[r.key] ? (
                    <a
                      key={r.key}
                      href={redes[r.key]}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary"
                    >
                      {r.label}
                    </a>
                  ) : null,
                )}
              </div>
            </div>
          )}

          {!c.direccion && !c.telefono && !c.email && !REDES.some((r) => redes[r.key]) && (
            <p className="text-zinc-500 dark:text-zinc-400">No hay información de contacto disponible.</p>
          )}
        </div>

        {mapa && (
          <div className="overflow-hidden rounded-lg">
            {mapa.startsWith('<') ? (
              <div
                className="aspect-video w-full [&>iframe]:h-full [&>iframe]:w-full"
                dangerouslySetInnerHTML={{ __html: mapa }}
              />
            ) : (
              <iframe
                src={mapa}
                title="Mapa"
                className="h-80 w-full rounded-lg"
                loading="lazy"
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Spinner from '../../components/Spinner'

export default function InscripcionesRedirect() {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('site_config')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => {
        const target = typeof data?.inscripciones_url === 'string' ? data.inscripciones_url.trim() : ''
        if (target) {
          setUrl(target)
          window.location.replace(target)
        }
        setLoading(false)
      })
  }, [])

  if (loading) return <Spinner label="Cargando…" />

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {url ? (
        <div className="card p-8 text-center text-zinc-300">
          <p className="mb-4">Redirigiendo a inscripciones…</p>
          <a href={url} className="btn-primary inline-block">
            Continuar a inscripciones
          </a>
        </div>
      ) : (
        <div className="card p-8 text-center text-zinc-400">
          Las inscripciones aún no están disponibles.
        </div>
      )}
    </div>
  )
}

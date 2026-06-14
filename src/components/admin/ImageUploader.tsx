import { useRef, useState } from 'react'
import { uploadMedia } from '../../lib/media'

interface Props {
  value: string | null
  onChange: (url: string | null) => void
  folder?: string
  label?: string
}

/** Subida de una sola imagen al bucket `media`; muestra vista previa. */
export default function ImageUploader({ value, onChange, folder = 'general', label = 'Imagen' }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File) {
    setBusy(true)
    setError(null)
    try {
      const url = await uploadMedia(file, folder)
      onChange(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al subir')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex items-center gap-3">
        {value ? (
          <img src={value} alt="" className="h-16 w-16 rounded-lg border border-zinc-300 dark:border-zinc-700 object-cover" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-xs text-zinc-500">
            sin
          </div>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ''
          }}
        />
        <button type="button" className="btn-secondary" disabled={busy} onClick={() => ref.current?.click()}>
          {busy ? 'Subiendo…' : value ? 'Cambiar' : 'Subir'}
        </button>
        {value && (
          <button type="button" className="btn-secondary" onClick={() => onChange(null)}>
            Quitar
          </button>
        )}
      </div>
      {error && <p className="alert-error mt-2">{error}</p>}
    </div>
  )
}

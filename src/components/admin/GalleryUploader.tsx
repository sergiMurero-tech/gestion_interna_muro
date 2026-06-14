import { useRef, useState } from 'react'
import { uploadMedia } from '../../lib/media'

interface Props {
  value: string[]
  onChange: (urls: string[]) => void
  folder?: string
  label?: string
}

/** Subida de varias imágenes (galería) al bucket `media`. */
export default function GalleryUploader({ value, onChange, folder = 'galeria', label = 'Galería' }: Props) {
  const ref = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  async function handleFiles(files: FileList) {
    setBusy(true)
    try {
      const urls: string[] = []
      for (const f of Array.from(files)) urls.push(await uploadMedia(f, folder))
      onChange([...value, ...urls])
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al subir')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <div className="flex flex-wrap gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="relative">
            <img src={url} alt="" className="h-20 w-20 rounded-lg border border-zinc-700 object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-red-600 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}
        <input
          ref={ref}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <button
          type="button"
          className="grid h-20 w-20 place-items-center rounded-lg border border-dashed border-zinc-700 text-xs text-zinc-400 hover:bg-white/5"
          disabled={busy}
          onClick={() => ref.current?.click()}
        >
          {busy ? '…' : '+ Añadir'}
        </button>
      </div>
    </div>
  )
}

import { supabase } from './supabase'

const MEDIA_BUCKET = 'media'

function safeName(name: string): string {
  const dot = name.lastIndexOf('.')
  const ext = dot >= 0 ? name.slice(dot).toLowerCase() : ''
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 50)
  const rand = Math.random().toString(36).slice(2, 8)
  return `${Date.now()}-${rand}-${base || 'file'}${ext}`
}

/** Sube un fichero al bucket público `media` y devuelve su URL pública. */
export async function uploadMedia(file: File, folder = 'general'): Promise<string> {
  const path = `${folder}/${safeName(file.name)}`
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || undefined })
  if (error) throw new Error('No se pudo subir el archivo: ' + error.message)
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)
  return data.publicUrl
}

/** Borra un fichero de `media` a partir de su URL pública (best-effort). */
export async function deleteMediaByUrl(url: string | null | undefined): Promise<void> {
  if (!url) return
  const marker = `/${MEDIA_BUCKET}/`
  const i = url.indexOf(marker)
  if (i < 0) return
  const path = decodeURIComponent(url.slice(i + marker.length))
  await supabase.storage.from(MEDIA_BUCKET).remove([path])
}

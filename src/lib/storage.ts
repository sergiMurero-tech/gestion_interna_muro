import { supabase, LICENCIAS_BUCKET } from './supabase'

/** Descarga el PDF de la licencia desde Storage como Blob (respeta los permisos RLS). */
export async function downloadLicenseBlob(path: string): Promise<Blob> {
  const { data, error } = await supabase.storage.from(LICENCIAS_BUCKET).download(path)
  if (error || !data) throw new Error('No se pudo descargar la licencia: ' + (error?.message ?? 'desconocido'))
  return data
}

/** Sube (o reemplaza) la licencia de un jugador. Devuelve la ruta dentro del bucket. */
export async function uploadLicense(jugadorId: string, file: File): Promise<string> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_')
  const path = `${jugadorId}/${safe}`
  const { error } = await supabase.storage
    .from(LICENCIAS_BUCKET)
    .upload(path, file, { upsert: true, contentType: 'application/pdf' })
  if (error) throw new Error('No se pudo subir la licencia: ' + error.message)
  return path
}

export async function removeLicenseFile(path: string): Promise<void> {
  await supabase.storage.from(LICENCIAS_BUCKET).remove([path])
}

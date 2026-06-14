// Utilidades para compartir/enviar los documentos desde el móvil.

export interface NamedFile {
  blob: Blob
  filename: string
}

export function supportsFileShare(files: File[]): boolean {
  return (
    typeof navigator !== 'undefined' &&
    !!navigator.canShare &&
    navigator.canShare({ files })
  )
}

function toFiles(items: NamedFile[]): File[] {
  return items.map((i) => new File([i.blob], i.filename, { type: i.blob.type || 'application/pdf' }))
}

/**
 * Comparte los ficheros usando la Web Share API (abre WhatsApp, correo, etc. con adjuntos).
 * Devuelve true si se compartió, false si el navegador no lo soporta.
 */
export async function shareFiles(items: NamedFile[], title: string, text: string): Promise<boolean> {
  const files = toFiles(items)
  if (!supportsFileShare(files)) return false
  try {
    await navigator.share({ files, title, text })
    return true
  } catch (err) {
    // El usuario canceló el diálogo: no es un error real.
    if (err instanceof DOMException && err.name === 'AbortError') return true
    return false
  }
}

export function whatsappUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function mailtoUrl(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

const TEMPLATE_URL = '/templates/parte-lesiones.pdf'

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

// Coordenadas medidas sobre la plantilla oficial (origen abajo-izquierda, página 595x842).
// Línea: "Parte fechado en ____ a __ de ____ del ____"  (baseline y≈723).
// El LUGAR ya viene pre-impreso por el club en la plantilla, así que solo se
// escriben día, mes y año.
const LINE_Y = 725
const POS = {
  dia: { x: 379, size: 9 },
  mes: { x: 410, size: 8.5 },
  anio: { x: 464, size: 9 },
}

let cachedTemplate: ArrayBuffer | null = null

export async function loadTemplateBytes(): Promise<ArrayBuffer> {
  if (cachedTemplate) return cachedTemplate.slice(0)
  const res = await fetch(TEMPLATE_URL)
  if (!res.ok) throw new Error('No se pudo cargar la plantilla del parte de lesiones.')
  cachedTemplate = await res.arrayBuffer()
  return cachedTemplate.slice(0)
}

/**
 * Rellena en la plantilla oficial únicamente la línea "Parte fechado en ...".
 * El resto del documento lo completan posteriormente padre/madre/tutor y el personal médico.
 */
export async function generateParteLesiones(fecha: Date): Promise<Uint8Array> {
  // Carga diferida: pdf-lib solo se descarga cuando se genera un documento.
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
  const templateBytes = await loadTemplateBytes()
  const pdf = await PDFDocument.load(templateBytes)
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const page = pdf.getPages()[0]
  const black = rgb(0, 0, 0)

  const dia = String(fecha.getDate())
  const mes = MESES[fecha.getMonth()]
  const anio = String(fecha.getFullYear())

  page.drawText(dia, { x: POS.dia.x, y: LINE_Y, size: POS.dia.size, font, color: black })
  page.drawText(mes, { x: POS.mes.x, y: LINE_Y, size: POS.mes.size, font, color: black })
  page.drawText(anio, { x: POS.anio.x, y: LINE_Y, size: POS.anio.size, font, color: black })

  return pdf.save()
}

export function bytesToBlob(bytes: Uint8Array, type = 'application/pdf'): Blob {
  // Copia a un Uint8Array con ArrayBuffer propio para satisfacer el tipo BlobPart.
  return new Blob([new Uint8Array(bytes)], { type })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase()
}

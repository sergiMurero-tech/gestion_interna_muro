import { useEffect, useRef } from 'react'

interface Props {
  value: string
  onChange: (html: string) => void
  label?: string
  minHeight?: number
}

interface ToolBtn {
  label: string
  title: string
  run: () => void
}

/**
 * Editor WYSIWYG ligero basado en contentEditable (sin dependencias).
 * Produce HTML compatible con el render `.richtext`.
 */
export default function RichTextEditor({ value, onChange, label, minHeight = 180 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  // Sincroniza el HTML externo en el editor sin romper el cursor: solo cuando
  // el contenido difiere del DOM (p. ej. al cargar un registro existente).
  useEffect(() => {
    const el = ref.current
    if (el && el.innerHTML !== value) el.innerHTML = value || ''
  }, [value])

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML)
  }

  function cmd(command: string, arg?: string) {
    ref.current?.focus()
    document.execCommand(command, false, arg)
    emit()
  }

  function addLink() {
    const url = prompt('URL del enlace (incluye https://):', 'https://')
    if (!url) return
    cmd('createLink', url)
    // Abrir en pestaña nueva.
    const sel = document.getSelection()
    const node = sel?.anchorNode?.parentElement
    if (node && node.tagName === 'A') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noreferrer')
    }
    emit()
  }

  const buttons: ToolBtn[] = [
    { label: 'B', title: 'Negrita', run: () => cmd('bold') },
    { label: 'I', title: 'Cursiva', run: () => cmd('italic') },
    { label: 'U', title: 'Subrayado', run: () => cmd('underline') },
    { label: 'H2', title: 'Título', run: () => cmd('formatBlock', 'H2') },
    { label: 'H3', title: 'Subtítulo', run: () => cmd('formatBlock', 'H3') },
    { label: '¶', title: 'Párrafo', run: () => cmd('formatBlock', 'P') },
    { label: '• Lista', title: 'Lista con viñetas', run: () => cmd('insertUnorderedList') },
    { label: '1. Lista', title: 'Lista numerada', run: () => cmd('insertOrderedList') },
    { label: '🔗', title: 'Insertar enlace', run: addLink },
    { label: '⏎', title: 'Cita', run: () => cmd('formatBlock', 'BLOCKQUOTE') },
    { label: 'Tx', title: 'Quitar formato', run: () => cmd('removeFormat') },
  ]

  return (
    <div>
      {label && <span className="label">{label}</span>}
      <div className="overflow-hidden rounded-lg border border-zinc-300 dark:border-zinc-700">
        <div className="flex flex-wrap gap-1 border-b border-zinc-300 bg-zinc-100 p-1.5 dark:border-zinc-700 dark:bg-zinc-800">
          {buttons.map((b) => (
            <button
              key={b.label}
              type="button"
              title={b.title}
              onMouseDown={(e) => e.preventDefault()}
              onClick={b.run}
              className="rounded px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-700"
            >
              {b.label}
            </button>
          ))}
        </div>
        <div
          ref={ref}
          contentEditable
          onInput={emit}
          onBlur={emit}
          className="richtext bg-white px-3 py-2 text-sm outline-none dark:bg-zinc-900"
          style={{ minHeight }}
          suppressContentEditableWarning
        />
      </div>
      <p className="mt-1 text-xs text-zinc-500">Usa la barra para dar formato: negrita, enlaces, listas…</p>
    </div>
  )
}

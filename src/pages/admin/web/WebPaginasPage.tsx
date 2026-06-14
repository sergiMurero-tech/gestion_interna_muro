import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Pagina } from '../../../types/db'
import Spinner from '../../../components/Spinner'
import Modal from '../../../components/Modal'
import ImageUploader from '../../../components/admin/ImageUploader'
import GalleryUploader from '../../../components/admin/GalleryUploader'
import RichTextEditor from '../../../components/admin/RichTextEditor'

function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface FormState {
  titulo: string
  slug: string
  contenido: string
  imagen_url: string | null
  galeria: string[]
  publicada: boolean
  orden: number
}

const empty: FormState = {
  titulo: '',
  slug: '',
  contenido: '',
  imagen_url: null,
  galeria: [],
  publicada: false,
  orden: 0,
}

export default function WebPaginasPage() {
  const [items, setItems] = useState<Pagina[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const { data } = await supabase
      .from('paginas')
      .select('*')
      .order('orden', { ascending: true })
      .order('titulo', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openNew() {
    setEditId(null)
    setForm(empty)
    setError(null)
    setOpen(true)
  }

  function openEdit(p: Pagina) {
    setEditId(p.id)
    setForm({
      titulo: p.titulo,
      slug: p.slug,
      contenido: p.contenido ?? '',
      imagen_url: p.imagen_url,
      galeria: p.galeria ?? [],
      publicada: p.publicada,
      orden: p.orden ?? 0,
    })
    setError(null)
    setOpen(true)
  }

  async function save() {
    setError(null)
    if (!form.titulo.trim()) {
      setError('Indica el título.')
      return
    }
    setSaving(true)
    const payload = {
      titulo: form.titulo.trim(),
      slug: form.slug.trim() || slugify(form.titulo),
      contenido: form.contenido,
      imagen_url: form.imagen_url,
      galeria: form.galeria,
      publicada: form.publicada,
      orden: form.orden,
    }
    let err
    if (editId) {
      ;({ error: err } = await supabase.from('paginas').update(payload).eq('id', editId))
    } else {
      ;({ error: err } = await supabase.from('paginas').insert(payload))
    }
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setOpen(false)
    setLoading(true)
    await load()
  }

  async function remove(p: Pagina) {
    if (!confirm(`¿Eliminar la página "${p.titulo}"?`)) return
    const { error: err } = await supabase.from('paginas').delete().eq('id', p.id)
    if (err) return alert(err.message)
    load()
  }

  if (loading) return <Spinner label="Cargando páginas…" />

  const currentSlug = (form.slug.trim() || slugify(form.titulo)).trim()

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Páginas</h1>
        <button className="btn-primary" onClick={openNew}>
          + Nueva
        </button>
      </div>

      <div className="card divide-y divide-zinc-200 dark:divide-zinc-800">
        {items.length === 0 && <p className="p-4 text-sm text-zinc-500 dark:text-zinc-400">No hay páginas.</p>}
        {items.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-medium">{p.titulo}</span>
                {p.publicada ? (
                  <span className="rounded-full bg-green-600/20 px-2 py-0.5 text-xs text-green-400">Publicada</span>
                ) : (
                  <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-500 dark:text-zinc-400">Borrador</span>
                )}
              </div>
              <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                /{p.slug} · orden {p.orden}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" onClick={() => openEdit(p)}>
                Editar
              </button>
              <button className="btn-danger" onClick={() => remove(p)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        title={editId ? 'Editar página' : 'Nueva página'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">Título</label>
            <input
              className="input"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Slug</label>
            <input
              className="input"
              placeholder="se genera del título si lo dejas vacío"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            {currentSlug === 'historia' && (
              <p className="mt-1 alert-info">Esta es la página de Club → Historia. Puedes editarla con normalidad.</p>
            )}
          </div>
          <RichTextEditor
            label="Contenido"
            value={form.contenido}
            onChange={(html) => setForm({ ...form, contenido: html })}
          />
          <ImageUploader
            value={form.imagen_url}
            onChange={(url) => setForm({ ...form, imagen_url: url })}
            folder="paginas"
            label="Imagen principal"
          />
          <GalleryUploader
            value={form.galeria}
            onChange={(urls) => setForm({ ...form, galeria: urls })}
            folder="paginas"
            label="Galería"
          />
          <div>
            <label className="label">Orden</label>
            <input
              type="number"
              className="input"
              value={form.orden}
              onChange={(e) => setForm({ ...form, orden: Number(e.target.value) })}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.publicada}
              onChange={(e) => setForm({ ...form, publicada: e.target.checked })}
            />
            <span className="text-sm">Publicada</span>
          </label>
          {error && <p className="alert-error">{error}</p>}
        </div>
      </Modal>
    </div>
  )
}

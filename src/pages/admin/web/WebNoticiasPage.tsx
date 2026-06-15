import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { uploadMedia } from '../../../lib/media'
import type { Noticia, Adjunto } from '../../../types/db'
import Spinner from '../../../components/Spinner'
import Modal from '../../../components/Modal'
import ImageUploader from '../../../components/admin/ImageUploader'
import GalleryUploader from '../../../components/admin/GalleryUploader'
import RichTextEditor from '../../../components/admin/RichTextEditor'
import { useLang } from '../../../lib/i18n'

function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Convierte una fecha ISO a valor de input datetime-local. */
function isoToLocal(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function localToIso(local: string): string {
  if (!local) return new Date().toISOString()
  const d = new Date(local)
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
}

interface FormState {
  titulo: string
  titulo_va: string
  slug: string
  resumen: string
  resumen_va: string
  contenido: string
  contenido_va: string
  imagen_url: string | null
  galeria: string[]
  adjuntos: Adjunto[]
  fecha_local: string
  destacada: boolean
  publicada: boolean
}

const empty: FormState = {
  titulo: '',
  titulo_va: '',
  slug: '',
  resumen: '',
  resumen_va: '',
  contenido: '',
  contenido_va: '',
  imagen_url: null,
  galeria: [],
  adjuntos: [],
  fecha_local: '',
  destacada: false,
  publicada: false,
}

export default function WebNoticiasPage() {
  const { t } = useLang()
  const { profile } = useAuth()
  const [items, setItems] = useState<Noticia[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingAdj, setUploadingAdj] = useState(false)

  async function load() {
    const { data } = await supabase
      .from('noticias')
      .select('*')
      .order('fecha_publicacion', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openNew() {
    setEditId(null)
    setForm({ ...empty, fecha_local: isoToLocal(new Date().toISOString()) })
    setError(null)
    setOpen(true)
  }

  function openEdit(n: Noticia) {
    setEditId(n.id)
    setForm({
      titulo: n.titulo,
      titulo_va: n.titulo_va ?? '',
      slug: n.slug,
      resumen: n.resumen ?? '',
      resumen_va: n.resumen_va ?? '',
      contenido: n.contenido ?? '',
      contenido_va: n.contenido_va ?? '',
      imagen_url: n.imagen_url,
      galeria: n.galeria ?? [],
      adjuntos: n.adjuntos ?? [],
      fecha_local: isoToLocal(n.fecha_publicacion),
      destacada: n.destacada,
      publicada: n.publicada,
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
    const payload: Record<string, unknown> = {
      titulo: form.titulo.trim(),
      titulo_va: form.titulo_va.trim() || null,
      slug: form.slug.trim() || slugify(form.titulo),
      resumen: form.resumen,
      resumen_va: form.resumen_va.trim() || null,
      contenido: form.contenido,
      contenido_va: form.contenido_va.trim() || null,
      imagen_url: form.imagen_url,
      galeria: form.galeria,
      adjuntos: form.adjuntos,
      fecha_publicacion: localToIso(form.fecha_local),
      destacada: form.destacada,
      publicada: form.publicada,
    }
    let err
    if (editId) {
      ;({ error: err } = await supabase.from('noticias').update(payload).eq('id', editId))
    } else {
      payload.autor_id = profile?.id ?? null
      ;({ error: err } = await supabase.from('noticias').insert(payload))
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

  async function remove(n: Noticia) {
    if (!confirm(`¿Eliminar la noticia "${n.titulo}"?`)) return
    const { error: err } = await supabase.from('noticias').delete().eq('id', n.id)
    if (err) return alert(err.message)
    load()
  }

  async function toggle(n: Noticia, field: 'publicada' | 'destacada') {
    const { error: err } = await supabase
      .from('noticias')
      .update({ [field]: !n[field] })
      .eq('id', n.id)
    if (err) return alert(err.message)
    load()
  }

  async function addAdjunto(file: File) {
    setUploadingAdj(true)
    try {
      const url = await uploadMedia(file, 'adjuntos')
      setForm((f) => ({ ...f, adjuntos: [...f.adjuntos, { nombre: file.name, url }] }))
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al subir')
    } finally {
      setUploadingAdj(false)
    }
  }

  if (loading) return <Spinner label="Cargando noticias…" />

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Noticias</h1>
        <button className="btn-primary" onClick={openNew}>
          {t('action.nueva')}
        </button>
      </div>

      <div className="card divide-y divide-zinc-200 dark:divide-zinc-800">
        {items.length === 0 && <p className="p-4 text-sm text-zinc-500 dark:text-zinc-400">{t('admin.noticias.empty')}</p>}
        {items.map((n) => (
          <div key={n.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="truncate font-medium">{n.titulo}</span>
                {n.destacada && (
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs text-gold">Destacada</span>
                )}
                {n.publicada ? (
                  <span className="rounded-full bg-green-600/20 px-2 py-0.5 text-xs text-green-400">Publicada</span>
                ) : (
                  <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-500 dark:text-zinc-400">Borrador</span>
                )}
              </div>
              <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                {new Date(n.fecha_publicacion).toLocaleString('es-ES')}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" onClick={() => toggle(n, 'publicada')}>
                {n.publicada ? 'Despublicar' : 'Publicar'}
              </button>
              <button className="btn-secondary" onClick={() => toggle(n, 'destacada')}>
                {n.destacada ? 'Quitar destacada' : 'Destacar'}
              </button>
              <button className="btn-secondary" onClick={() => openEdit(n)}>
                {t('action.editar')}
              </button>
              <button className="btn-danger" onClick={() => remove(n)}>
                {t('action.eliminar')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        title={editId ? t('admin.noticias.edit') : t('admin.noticias.new')}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>
              {t('action.cancelar')}
            </button>
            <button className="btn-primary" onClick={save} disabled={saving}>
              {saving ? t('action.guardando') : t('action.guardar')}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="alert-info">
            <span dangerouslySetInnerHTML={{__html: t('admin.noticias.help_bilingual')}} />
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Título · ES</label>
              <input
                className="input"
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Títol · VA</label>
              <input
                className="input"
                value={form.titulo_va}
                onChange={(e) => setForm({ ...form, titulo_va: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="label">Slug</label>
            <input
              className="input"
              placeholder="se genera del título si lo dejas vacío"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Resumen · ES</label>
              <textarea
                className="input"
                rows={3}
                value={form.resumen}
                onChange={(e) => setForm({ ...form, resumen: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Resum · VA</label>
              <textarea
                className="input"
                rows={3}
                value={form.resumen_va}
                onChange={(e) => setForm({ ...form, resumen_va: e.target.value })}
              />
            </div>
          </div>
          <RichTextEditor
            label="Contenido · ES"
            value={form.contenido}
            onChange={(html) => setForm({ ...form, contenido: html })}
          />
          <RichTextEditor
            label="Contingut · VA"
            value={form.contenido_va}
            onChange={(html) => setForm({ ...form, contenido_va: html })}
          />
          <ImageUploader
            value={form.imagen_url}
            onChange={(url) => setForm({ ...form, imagen_url: url })}
            folder="noticias"
            label="Imagen principal"
          />
          <GalleryUploader
            value={form.galeria}
            onChange={(urls) => setForm({ ...form, galeria: urls })}
            folder="noticias"
            label="Galería"
          />
          <div>
            <span className="label">Adjuntos</span>
            <div className="space-y-1">
              {form.adjuntos.map((a, i) => (
                <div key={a.url + i} className="flex items-center justify-between gap-2 rounded-md bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1.5">
                  <a href={a.url} target="_blank" rel="noreferrer" className="truncate text-sm text-gold hover:underline">
                    {a.nombre}
                  </a>
                  <button
                    type="button"
                    className="text-zinc-500 dark:text-zinc-400 hover:text-red-400"
                    onClick={() => setForm((f) => ({ ...f, adjuntos: f.adjuntos.filter((_, j) => j !== i) }))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <input
              type="file"
              className="mt-2 text-sm text-zinc-500 dark:text-zinc-400"
              disabled={uploadingAdj}
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) addAdjunto(f)
                e.target.value = ''
              }}
            />
            {uploadingAdj && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Subiendo…</p>}
          </div>
          <div>
            <label className="label">Fecha de publicación</label>
            <input
              type="datetime-local"
              className="input"
              value={form.fecha_local}
              onChange={(e) => setForm({ ...form, fecha_local: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.destacada}
              onChange={(e) => setForm({ ...form, destacada: e.target.checked })}
            />
            <span className="text-sm">Destacada</span>
          </label>
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

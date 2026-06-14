import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Patrocinador } from '../../../types/db'
import Spinner from '../../../components/Spinner'
import Modal from '../../../components/Modal'
import ImageUploader from '../../../components/admin/ImageUploader'

interface FormState {
  nombre: string
  logo_url: string | null
  enlace: string
  orden: number
  visible: boolean
}

const empty: FormState = { nombre: '', logo_url: null, enlace: '', orden: 0, visible: true }

export default function WebPatrocinadoresPage() {
  const [items, setItems] = useState<Patrocinador[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const { data } = await supabase.from('patrocinadores').select('*').order('orden', { ascending: true })
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

  function openEdit(p: Patrocinador) {
    setEditId(p.id)
    setForm({
      nombre: p.nombre,
      logo_url: p.logo_url,
      enlace: p.enlace ?? '',
      orden: p.orden ?? 0,
      visible: p.visible,
    })
    setError(null)
    setOpen(true)
  }

  async function save() {
    setError(null)
    if (!form.nombre.trim()) {
      setError('Indica el nombre.')
      return
    }
    setSaving(true)
    const payload = {
      nombre: form.nombre.trim(),
      logo_url: form.logo_url,
      enlace: form.enlace.trim() || null,
      orden: form.orden,
      visible: form.visible,
    }
    let err
    if (editId) {
      ;({ error: err } = await supabase.from('patrocinadores').update(payload).eq('id', editId))
    } else {
      ;({ error: err } = await supabase.from('patrocinadores').insert(payload))
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

  async function remove(p: Patrocinador) {
    if (!confirm(`¿Eliminar el patrocinador "${p.nombre}"?`)) return
    const { error: err } = await supabase.from('patrocinadores').delete().eq('id', p.id)
    if (err) return alert(err.message)
    load()
  }

  if (loading) return <Spinner label="Cargando patrocinadores…" />

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patrocinadores</h1>
        <button className="btn-primary" onClick={openNew}>
          + Nuevo
        </button>
      </div>

      <div className="card divide-y divide-zinc-200 dark:divide-zinc-800">
        {items.length === 0 && <p className="p-4 text-sm text-zinc-500 dark:text-zinc-400">No hay patrocinadores.</p>}
        {items.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              {p.logo_url ? (
                <img src={p.logo_url} alt="" className="h-12 w-12 rounded-lg border border-zinc-300 dark:border-zinc-700 object-contain" />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-xs text-zinc-500">
                  sin
                </div>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate font-medium">{p.nombre}</span>
                  {!p.visible && (
                    <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-500 dark:text-zinc-400">Oculto</span>
                  )}
                </div>
                <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                  orden {p.orden}
                  {p.enlace ? ` · ${p.enlace}` : ''}
                </div>
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
        title={editId ? 'Editar patrocinador' : 'Nuevo patrocinador'}
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
            <label className="label">Nombre</label>
            <input
              className="input"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
          </div>
          <ImageUploader
            value={form.logo_url}
            onChange={(url) => setForm({ ...form, logo_url: url })}
            folder="patrocinadores"
            label="Logo"
          />
          <div>
            <label className="label">Enlace</label>
            <input
              className="input"
              placeholder="https://…"
              value={form.enlace}
              onChange={(e) => setForm({ ...form, enlace: e.target.value })}
            />
          </div>
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
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
            />
            <span className="text-sm">Visible</span>
          </label>
          {error && <p className="alert-error">{error}</p>}
        </div>
      </Modal>
    </div>
  )
}

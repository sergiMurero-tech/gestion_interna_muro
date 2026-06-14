import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Directivo } from '../../../types/db'
import Spinner from '../../../components/Spinner'
import Modal from '../../../components/Modal'
import ImageUploader from '../../../components/admin/ImageUploader'

interface FormState {
  nombre: string
  cargo: string
  foto_url: string | null
  descripcion: string
  orden: number
}

const empty: FormState = { nombre: '', cargo: '', foto_url: null, descripcion: '', orden: 0 }

export default function WebDirectivaPage() {
  const [items, setItems] = useState<Directivo[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const { data } = await supabase.from('directiva').select('*').order('orden', { ascending: true })
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

  function openEdit(d: Directivo) {
    setEditId(d.id)
    setForm({
      nombre: d.nombre,
      cargo: d.cargo,
      foto_url: d.foto_url,
      descripcion: d.descripcion ?? '',
      orden: d.orden ?? 0,
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
      cargo: form.cargo.trim(),
      foto_url: form.foto_url,
      descripcion: form.descripcion,
      orden: form.orden,
    }
    let err
    if (editId) {
      ;({ error: err } = await supabase.from('directiva').update(payload).eq('id', editId))
    } else {
      ;({ error: err } = await supabase.from('directiva').insert(payload))
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

  async function remove(d: Directivo) {
    if (!confirm(`¿Eliminar a "${d.nombre}"?`)) return
    const { error: err } = await supabase.from('directiva').delete().eq('id', d.id)
    if (err) return alert(err.message)
    load()
  }

  if (loading) return <Spinner label="Cargando directiva…" />

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Directiva</h1>
        <button className="btn-primary" onClick={openNew}>
          + Nuevo
        </button>
      </div>

      <div className="card divide-y divide-zinc-800">
        {items.length === 0 && <p className="p-4 text-sm text-zinc-400">No hay miembros de la directiva.</p>}
        {items.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              {d.foto_url ? (
                <img src={d.foto_url} alt="" className="h-12 w-12 rounded-full border border-zinc-700 object-cover" />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-full border border-dashed border-zinc-700 text-xs text-zinc-500">
                  sin
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate font-medium">{d.nombre}</div>
                <div className="truncate text-xs text-zinc-400">
                  {d.cargo || '—'} · orden {d.orden}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="btn-secondary" onClick={() => openEdit(d)}>
                Editar
              </button>
              <button className="btn-danger" onClick={() => remove(d)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        title={editId ? 'Editar miembro' : 'Nuevo miembro'}
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
          <div>
            <label className="label">Cargo</label>
            <input
              className="input"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
            />
          </div>
          <ImageUploader
            value={form.foto_url}
            onChange={(url) => setForm({ ...form, foto_url: url })}
            folder="directiva"
            label="Foto"
          />
          <div>
            <label className="label">Descripción</label>
            <textarea
              className="input"
              rows={4}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
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
          {error && <p className="alert-error">{error}</p>}
        </div>
      </Modal>
    </div>
  )
}

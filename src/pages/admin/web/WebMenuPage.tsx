import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { MenuItem, MenuTipo } from '../../../types/db'
import Spinner from '../../../components/Spinner'
import Modal from '../../../components/Modal'

interface FormState {
  label: string
  tipo: MenuTipo
  destino: string
  parent_id: string | null
  orden: number
  visible: boolean
}

const empty: FormState = { label: '', tipo: 'ruta', destino: '', parent_id: null, orden: 0, visible: true }

const tipoHelp: Record<MenuTipo, string> = {
  ruta: 'ruta interna p.ej. /club/historia',
  externa: 'URL completa https://…',
  pagina: 'slug de una página CMS',
}

export default function WebMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const { data } = await supabase.from('menu_items').select('*').order('orden', { ascending: true })
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

  function openEdit(m: MenuItem) {
    setEditId(m.id)
    setForm({
      label: m.label,
      tipo: m.tipo,
      destino: m.destino ?? '',
      parent_id: m.parent_id,
      orden: m.orden ?? 0,
      visible: m.visible,
    })
    setError(null)
    setOpen(true)
  }

  async function save() {
    setError(null)
    if (!form.label.trim()) {
      setError('Indica la etiqueta.')
      return
    }
    setSaving(true)
    const payload = {
      label: form.label.trim(),
      tipo: form.tipo,
      destino: form.destino.trim(),
      parent_id: form.parent_id,
      orden: form.orden,
      visible: form.visible,
    }
    let err
    if (editId) {
      ;({ error: err } = await supabase.from('menu_items').update(payload).eq('id', editId))
    } else {
      ;({ error: err } = await supabase.from('menu_items').insert(payload))
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

  async function remove(m: MenuItem) {
    const isParent = items.some((i) => i.parent_id === m.id)
    const msg = isParent
      ? `¿Eliminar "${m.label}"? También se eliminarán sus subelementos (en cascada).`
      : `¿Eliminar "${m.label}"?`
    if (!confirm(msg)) return
    const { error: err } = await supabase.from('menu_items').delete().eq('id', m.id)
    if (err) return alert(err.message)
    load()
  }

  if (loading) return <Spinner label="Cargando menú…" />

  const parents = items.filter((i) => i.parent_id === null)
  const childrenOf = (id: string) => items.filter((i) => i.parent_id === id)
  const parentOptions = parents.filter((p) => p.id !== editId)

  function renderRow(m: MenuItem, indented: boolean) {
    return (
      <div
        key={m.id}
        className={`flex flex-wrap items-center justify-between gap-3 p-4 ${indented ? 'pl-10' : ''}`}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">
              {indented && <span className="text-zinc-600">↳ </span>}
              {m.label}
            </span>
            {!m.visible && (
              <span className="rounded-full bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-400">Oculto</span>
            )}
          </div>
          <div className="truncate text-xs text-zinc-400">
            {m.tipo} · {m.destino || '—'} · orden {m.orden}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => openEdit(m)}>
            Editar
          </button>
          <button className="btn-danger" onClick={() => remove(m)}>
            Eliminar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Menú</h1>
        <button className="btn-primary" onClick={openNew}>
          + Nuevo
        </button>
      </div>

      <div className="card divide-y divide-zinc-800">
        {items.length === 0 && <p className="p-4 text-sm text-zinc-400">No hay elementos de menú.</p>}
        {parents.map((p) => (
          <div key={p.id} className="divide-y divide-zinc-800">
            {renderRow(p, false)}
            {childrenOf(p.id).map((c) => renderRow(c, true))}
          </div>
        ))}
      </div>

      <Modal
        open={open}
        title={editId ? 'Editar elemento' : 'Nuevo elemento'}
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
            <label className="label">Etiqueta</label>
            <input
              className="input"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select
              className="input"
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as MenuTipo })}
            >
              <option value="ruta">Ruta interna</option>
              <option value="externa">Enlace externo</option>
              <option value="pagina">Página CMS</option>
            </select>
          </div>
          <div>
            <label className="label">Destino</label>
            <input
              className="input"
              value={form.destino}
              onChange={(e) => setForm({ ...form, destino: e.target.value })}
            />
            <p className="mt-1 text-xs text-zinc-400">{tipoHelp[form.tipo]}</p>
          </div>
          <div>
            <label className="label">Padre</label>
            <select
              className="input"
              value={form.parent_id ?? ''}
              onChange={(e) => setForm({ ...form, parent_id: e.target.value || null })}
            >
              <option value="">— Sin padre (nivel principal) —</option>
              {parentOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
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

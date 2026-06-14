import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { CuerpoTecnico, Equipo } from '../../types/db'
import Modal from '../../components/Modal'
import ImageUploader from '../../components/admin/ImageUploader'

interface Props {
  team: Equipo
  onClose: () => void
}

const EMPTY = { nombre: '', cargo: '', foto_url: null as string | null, orden: 0 }

export default function TeamStaffModal({ team, onClose }: Props) {
  const [staff, setStaff] = useState<CuerpoTecnico[]>([])
  const [form, setForm] = useState(EMPTY)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase
      .from('cuerpo_tecnico')
      .select('*')
      .eq('equipo_id', team.id)
      .order('orden')
    setStaff((data ?? []) as CuerpoTecnico[])
  }

  useEffect(() => {
    load()
  }, [team.id])

  function reset() {
    setForm(EMPTY)
    setEditingId(null)
  }

  async function save() {
    if (!form.nombre.trim()) return
    setSaving(true)
    const payload = {
      equipo_id: team.id,
      nombre: form.nombre.trim(),
      cargo: form.cargo.trim(),
      foto_url: form.foto_url,
      orden: form.orden,
    }
    const { error } = editingId
      ? await supabase.from('cuerpo_tecnico').update(payload).eq('id', editingId)
      : await supabase.from('cuerpo_tecnico').insert(payload)
    setSaving(false)
    if (error) return alert(error.message)
    reset()
    await load()
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar este miembro del cuerpo técnico?')) return
    const { error } = await supabase.from('cuerpo_tecnico').delete().eq('id', id)
    if (error) return alert(error.message)
    await load()
  }

  return (
    <Modal open title={`Cuerpo técnico · ${team.nombre}`} onClose={onClose}>
      <div className="space-y-4">
        <div className="space-y-2">
          {staff.length === 0 && <p className="text-sm text-zinc-400">Aún no hay miembros.</p>}
          {staff.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 p-2">
              <div className="flex items-center gap-3">
                {m.foto_url ? (
                  <img src={m.foto_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-zinc-800" />
                )}
                <div>
                  <div className="text-sm font-medium">{m.nombre}</div>
                  <div className="text-xs text-gold">{m.cargo}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditingId(m.id)
                    setForm({ nombre: m.nombre, cargo: m.cargo, foto_url: m.foto_url, orden: m.orden })
                  }}
                >
                  Editar
                </button>
                <button className="btn-danger" onClick={() => remove(m.id)}>
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-zinc-800 pt-4">
          <div className="text-sm font-semibold">{editingId ? 'Editar miembro' : 'Añadir miembro'}</div>
          <div>
            <label className="label">Nombre</label>
            <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <label className="label">Cargo</label>
            <input
              className="input"
              placeholder="Entrenador, 2º entrenador, delegado…"
              value={form.cargo}
              onChange={(e) => setForm({ ...form, cargo: e.target.value })}
            />
          </div>
          <ImageUploader
            label="Foto (opcional)"
            value={form.foto_url}
            onChange={(url) => setForm({ ...form, foto_url: url })}
            folder="cuerpo-tecnico"
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
          <div className="flex gap-2">
            <button className="btn-primary" onClick={save} disabled={saving || !form.nombre.trim()}>
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Añadir'}
            </button>
            {editingId && (
              <button className="btn-secondary" onClick={reset}>
                Cancelar edición
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

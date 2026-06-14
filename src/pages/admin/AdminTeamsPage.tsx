import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Equipo, Profile } from '../../types/db'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import ImageUploader from '../../components/admin/ImageUploader'
import TeamStaffModal from './TeamStaffModal'

const EMPTY = {
  nombre: '',
  categoria: '',
  temporada: '',
  entrenador_id: '',
  activo: true,
  foto_url: null as string | null,
  descripcion: '',
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Equipo[]>([])
  const [coaches, setCoaches] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Equipo | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [staffTeam, setStaffTeam] = useState<Equipo | null>(null)

  async function load() {
    const [{ data: t }, { data: c }] = await Promise.all([
      supabase.from('equipos').select('*').order('nombre'),
      supabase.from('profiles').select('*').eq('rol', 'entrenador').eq('activo', true).order('nombre'),
    ])
    setTeams(t ?? [])
    setCoaches(c ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  function openNew() {
    setEditing(null)
    setForm(EMPTY)
    setError(null)
    setOpen(true)
  }

  function openEdit(t: Equipo) {
    setEditing(t)
    setForm({
      nombre: t.nombre,
      categoria: t.categoria,
      temporada: t.temporada,
      entrenador_id: t.entrenador_id ?? '',
      activo: t.activo,
      foto_url: t.foto_url ?? null,
      descripcion: t.descripcion ?? '',
    })
    setError(null)
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    setError(null)
    const payload = {
      nombre: form.nombre.trim(),
      categoria: form.categoria.trim(),
      temporada: form.temporada.trim(),
      entrenador_id: form.entrenador_id || null,
      activo: form.activo,
      foto_url: form.foto_url,
      descripcion: form.descripcion.trim(),
    }
    const { error } = editing
      ? await supabase.from('equipos').update(payload).eq('id', editing.id)
      : await supabase.from('equipos').insert(payload)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setOpen(false)
    setLoading(true)
    await load()
  }

  async function remove(t: Equipo) {
    if (!confirm(`¿Eliminar el equipo "${t.nombre}"? Los jugadores quedarán sin equipo asignado.`)) return
    const { error } = await supabase.from('equipos').delete().eq('id', t.id)
    if (error) {
      alert(error.message)
      return
    }
    setLoading(true)
    await load()
  }

  if (loading) return <Spinner label="Cargando equipos…" />

  const coachName = (id: string | null) => coaches.find((c) => c.id === id)?.nombre ?? '—'

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Equipos</h1>
        <button className="btn-primary" onClick={openNew}>
          + Nuevo equipo
        </button>
      </div>

      <div className="card divide-y divide-zinc-200 dark:divide-zinc-800">
        {teams.length === 0 && <p className="p-4 text-sm text-zinc-500 dark:text-zinc-400">No hay equipos.</p>}
        {teams.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <div className="font-medium">
                {t.nombre} {!t.activo && <span className="text-xs text-zinc-500">(inactivo)</span>}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {t.categoria} · {t.temporada} · Entrenador: {coachName(t.entrenador_id)}
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button className="btn-secondary" onClick={() => setStaffTeam(t)}>
                Cuerpo técnico
              </button>
              <button className="btn-secondary" onClick={() => openEdit(t)}>
                Editar
              </button>
              <button className="btn-danger" onClick={() => remove(t)}>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        title={editing ? 'Editar equipo' : 'Nuevo equipo'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={save} disabled={saving || !form.nombre.trim()}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">Nombre</label>
            <input className="input" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          </div>
          <div>
            <label className="label">Categoría</label>
            <input className="input" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} />
          </div>
          <div>
            <label className="label">Temporada</label>
            <input
              className="input"
              placeholder="2025/2026"
              value={form.temporada}
              onChange={(e) => setForm({ ...form, temporada: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Entrenador principal</label>
            <select
              className="input"
              value={form.entrenador_id}
              onChange={(e) => setForm({ ...form, entrenador_id: e.target.value })}
            >
              <option value="">— Sin asignar —</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre || c.email}
                </option>
              ))}
            </select>
          </div>
          <ImageUploader
            label="Foto del equipo (opcional)"
            value={form.foto_url}
            onChange={(url) => setForm({ ...form, foto_url: url })}
            folder="equipos"
          />
          <div>
            <label className="label">Descripción (opcional)</label>
            <textarea
              className="input"
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            Equipo activo
          </label>
          {error && <p className="alert-error">{error}</p>}
        </div>
      </Modal>

      {staffTeam && <TeamStaffModal team={staffTeam} onClose={() => setStaffTeam(null)} />}
    </div>
  )
}

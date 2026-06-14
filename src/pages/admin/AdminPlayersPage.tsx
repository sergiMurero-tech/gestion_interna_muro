import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Equipo, Jugador } from '../../types/db'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'

const EMPTY = { nombre_completo: '', equipo_id: '', temporada: '', activo: true }

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Jugador[]>([])
  const [teams, setTeams] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTeam, setFilterTeam] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Jugador | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    const [{ data: p }, { data: t }] = await Promise.all([
      supabase.from('jugadores').select('*').order('nombre_completo'),
      supabase.from('equipos').select('*').order('nombre'),
    ])
    setPlayers(p ?? [])
    setTeams(t ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const teamName = (id: string | null) => teams.find((t) => t.id === id)?.nombre ?? '—'

  const visible = useMemo(
    () => (filterTeam ? players.filter((p) => p.equipo_id === filterTeam) : players),
    [players, filterTeam],
  )

  function openNew() {
    setEditing(null)
    setForm({ ...EMPTY, equipo_id: filterTeam })
    setError(null)
    setOpen(true)
  }

  function openEdit(p: Jugador) {
    setEditing(p)
    setForm({
      nombre_completo: p.nombre_completo,
      equipo_id: p.equipo_id ?? '',
      temporada: p.temporada,
      activo: p.activo,
    })
    setError(null)
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    setError(null)
    const team = teams.find((t) => t.id === form.equipo_id)
    const payload = {
      nombre_completo: form.nombre_completo.trim(),
      equipo_id: form.equipo_id || null,
      temporada: form.temporada.trim() || team?.temporada || '',
      activo: form.activo,
    }
    const { error } = editing
      ? await supabase.from('jugadores').update(payload).eq('id', editing.id)
      : await supabase.from('jugadores').insert(payload)
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    setOpen(false)
    setLoading(true)
    await load()
  }

  if (loading) return <Spinner label="Cargando jugadores…" />

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Jugadores</h1>
        <div className="flex gap-2">
          <select className="input w-44" value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
            <option value="">Todos los equipos</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
          <button className="btn-primary" onClick={openNew}>
            + Nuevo
          </button>
        </div>
      </div>

      <div className="card divide-y divide-slate-100">
        {visible.length === 0 && <p className="p-4 text-sm text-slate-500">No hay jugadores.</p>}
        {visible.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <div className="font-medium">
                {p.nombre_completo} {!p.activo && <span className="text-xs text-slate-400">(inactivo)</span>}
              </div>
              <div className="text-xs text-slate-500">
                {teamName(p.equipo_id)} · {p.temporada || '—'}
              </div>
            </div>
            <button className="btn-secondary" onClick={() => openEdit(p)}>
              Editar
            </button>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        title={editing ? 'Editar jugador' : 'Nuevo jugador'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={save} disabled={saving || !form.nombre_completo.trim()}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">Nombre completo</label>
            <input
              className="input"
              value={form.nombre_completo}
              onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Equipo</label>
            <select className="input" value={form.equipo_id} onChange={(e) => setForm({ ...form, equipo_id: e.target.value })}>
              <option value="">— Sin equipo —</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Temporada</label>
            <input
              className="input"
              placeholder="(se hereda del equipo si se deja vacío)"
              value={form.temporada}
              onChange={(e) => setForm({ ...form, temporada: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            Jugador activo
          </label>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>
      </Modal>
    </div>
  )
}

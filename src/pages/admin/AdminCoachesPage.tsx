import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { isValidDni, normalizeDni } from '../../lib/dni'
import type { Equipo, EntrenadorEquipo, Profile, Rol } from '../../types/db'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'

export default function AdminCoachesPage() {
  const { profile: me, createCoach } = useAuth()
  const [people, setPeople] = useState<Profile[]>([])
  const [teams, setTeams] = useState<Equipo[]>([])
  const [assigns, setAssigns] = useState<EntrenadorEquipo[]>([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [target, setTarget] = useState<Profile | null>(null)
  const [selectedTeams, setSelectedTeams] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  // Alta de nuevo entrenador.
  const [newOpen, setNewOpen] = useState(false)
  const [newDni, setNewDni] = useState('')
  const [newNombre, setNewNombre] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function load() {
    const [{ data: p }, { data: t }, { data: a }] = await Promise.all([
      supabase.from('profiles').select('*').order('nombre'),
      supabase.from('equipos').select('*').order('nombre'),
      supabase.from('entrenador_equipos').select('*'),
    ])
    setPeople(p ?? [])
    setTeams(t ?? [])
    setAssigns(a ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function setRole(p: Profile, rol: Rol) {
    const { error } = await supabase.from('profiles').update({ rol }).eq('id', p.id)
    if (error) return alert(error.message)
    load()
  }

  async function setActive(p: Profile, activo: boolean) {
    const { error } = await supabase.from('profiles').update({ activo }).eq('id', p.id)
    if (error) return alert(error.message)
    load()
  }

  function openNew() {
    setNewDni('')
    setNewNombre('')
    setCreateError(null)
    setNewOpen(true)
  }

  async function createNewCoach() {
    setCreateError(null)
    if (!isValidDni(newDni)) {
      setCreateError('El DNI debe tener 9 caracteres (8 cifras + letra, o NIE).')
      return
    }
    if (!newNombre.trim()) {
      setCreateError('Indica el nombre del entrenador.')
      return
    }
    setCreating(true)
    const { error } = await createCoach(newDni, newNombre.trim())
    setCreating(false)
    if (error) {
      setCreateError(error)
      return
    }
    setNewOpen(false)
    setLoading(true)
    await load()
  }

  function openAssign(p: Profile) {
    setTarget(p)
    setSelectedTeams(new Set(assigns.filter((a) => a.entrenador_id === p.id).map((a) => a.equipo_id)))
    setOpen(true)
  }

  async function saveAssign() {
    if (!target) return
    setSaving(true)
    const current = new Set(assigns.filter((a) => a.entrenador_id === target.id).map((a) => a.equipo_id))
    const toAdd = [...selectedTeams].filter((id) => !current.has(id))
    const toRemove = [...current].filter((id) => !selectedTeams.has(id))

    if (toAdd.length) {
      const { error } = await supabase
        .from('entrenador_equipos')
        .insert(toAdd.map((equipo_id) => ({ entrenador_id: target.id, equipo_id })))
      if (error) {
        setSaving(false)
        return alert(error.message)
      }
    }
    for (const equipo_id of toRemove) {
      const { error } = await supabase
        .from('entrenador_equipos')
        .delete()
        .eq('entrenador_id', target.id)
        .eq('equipo_id', equipo_id)
      if (error) {
        setSaving(false)
        return alert(error.message)
      }
    }
    setSaving(false)
    setOpen(false)
    load()
  }

  if (loading) return <Spinner label="Cargando entrenadores…" />

  const teamCount = (id: string) => assigns.filter((a) => a.entrenador_id === id).length

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Entrenadores y usuarios</h1>
        <button className="btn-primary" onClick={openNew}>
          + Nuevo entrenador
        </button>
      </div>
      <p className="mb-4 alert-info">
        Da de alta a cada entrenador con su DNI y nombre. Entrará en la app escribiendo solo su DNI. Después podrás
        asignarle equipos y, si procede, hacerlo administrador.
      </p>

      <div className="card divide-y divide-zinc-800">
        {people.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <div className="truncate font-medium">
                {p.nombre || '(sin nombre)'}{' '}
                {p.id === me?.id && <span className="text-xs text-zinc-500">(tú)</span>}
                {!p.activo && <span className="ml-1 text-xs text-red-500">inactivo</span>}
              </div>
              <div className="truncate text-xs text-zinc-400">
                {p.rol === 'admin'
                  ? `${p.email} · Administrador`
                  : p.rol === 'coordinador'
                    ? `DNI ${p.dni ?? '—'} · Coordinador · ve todos los equipos`
                    : `DNI ${p.dni ?? '—'} · Entrenador · ${teamCount(p.id)} equipos`}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {p.rol === 'entrenador' && (
                <button className="btn-secondary" onClick={() => openAssign(p)}>
                  Asignar equipos
                </button>
              )}
              <select
                className="input w-36"
                value={p.rol}
                disabled={p.id === me?.id}
                onChange={(e) => setRole(p, e.target.value as Rol)}
              >
                <option value="entrenador">Entrenador</option>
                <option value="coordinador">Coordinador</option>
                <option value="admin">Administrador</option>
              </select>
              <button
                className={p.activo ? 'btn-danger' : 'btn-secondary'}
                disabled={p.id === me?.id}
                onClick={() => setActive(p, !p.activo)}
              >
                {p.activo ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        title={`Equipos de ${target?.nombre || target?.email || ''}`}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={saveAssign} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </>
        }
      >
        <div className="space-y-1">
          {teams.length === 0 && <p className="text-sm text-zinc-400">No hay equipos.</p>}
          {teams.map((t) => (
            <label key={t.id} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-zinc-800">
              <input
                type="checkbox"
                checked={selectedTeams.has(t.id)}
                onChange={(e) => {
                  const next = new Set(selectedTeams)
                  if (e.target.checked) next.add(t.id)
                  else next.delete(t.id)
                  setSelectedTeams(next)
                }}
              />
              <span className="text-sm">
                {t.nombre} <span className="text-xs text-zinc-500">· {t.categoria}</span>
              </span>
            </label>
          ))}
        </div>
      </Modal>

      <Modal
        open={newOpen}
        title="Nuevo entrenador"
        onClose={() => setNewOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setNewOpen(false)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={createNewCoach} disabled={creating}>
              {creating ? 'Creando…' : 'Dar de alta'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">DNI</label>
            <input
              className="input uppercase"
              placeholder="12345678Z"
              value={newDni}
              onChange={(e) => setNewDni(e.target.value)}
            />
            <p className="mt-1 text-xs text-zinc-400">
              {newDni ? `Entrará con el DNI: ${normalizeDni(newDni)}` : 'Con este DNI accederá a la app (sin contraseña).'}
            </p>
          </div>
          <div>
            <label className="label">Nombre completo</label>
            <input className="input" value={newNombre} onChange={(e) => setNewNombre(e.target.value)} />
          </div>
          {createError && <p className="alert-error">{createError}</p>}
        </div>
      </Modal>
    </div>
  )
}

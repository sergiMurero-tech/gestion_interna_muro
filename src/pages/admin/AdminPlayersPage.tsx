import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { removeLicenseFile } from '../../lib/storage'
import type { Equipo, Jugador } from '../../types/db'
import Spinner from '../../components/Spinner'
import Modal from '../../components/Modal'
import ImageUploader from '../../components/admin/ImageUploader'
import { useLang } from '../../lib/i18n'

const EMPTY = {
  nombre_completo: '',
  equipo_id: '',
  temporada: '',
  activo: true,
  foto_url: null as string | null,
  dorsal: '' as string,
}

export default function AdminPlayersPage() {
  const { t } = useLang()
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
      foto_url: p.foto_url ?? null,
      dorsal: p.dorsal != null ? String(p.dorsal) : '',
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
      foto_url: form.foto_url,
      dorsal: form.dorsal.trim() === '' ? null : Number(form.dorsal),
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

  async function remove(p: Jugador) {
    if (
      !confirm(
        `¿Eliminar a "${p.nombre_completo}"? Se borrarán también su licencia y desaparecerá de los listados. Esta acción no se puede deshacer.`,
      )
    )
      return
    // Borra primero el PDF de la licencia (si existe) para no dejar ficheros huérfanos.
    const { data: lic } = await supabase
      .from('licencias')
      .select('url_archivo')
      .eq('jugador_id', p.id)
      .maybeSingle()
    if (lic?.url_archivo) await removeLicenseFile(lic.url_archivo)

    const { error } = await supabase.from('jugadores').delete().eq('id', p.id)
    if (error) {
      alert(error.message)
      return
    }
    setLoading(true)
    await load()
  }

  if (loading) return <Spinner label="Cargando jugadores…" />

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('admin.jugadores.title')}</h1>
        <div className="flex gap-2">
          <select className="input w-44" value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
            <option value="">{t('admin.jugadores.filter_all')}</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
          <button className="btn-primary" onClick={openNew}>
            {t('action.nuevo')}
          </button>
        </div>
      </div>

      <div className="card divide-y divide-zinc-200 dark:divide-zinc-800">
        {visible.length === 0 && <p className="p-4 text-sm text-zinc-500 dark:text-zinc-400">{t('admin.jugadores.empty')}</p>}
        {visible.map((p) => (
          <div key={p.id} className="flex items-center justify-between gap-3 p-4">
            <div>
              <div className="font-medium">
                {p.nombre_completo} {!p.activo && <span className="text-xs text-zinc-500">(inactivo)</span>}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {teamName(p.equipo_id)} · {p.temporada || '—'}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary" onClick={() => openEdit(p)}>
                {t('action.editar')}
              </button>
              <button className="btn-danger" onClick={() => remove(p)}>
                {t('action.eliminar')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        title={editing ? t('admin.jugadores.edit') : t('admin.jugadores.new')}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>
              {t('action.cancelar')}
            </button>
            <button className="btn-primary" onClick={save} disabled={saving || !form.nombre_completo.trim()}>
              {saving ? t('action.guardando') : t('action.guardar')}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="label">{t('field.nombre_completo')}</label>
            <input
              className="input"
              value={form.nombre_completo}
              onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })}
            />
          </div>
          <div>
            <label className="label">{t('field.equipo')}</label>
            <select className="input" value={form.equipo_id} onChange={(e) => setForm({ ...form, equipo_id: e.target.value })}>
              <option value="">{t('admin.jugadores.no_equipo')}</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">{t('field.temporada')}</label>
              <input
                className="input"
                placeholder={t('admin.jugadores.temporada_hint')}
                value={form.temporada}
                onChange={(e) => setForm({ ...form, temporada: e.target.value })}
              />
            </div>
            <div>
              <label className="label">{t('field.dorsal')}</label>
              <input
                type="number"
                className="input"
                value={form.dorsal}
                onChange={(e) => setForm({ ...form, dorsal: e.target.value })}
              />
            </div>
          </div>
          <ImageUploader
            label={t('admin.jugadores.foto_player')}
            value={form.foto_url}
            onChange={(url) => setForm({ ...form, foto_url: url })}
            folder="jugadores"
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
            Jugador activo
          </label>
          {error && <p className="alert-error">{error}</p>}
        </div>
      </Modal>
    </div>
  )
}

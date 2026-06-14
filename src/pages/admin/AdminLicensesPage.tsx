import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Equipo, Jugador, Licencia } from '../../types/db'
import Spinner from '../../components/Spinner'
import LicenseBadge from '../../components/LicenseBadge'
import { uploadLicense, downloadLicenseBlob, removeLicenseFile } from '../../lib/storage'
import { downloadBlob } from '../../lib/pdf'

export default function AdminLicensesPage() {
  const { profile } = useAuth()
  const [params] = useSearchParams()
  const [players, setPlayers] = useState<Jugador[]>([])
  const [teams, setTeams] = useState<Equipo[]>([])
  const [licenses, setLicenses] = useState<Map<string, Licencia>>(new Map())
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [filterTeam, setFilterTeam] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterSeason, setFilterSeason] = useState('')
  const [onlyMissing, setOnlyMissing] = useState(params.get('filtro') === 'sin')

  const fileInputs = useRef<Map<string, HTMLInputElement>>(new Map())

  async function load() {
    const [{ data: p }, { data: t }, { data: l }] = await Promise.all([
      supabase.from('jugadores').select('*').eq('activo', true).order('nombre_completo'),
      supabase.from('equipos').select('*').order('nombre'),
      supabase.from('licencias').select('*'),
    ])
    setPlayers(p ?? [])
    setTeams(t ?? [])
    setLicenses(new Map((l ?? []).map((x) => [x.jugador_id, x])))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const teamById = (id: string | null) => teams.find((t) => t.id === id)
  const categories = useMemo(() => [...new Set(teams.map((t) => t.categoria).filter(Boolean))].sort(), [teams])
  const seasons = useMemo(() => [...new Set(teams.map((t) => t.temporada).filter(Boolean))].sort(), [teams])

  const visible = useMemo(() => {
    return players.filter((p) => {
      const team = teamById(p.equipo_id)
      if (filterTeam && p.equipo_id !== filterTeam) return false
      if (filterCat && team?.categoria !== filterCat) return false
      if (filterSeason && (p.temporada || team?.temporada) !== filterSeason) return false
      if (onlyMissing && licenses.has(p.id)) return false
      return true
    })
  }, [players, teams, licenses, filterTeam, filterCat, filterSeason, onlyMissing])

  async function onUpload(player: Jugador, file: File) {
    if (file.type !== 'application/pdf') {
      alert('La licencia debe ser un PDF.')
      return
    }
    setBusyId(player.id)
    try {
      const existing = licenses.get(player.id)
      const path = await uploadLicense(player.id, file)
      // Si el nombre del fichero cambió, borra el antiguo para no dejar huérfanos.
      if (existing && existing.url_archivo !== path) await removeLicenseFile(existing.url_archivo)

      const team = teamById(player.equipo_id)
      const row = {
        jugador_id: player.id,
        temporada: player.temporada || team?.temporada || '',
        nombre_archivo: file.name,
        url_archivo: path,
        usuario_subida: profile?.id ?? null,
        fecha_subida: new Date().toISOString(),
      }
      const { error } = await supabase.from('licencias').upsert(row, { onConflict: 'jugador_id' })
      if (error) throw new Error(error.message)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al subir la licencia.')
    } finally {
      setBusyId(null)
    }
  }

  async function onDownload(lic: Licencia) {
    try {
      const blob = await downloadLicenseBlob(lic.url_archivo)
      downloadBlob(blob, lic.nombre_archivo)
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al descargar.')
    }
  }

  async function onDelete(player: Jugador, lic: Licencia) {
    if (!confirm(`¿Eliminar la licencia de ${player.nombre_completo}?`)) return
    setBusyId(player.id)
    try {
      await removeLicenseFile(lic.url_archivo)
      const { error } = await supabase.from('licencias').delete().eq('id', lic.id)
      if (error) throw new Error(error.message)
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Error al eliminar.')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <Spinner label="Cargando licencias…" />

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Licencias</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <select className="input w-40" value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)}>
          <option value="">Todos los equipos</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
        <select className="input w-40" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className="input w-40" value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)}>
          <option value="">Todas las temporadas</option>
          {seasons.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 text-sm">
          <input type="checkbox" checked={onlyMissing} onChange={(e) => setOnlyMissing(e.target.checked)} />
          Solo sin licencia
        </label>
      </div>

      <div className="card divide-y divide-zinc-800">
        {visible.length === 0 && <p className="p-4 text-sm text-zinc-400">No hay jugadores con estos filtros.</p>}
        {visible.map((p) => {
          const lic = licenses.get(p.id)
          const busy = busyId === p.id
          return (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <div className="truncate font-medium">{p.nombre_completo}</div>
                <div className="text-xs text-zinc-400">
                  {teamById(p.equipo_id)?.nombre ?? '—'}
                  {lic && ` · ${lic.nombre_archivo}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LicenseBadge has={!!lic} />
                <input
                  ref={(el) => {
                    if (el) fileInputs.current.set(p.id, el)
                  }}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) onUpload(p, f)
                    e.target.value = ''
                  }}
                />
                <button
                  className="btn-secondary"
                  disabled={busy}
                  onClick={() => fileInputs.current.get(p.id)?.click()}
                >
                  {busy ? '…' : lic ? 'Sustituir' : 'Subir'}
                </button>
                {lic && (
                  <>
                    <button className="btn-secondary" disabled={busy} onClick={() => onDownload(lic)}>
                      Descargar
                    </button>
                    <button className="btn-danger" disabled={busy} onClick={() => onDelete(p, lic)}>
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

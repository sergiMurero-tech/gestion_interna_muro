import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Equipo, Jugador, Licencia } from '../types/db'
import Spinner from '../components/Spinner'
import LicenseBadge from '../components/LicenseBadge'
import { generateParteLesiones, bytesToBlob, downloadBlob, slugify } from '../lib/pdf'
import { downloadLicenseBlob } from '../lib/storage'
import { shareFiles, whatsappUrl, mailtoUrl, type NamedFile } from '../lib/share'

function todayInputValue() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export default function PlayerDetailPage() {
  const { playerId } = useParams<{ playerId: string }>()
  const { profile } = useAuth()
  const [player, setPlayer] = useState<Jugador | null>(null)
  const [team, setTeam] = useState<Equipo | null>(null)
  const [license, setLicense] = useState<Licencia | null>(null)
  const [loading, setLoading] = useState(true)

  const [showFlow, setShowFlow] = useState(false)
  const [fecha, setFecha] = useState(todayInputValue())
  const [working, setWorking] = useState(false)
  const [docs, setDocs] = useState<NamedFile[] | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!playerId) return
    setLoading(true)
    ;(async () => {
      const { data: p } = await supabase.from('jugadores').select('*').eq('id', playerId).maybeSingle()
      setPlayer(p ?? null)
      if (p?.equipo_id) {
        const { data: t } = await supabase.from('equipos').select('*').eq('id', p.equipo_id).maybeSingle()
        setTeam(t ?? null)
      }
      const { data: lic } = await supabase.from('licencias').select('*').eq('jugador_id', playerId).maybeSingle()
      setLicense(lic ?? null)
      setLoading(false)
    })()
  }, [playerId])

  async function handleGenerate() {
    if (!player || !license) return
    setWorking(true)
    setError(null)
    setMsg(null)
    try {
      const [y, m, d] = fecha.split('-').map(Number)
      const date = new Date(y, m - 1, d)

      const parteBytes = await generateParteLesiones(date)
      const licBlob = await downloadLicenseBlob(license.url_archivo)

      const base = slugify(player.nombre_completo)
      const result: NamedFile[] = [
        { blob: bytesToBlob(parteBytes), filename: `parte_lesion_${base}.pdf` },
        { blob: licBlob, filename: `licencia_${base}.pdf` },
      ]
      setDocs(result)

      // Registrar en el historial (sin datos médicos).
      await supabase.from('documentos_generados').insert({
        jugador_id: player.id,
        equipo_id: player.equipo_id,
        usuario_id: profile?.id ?? null,
        tipo_documento: 'parte_lesion',
      })

      setMsg('Documentación generada correctamente.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generando la documentación.')
    } finally {
      setWorking(false)
    }
  }

  async function handleShare() {
    if (!docs) return
    const ok = await shareFiles(
      docs,
      'Documentación por lesión',
      `Parte de lesión y licencia federativa de ${player?.nombre_completo}.`,
    )
    if (!ok) {
      // Fallback: descargar ambos.
      docs.forEach((d) => downloadBlob(d.blob, d.filename))
      setMsg('Tu dispositivo no permite compartir adjuntos. Se han descargado los dos PDF.')
    }
  }

  if (loading) return <Spinner label="Cargando jugador…" />
  if (!player) return <div className="card p-6 text-center text-zinc-400">Jugador no encontrado.</div>

  const hasLicense = !!license

  return (
    <div className="mx-auto max-w-xl">
      <Link
        to={team ? `/gestion/equipos/${team.id}` : '/gestion'}
        className="mb-2 inline-block text-sm text-gold hover:underline"
      >
        ← {team?.nombre ?? 'Equipos'}
      </Link>

      <div className="card p-5">
        <h1 className="text-2xl font-bold">{player.nombre_completo}</h1>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-zinc-400">Equipo</dt>
            <dd className="font-medium">{team?.nombre ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-zinc-400">Temporada</dt>
            <dd className="font-medium">{player.temporada || team?.temporada || '—'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="mb-1 text-zinc-400">Estado de licencia</dt>
            <dd>
              <LicenseBadge has={hasLicense} />
            </dd>
          </div>
        </dl>

        {!hasLicense && (
          <div className="mt-5 rounded-lg bg-red-500/15 p-4 text-sm text-red-300">
            Este jugador no tiene licencia federativa subida. Contacte con el administrador.
          </div>
        )}

        {!showFlow ? (
          <button
            className="btn-primary mt-6 w-full text-base"
            disabled={!hasLicense}
            onClick={() => setShowFlow(true)}
          >
            Obtener documentación por lesión
          </button>
        ) : (
          <div className="mt-6 space-y-4 border-t border-zinc-800 pt-5">
            {!docs && (
              <>
                <div>
                  <label className="label">Fecha del parte (por defecto, hoy)</label>
                  <input
                    type="date"
                    className="input"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-zinc-400">
                    Solo se rellena la fecha del parte. La fecha de lesión y el resto los completa el médico.
                  </p>
                </div>
                <button className="btn-primary w-full" onClick={handleGenerate} disabled={working}>
                  {working ? 'Generando…' : 'Generar parte + licencia'}
                </button>
              </>
            )}

            {docs && (
              <div className="space-y-3">
                <p className="alert-ok">
                  Listo. Descarga o comparte los documentos:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button className="btn-secondary" onClick={() => downloadBlob(docs[0].blob, docs[0].filename)}>
                    Descargar parte
                  </button>
                  <button className="btn-secondary" onClick={() => downloadBlob(docs[1].blob, docs[1].filename)}>
                    Descargar licencia
                  </button>
                </div>
                <button className="btn-primary w-full" onClick={handleShare}>
                  Compartir parte + licencia
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <a
                    className="btn-secondary"
                    href={whatsappUrl(`Documentación por lesión de ${player.nombre_completo} (Muro CF).`)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => docs.forEach((d) => downloadBlob(d.blob, d.filename))}
                  >
                    WhatsApp
                  </a>
                  <a
                    className="btn-secondary"
                    href={mailtoUrl(
                      `Documentación por lesión - ${player.nombre_completo}`,
                      `Adjunto parte de lesión y licencia federativa de ${player.nombre_completo} (${team?.nombre ?? ''}).`,
                    )}
                    onClick={() => docs.forEach((d) => downloadBlob(d.blob, d.filename))}
                  >
                    Correo
                  </a>
                </div>
                <p className="text-xs text-zinc-500">
                  En WhatsApp/Correo se descargan los PDF para que los adjuntes. En móvil, usa “Compartir” para
                  enviarlos directamente.
                </p>
                <button
                  className="w-full text-center text-sm text-zinc-400 hover:underline"
                  onClick={() => {
                    setDocs(null)
                    setShowFlow(false)
                    setMsg(null)
                  }}
                >
                  Cerrar
                </button>
              </div>
            )}

            {error && <p className="alert-error">{error}</p>}
            {msg && !docs && <p className="text-sm text-green-300">{msg}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

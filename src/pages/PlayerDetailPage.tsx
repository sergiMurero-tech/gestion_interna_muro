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
import { useLang } from '../lib/i18n'

function todayInputValue() {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

export default function PlayerDetailPage() {
  const { t } = useLang()
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
        const { data: eq } = await supabase.from('equipos').select('*').eq('id', p.equipo_id).maybeSingle()
        setTeam(eq ?? null)
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

  if (loading) return <Spinner label={t('gestion.player.loading')} />
  if (!player) return <div className="card p-6 text-center text-zinc-500 dark:text-zinc-400">{t('gestion.player.not_found')}</div>

  const hasLicense = !!license

  return (
    <div className="mx-auto max-w-xl">
      <Link
        to={team ? `/gestion/equipos/${team.id}` : '/gestion'}
        className="mb-2 inline-block text-sm text-gold hover:underline"
      >
        ← {team?.nombre ?? t('gestion.nav.equipos')}
      </Link>

      <div className="card p-5">
        <h1 className="text-2xl font-bold">{player.nombre_completo}</h1>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">{t('gestion.player.equipo')}</dt>
            <dd className="font-medium">{team?.nombre ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">{t('gestion.player.temporada')}</dt>
            <dd className="font-medium">{player.temporada || team?.temporada || '—'}</dd>
          </div>
          <div className="col-span-2">
            <dt className="mb-1 text-zinc-500 dark:text-zinc-400">{t('gestion.player.estado_lic')}</dt>
            <dd>
              <LicenseBadge has={hasLicense} />
            </dd>
          </div>
        </dl>

        {!hasLicense && (
          <div className="mt-5 rounded-lg bg-red-500/15 p-4 text-sm text-red-300">
            {t('gestion.player.no_lic_warn')}
          </div>
        )}

        {!showFlow ? (
          <button
            className="btn-primary mt-6 w-full text-base"
            disabled={!hasLicense}
            onClick={() => setShowFlow(true)}
          >
            {t('gestion.player.cta')}
          </button>
        ) : (
          <div className="mt-6 space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-5">
            {!docs && (
              <>
                <div>
                  <label className="label">{t('gestion.player.fecha_label')}</label>
                  <input
                    type="date"
                    className="input"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {t('gestion.player.fecha_help')}
                  </p>
                </div>
                <button className="btn-primary w-full" onClick={handleGenerate} disabled={working}>
                  {working ? t('gestion.player.generando') : t('gestion.player.generar')}
                </button>
              </>
            )}

            {docs && (
              <div className="space-y-3">
                <p className="alert-ok">
                  {t('gestion.player.listo')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button className="btn-secondary" onClick={() => downloadBlob(docs[0].blob, docs[0].filename)}>
                    {t('gestion.player.desc_parte')}
                  </button>
                  <button className="btn-secondary" onClick={() => downloadBlob(docs[1].blob, docs[1].filename)}>
                    {t('gestion.player.desc_lic')}
                  </button>
                </div>
                <button className="btn-primary w-full" onClick={handleShare}>
                  {t('gestion.player.compartir')}
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
                    {t('gestion.player.correo')}
                  </a>
                </div>
                <p className="text-xs text-zinc-500">
                  {t('gestion.player.share_help')}
                </p>
                <button
                  className="w-full text-center text-sm text-zinc-500 dark:text-zinc-400 hover:underline"
                  onClick={() => {
                    setDocs(null)
                    setShowFlow(false)
                    setMsg(null)
                  }}
                >
                  {t('gestion.player.cerrar')}
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

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { ContactoInfo, EstadioInfo } from '../../../types/db'
import Spinner from '../../../components/Spinner'
import GalleryUploader from '../../../components/admin/GalleryUploader'
import RichTextEditor from '../../../components/admin/RichTextEditor'
import { useLang } from '../../../lib/i18n'

export default function WebConfigPage() {
  const { t } = useLang()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  const [inscripcionesUrl, setInscripcionesUrl] = useState('')
  const [contacto, setContacto] = useState<ContactoInfo>({ redes: {} })
  const [estadio, setEstadio] = useState<EstadioInfo>({ fotos: [] })

  async function load() {
    const { data } = await supabase.from('site_config').select('*').eq('id', 1).maybeSingle()
    if (data) {
      setInscripcionesUrl(data.inscripciones_url ?? '')
      const c = data.contacto ?? {}
      setContacto({ ...c, redes: { ...(c.redes ?? {}) } })
      const e = data.estadio ?? {}
      setEstadio({ ...e, fotos: e.fotos ?? [] })
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function save() {
    setError(null)
    setOk(false)
    setSaving(true)
    const { error: err } = await supabase
      .from('site_config')
      .update({ inscripciones_url: inscripcionesUrl, contacto, estadio })
      .eq('id', 1)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setOk(true)
  }

  function setRed(key: keyof NonNullable<ContactoInfo['redes']>, value: string) {
    setContacto((c) => ({ ...c, redes: { ...c.redes, [key]: value } }))
  }

  if (loading) return <Spinner label="Cargando configuración…" />

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('admin.config.title')}</h1>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? t('action.guardando') : t('action.guardar')}
        </button>
      </div>

      {ok && <p className="alert-ok mb-4">{t('admin.config.saved')}</p>}
      {error && <p className="alert-error mb-4">{error}</p>}

      <div className="space-y-6">
        <section className="card space-y-3 p-5">
          <h2 className="text-lg font-semibold">{t('admin.config.inscripciones')}</h2>
          <div>
            <label className="label">{t('admin.config.inscripciones_url')}</label>
            <input
              className="input"
              placeholder="https://…"
              value={inscripcionesUrl}
              onChange={(e) => setInscripcionesUrl(e.target.value)}
            />
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="text-lg font-semibold">{t('admin.config.contacto')}</h2>
          <div>
            <label className="label">Dirección</label>
            <input
              className="input"
              value={contacto.direccion ?? ''}
              onChange={(e) => setContacto({ ...contacto, direccion: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input
              className="input"
              value={contacto.telefono ?? ''}
              onChange={(e) => setContacto({ ...contacto, telefono: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              value={contacto.email ?? ''}
              onChange={(e) => setContacto({ ...contacto, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Facebook</label>
            <input className="input" value={contacto.redes?.facebook ?? ''} onChange={(e) => setRed('facebook', e.target.value)} />
          </div>
          <div>
            <label className="label">Instagram</label>
            <input className="input" value={contacto.redes?.instagram ?? ''} onChange={(e) => setRed('instagram', e.target.value)} />
          </div>
          <div>
            <label className="label">X (Twitter)</label>
            <input className="input" value={contacto.redes?.x ?? ''} onChange={(e) => setRed('x', e.target.value)} />
          </div>
          <div>
            <label className="label">YouTube</label>
            <input className="input" value={contacto.redes?.youtube ?? ''} onChange={(e) => setRed('youtube', e.target.value)} />
          </div>
          <div>
            <label className="label">{t('admin.config.mapa')}</label>
            <textarea
              className="input"
              rows={4}
              placeholder='Pega el código <iframe ...> de Google Maps (Compartir → Insertar un mapa)'
              value={contacto.mapa_embed ?? ''}
              onChange={(e) => setContacto({ ...contacto, mapa_embed: e.target.value })}
            />
            <p className="mt-1 text-xs text-zinc-500">
              En Google Maps: <b>Compartir → Insertar un mapa → Copiar HTML</b>, y pégalo aquí. Si pegas una URL normal
              de Maps, en la web se mostrará un botón “Ver ubicación” (Google no permite incrustar ese tipo de enlace).
            </p>
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="text-lg font-semibold">{t('admin.config.estadio')}</h2>
          <div>
            <label className="label">Nombre</label>
            <input
              className="input"
              value={estadio.nombre ?? ''}
              onChange={(e) => setEstadio({ ...estadio, nombre: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input
              className="input"
              value={estadio.direccion ?? ''}
              onChange={(e) => setEstadio({ ...estadio, direccion: e.target.value })}
            />
          </div>
          <RichTextEditor
            label="Información"
            value={estadio.info ?? ''}
            onChange={(html) => setEstadio({ ...estadio, info: html })}
          />
          <GalleryUploader
            value={estadio.fotos ?? []}
            onChange={(urls) => setEstadio({ ...estadio, fotos: urls })}
            folder="estadio"
            label={t('admin.config.fotos_estadio')}
          />
        </section>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { ContactoInfo, EstadioInfo } from '../../../types/db'
import Spinner from '../../../components/Spinner'
import GalleryUploader from '../../../components/admin/GalleryUploader'

export default function WebConfigPage() {
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
        <h1 className="text-2xl font-bold">Configuración web</h1>
        <button className="btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {ok && <p className="alert-ok mb-4">Guardado</p>}
      {error && <p className="alert-error mb-4">{error}</p>}

      <div className="space-y-6">
        <section className="card space-y-3 p-5">
          <h2 className="text-lg font-semibold">Inscripciones</h2>
          <div>
            <label className="label">URL de inscripciones</label>
            <input
              className="input"
              placeholder="https://…"
              value={inscripcionesUrl}
              onChange={(e) => setInscripcionesUrl(e.target.value)}
            />
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="text-lg font-semibold">Contacto</h2>
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
            <label className="label">Mapa</label>
            <textarea
              className="input"
              rows={4}
              placeholder="pega aquí el iframe o URL de Google Maps"
              value={contacto.mapa_embed ?? ''}
              onChange={(e) => setContacto({ ...contacto, mapa_embed: e.target.value })}
            />
          </div>
        </section>

        <section className="card space-y-3 p-5">
          <h2 className="text-lg font-semibold">Estadio</h2>
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
          <div>
            <label className="label">Información</label>
            <textarea
              className="input"
              rows={4}
              value={estadio.info ?? ''}
              onChange={(e) => setEstadio({ ...estadio, info: e.target.value })}
            />
          </div>
          <GalleryUploader
            value={estadio.fotos ?? []}
            onChange={(urls) => setEstadio({ ...estadio, fotos: urls })}
            folder="estadio"
            label="Fotos del estadio"
          />
        </section>
      </div>
    </div>
  )
}

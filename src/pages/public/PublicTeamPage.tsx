import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Equipo, Jugador, CuerpoTecnico } from '../../types/db'
import Spinner from '../../components/Spinner'
import { useLang } from '../../lib/i18n'

export default function PublicTeamPage() {
  const { t } = useLang()
  const { teamId } = useParams<{ teamId: string }>()
  const [equipo, setEquipo] = useState<Equipo | null>(null)
  const [jugadores, setJugadores] = useState<Jugador[]>([])
  const [tecnicos, setTecnicos] = useState<CuerpoTecnico[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!teamId) {
      setLoading(false)
      return
    }
    setLoading(true)
    Promise.all([
      supabase.from('equipos').select('*').eq('id', teamId).maybeSingle(),
      supabase.from('jugadores').select('*').eq('equipo_id', teamId).eq('activo', true).order('nombre_completo'),
      supabase.from('cuerpo_tecnico').select('*').eq('equipo_id', teamId).order('orden'),
    ]).then(([eq, ju, ct]) => {
      setEquipo((eq.data as Equipo) ?? null)
      setJugadores((ju.data as Jugador[]) ?? [])
      setTecnicos((ct.data as CuerpoTecnico[]) ?? [])
      setLoading(false)
    })
  }, [teamId])

  if (loading) return <Spinner label={t('state.loading')} />

  if (!equipo) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="card p-8 text-center text-zinc-600 dark:text-zinc-300">
          <p className="mb-4">{t('team.not_found')}</p>
          <Link to="/area-deportiva" className="btn-secondary inline-block">
            {t('action.volver')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article>
      {/* Hero del equipo */}
      <header className="relative isolate overflow-hidden bg-black text-white">
        {equipo.foto_url ? (
          <img src={equipo.foto_url} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 bg-stripes-gold opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/40" />
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <Link to="/area-deportiva" className="text-sm text-gold hover:underline">
            {t('team.back')}
          </Link>
          <span className="mt-4 block text-xs uppercase tracking-widest text-gold">{equipo.categoria}</span>
          <h1 className="h-display text-5xl text-shadow text-white sm:text-7xl">{equipo.nombre}</h1>
          {equipo.temporada && <p className="mt-2 text-zinc-300">{t('area.temporada')} {equipo.temporada}</p>}
          {equipo.descripcion && <p className="mt-4 max-w-2xl text-lg text-zinc-200 text-balance">{equipo.descripcion}</p>}
        </div>
        <div className="diagonal-divider" />
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <section className="mb-12">
          <span className="eyebrow">{t('team.jugadores_eyebrow')}</span>
          <h2 className="section-title mb-6 text-3xl">{t('team.jugadores_title')}</h2>
          {jugadores.length === 0 ? (
            <div className="card p-6 text-center text-zinc-500 dark:text-zinc-400">{t('team.jugadores_empty')}</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {jugadores.map((j, i) => (
                <div
                  key={j.id}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className="card-hover group animate-fade-up overflow-hidden p-0"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {j.foto_url ? (
                      <img src={j.foto_url} alt={j.nombre_completo} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                        <img src="/club-crest.png" alt="" className="h-20 w-20 opacity-30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    {j.dorsal != null && (
                      <span className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-gold-grad text-base font-extrabold text-zinc-950 shadow-gold">
                        {j.dorsal}
                      </span>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <p className="text-shadow font-extrabold">{j.nombre_completo}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <span className="eyebrow">{t('team.cuerpo_eyebrow')}</span>
          <h2 className="section-title mb-6 text-3xl">{t('team.cuerpo_title')}</h2>
          {tecnicos.length === 0 ? (
            <div className="card p-6 text-center text-zinc-500 dark:text-zinc-400">{t('team.cuerpo_empty')}</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {tecnicos.map((m, i) => (
                <div
                  key={m.id}
                  style={{ animationDelay: `${i * 40}ms` }}
                  className="card-hover group animate-fade-up overflow-hidden p-0"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {m.foto_url ? (
                      <img src={m.foto_url} alt={m.nombre} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                        <img src="/club-crest.png" alt="" className="h-16 w-16 opacity-30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-zinc-900 dark:text-white">{m.nombre}</p>
                    <p className="text-xs uppercase tracking-wider text-gold">{m.cargo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </article>
  )
}

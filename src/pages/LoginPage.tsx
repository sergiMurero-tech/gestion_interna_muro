import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../lib/i18n'
import LanguageToggle from '../components/LanguageToggle'

export default function LoginPage() {
  const { t } = useLang()
  const { session, loading, signInWithDni, signInWithEmail } = useAuth()
  const [mode, setMode] = useState<'dni' | 'admin'>('dni')
  const [dni, setDni] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to="/gestion" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } =
      mode === 'dni'
        ? await signInWithDni(dni.trim())
        : await signInWithEmail(email.trim(), password)
    if (error) setError(error)
    setBusy(false)
  }

  return (
    <div className="relative isolate flex min-h-full items-center justify-center overflow-hidden bg-black p-4">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gold/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-red-600/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-stripes-gold opacity-10" aria-hidden />
      <div className="relative w-full max-w-sm animate-fade-up overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur p-6 shadow-2xl">
        <div className="absolute right-3 top-3 z-10"><LanguageToggle /></div>
        <div className="-mx-6 -mt-6 mb-6 border-b-4 border-gold bg-black px-6 pb-5 pt-6 text-center">
          <img src="/club-crest.png" alt="Escudo Muro CF" className="mx-auto mb-3 h-20 w-20 object-contain" />
          <h1 className="h-display text-2xl text-white">{t('login.titulo')}</h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-gold">
            {mode === 'dni' ? t('login.dni') : t('login.admin')}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'dni' ? (
            <div>
              <label className="label">{t('login.dni_label')}</label>
              <input
                className="input uppercase"
                placeholder="12345678Z"
                autoCapitalize="characters"
                autoComplete="username"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-zinc-400">{t('login.dni_help')}</p>
            </div>
          ) : (
            <>
              <div>
                <label className="label">{t('login.email_label')}</label>
                <input
                  type="email"
                  autoComplete="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">{t('login.password_label')}</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {error && <p className="alert-error">{error}</p>}

          <button type="submit" className="btn-primary w-full py-3 text-base" disabled={busy}>
            {busy ? t('login.entering') : t('login.enter')}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'dni' ? 'admin' : 'dni')
            setError(null)
          }}
          className="mt-4 w-full text-center text-sm text-gold hover:underline"
        >
          {mode === 'dni' ? t('login.toggle_admin') : t('login.toggle_dni')}
        </button>
      </div>
    </div>
  )
}

import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { session, loading, signInWithDni, signInWithEmail } = useAuth()
  const [mode, setMode] = useState<'dni' | 'admin'>('dni')
  const [dni, setDni] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

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
    <div className="flex min-h-full items-center justify-center bg-gradient-to-br from-muro to-muro-dark p-4">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-xl bg-muro text-2xl font-black text-white">
            M
          </div>
          <h1 className="text-xl font-bold">Gestión Interna Muro CF</h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'dni' ? 'Accede con tu DNI' : 'Acceso administrador'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'dni' ? (
            <div>
              <label className="label">DNI</label>
              <input
                className="input uppercase"
                placeholder="12345678Z"
                autoCapitalize="characters"
                autoComplete="username"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
              />
              <p className="mt-1 text-xs text-slate-500">Introduce tu DNI tal y como te dio de alta el club.</p>
            </div>
          ) : (
            <>
              <div>
                <label className="label">Email</label>
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
                <label className="label">Contraseña</label>
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

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'dni' ? 'admin' : 'dni')
            setError(null)
          }}
          className="mt-4 w-full text-center text-sm text-muro hover:underline"
        >
          {mode === 'dni' ? 'Acceso administrador' : '← Volver al acceso por DNI'}
        </button>
      </div>
    </div>
  )
}

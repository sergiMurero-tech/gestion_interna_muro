import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { session, loading, signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    if (mode === 'login') {
      const { error } = await signIn(email.trim(), password)
      if (error) setError(error)
    } else {
      const { error } = await signUp(email.trim(), password, nombre.trim())
      if (error) setError(error)
      else setInfo('Cuenta creada. Si ya puedes entrar, inicia sesión. Un administrador te asignará equipos.')
      if (!error) setMode('login')
    }
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
            {mode === 'login' ? 'Accede con tu cuenta' : 'Crea tu cuenta de entrenador'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="label">Nombre completo</label>
              <input className="input" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
            </div>
          )}
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
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {info && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{info}</p>}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? 'Procesando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login')
            setError(null)
            setInfo(null)
          }}
          className="mt-4 w-full text-center text-sm text-muro hover:underline"
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </button>
      </div>
    </div>
  )
}

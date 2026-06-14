import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/db'

interface AuthValue {
  session: Session | null
  profile: Profile | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, nombre: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    setProfile(data ?? null)
  }

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      setSession(data.session)
      if (data.session) await loadProfile(data.session.user.id)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession)
      if (newSession) await loadProfile(newSession.user.id)
      else setProfile(null)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthValue>(
    () => ({
      session,
      profile,
      loading,
      isAdmin: profile?.rol === 'admin' && profile.activo,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error ? translateAuthError(error.message) : null }
      },
      signUp: async (email, password, nombre) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { nombre } },
        })
        return { error: error ? translateAuthError(error.message) : null }
      },
      signOut: async () => {
        await supabase.auth.signOut()
        setProfile(null)
      },
      refreshProfile: async () => {
        if (session) await loadProfile(session.user.id)
      },
    }),
    [session, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function translateAuthError(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'Email o contraseña incorrectos.'
  if (/email not confirmed/i.test(msg)) return 'Debes confirmar tu email antes de entrar.'
  if (/user already registered/i.test(msg)) return 'Ya existe una cuenta con ese email.'
  if (/password should be at least/i.test(msg)) return 'La contraseña debe tener al menos 6 caracteres.'
  return msg
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}

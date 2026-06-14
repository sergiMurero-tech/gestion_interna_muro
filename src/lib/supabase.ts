import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Fail loud and early so a misconfigured deploy is obvious.
  throw new Error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Copia .env.example a .env.local y rellena los valores.',
  )
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Cliente aislado (sin persistencia y con storageKey propio) para que el admin
 * pueda crear cuentas de entrenador con signUp sin perder su propia sesión.
 */
export function createIsolatedClient() {
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: 'muro-provision',
    },
  })
}

export const LICENCIAS_BUCKET = 'licencias'

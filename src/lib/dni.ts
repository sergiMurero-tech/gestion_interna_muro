// Dominio sintético para los emails internos de los entrenadores.
// '.local' es un TLD reservado (RFC 6762): nunca se entregan correos.
const AUTH_EMAIL_DOMAIN = 'muro.local'

/** Normaliza un DNI/NIE: sin espacios ni guiones y en mayúsculas. */
export function normalizeDni(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

/** Email sintético derivado del DNI (identificador interno en Supabase Auth). */
export function dniToEmail(dni: string): string {
  return `${normalizeDni(dni).toLowerCase()}@${AUTH_EMAIL_DOMAIN}`
}

/** La contraseña interna es el propio DNI normalizado. */
export function dniToPassword(dni: string): string {
  return normalizeDni(dni)
}

export function isValidDni(raw: string): boolean {
  // DNI (8 cifras + letra) o NIE (X/Y/Z + 7 cifras + letra): 9 caracteres alfanuméricos.
  return /^[A-Z0-9]{9}$/.test(normalizeDni(raw))
}

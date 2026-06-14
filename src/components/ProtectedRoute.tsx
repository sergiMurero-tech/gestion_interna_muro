import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import Spinner from './Spinner'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <Spinner label="Cargando…" />
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />
  return <>{children}</>
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth()

  if (loading) return <Spinner label="Cargando…" />
  if (!session) return <Navigate to="/login" replace />
  if (profile?.rol !== 'admin' || !profile.activo) return <Navigate to="/" replace />
  return <>{children}</>
}

import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import TeamsPage from './pages/TeamsPage'
import TeamPlayersPage from './pages/TeamPlayersPage'
import PlayerDetailPage from './pages/PlayerDetailPage'
import DashboardPage from './pages/admin/DashboardPage'
import AdminTeamsPage from './pages/admin/AdminTeamsPage'
import AdminPlayersPage from './pages/admin/AdminPlayersPage'
import AdminLicensesPage from './pages/admin/AdminLicensesPage'
import AdminCoachesPage from './pages/admin/AdminCoachesPage'
import HistoryPage from './pages/admin/HistoryPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeamsPage />} />
        <Route path="equipos/:teamId" element={<TeamPlayersPage />} />
        <Route path="jugadores/:playerId" element={<PlayerDetailPage />} />

        <Route path="admin" element={<AdminRoute><DashboardPage /></AdminRoute>} />
        <Route path="admin/equipos" element={<AdminRoute><AdminTeamsPage /></AdminRoute>} />
        <Route path="admin/jugadores" element={<AdminRoute><AdminPlayersPage /></AdminRoute>} />
        <Route path="admin/licencias" element={<AdminRoute><AdminLicensesPage /></AdminRoute>} />
        <Route path="admin/entrenadores" element={<AdminRoute><AdminCoachesPage /></AdminRoute>} />
        <Route path="admin/historial" element={<AdminRoute><HistoryPage /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

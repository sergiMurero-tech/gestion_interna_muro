import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import PublicLayout from './components/public/PublicLayout'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'

// App interna (gestión)
import TeamsPage from './pages/TeamsPage'
import TeamPlayersPage from './pages/TeamPlayersPage'
import PlayerDetailPage from './pages/PlayerDetailPage'
import DashboardPage from './pages/admin/DashboardPage'
import AdminTeamsPage from './pages/admin/AdminTeamsPage'
import AdminPlayersPage from './pages/admin/AdminPlayersPage'
import AdminLicensesPage from './pages/admin/AdminLicensesPage'
import AdminCoachesPage from './pages/admin/AdminCoachesPage'
import HistoryPage from './pages/admin/HistoryPage'

// Gestión web (CMS)
import WebIndexPage from './pages/admin/web/WebIndexPage'
import WebNoticiasPage from './pages/admin/web/WebNoticiasPage'
import WebPaginasPage from './pages/admin/web/WebPaginasPage'
import WebPatrocinadoresPage from './pages/admin/web/WebPatrocinadoresPage'
import WebDirectivaPage from './pages/admin/web/WebDirectivaPage'
import WebMenuPage from './pages/admin/web/WebMenuPage'
import WebConfigPage from './pages/admin/web/WebConfigPage'

// Web pública
import PublicHome from './pages/public/PublicHome'
import NoticiasPage from './pages/public/NoticiasPage'
import NoticiaDetailPage from './pages/public/NoticiaDetailPage'
import ClubIndexPage from './pages/public/ClubIndexPage'
import CmsPage from './pages/public/CmsPage'
import DirectivaPage from './pages/public/DirectivaPage'
import EstadioPage from './pages/public/EstadioPage'
import PatrocinadoresPage from './pages/public/PatrocinadoresPage'
import ContactoPage from './pages/public/ContactoPage'
import AreaDeportivaPage from './pages/public/AreaDeportivaPage'
import PublicTeamPage from './pages/public/PublicTeamPage'
import InscripcionesRedirect from './pages/public/InscripcionesRedirect'

export default function App() {
  return (
    <Routes>
      {/* ---------- Web pública ---------- */}
      <Route element={<PublicLayout />}>
        <Route index element={<PublicHome />} />
        <Route path="noticias" element={<NoticiasPage />} />
        <Route path="noticias/:slug" element={<NoticiaDetailPage />} />
        <Route path="club" element={<ClubIndexPage />} />
        <Route path="club/historia" element={<CmsPage slug="historia" />} />
        <Route path="club/directiva" element={<DirectivaPage />} />
        <Route path="club/estadio" element={<EstadioPage />} />
        <Route path="club/patrocinadores" element={<PatrocinadoresPage />} />
        <Route path="club/contacto" element={<ContactoPage />} />
        <Route path="area-deportiva" element={<AreaDeportivaPage />} />
        <Route path="area-deportiva/:teamId" element={<PublicTeamPage />} />
        <Route path="inscripciones" element={<InscripcionesRedirect />} />
        <Route path="p/:slug" element={<CmsPage />} />
      </Route>

      {/* ---------- Acceso ---------- */}
      <Route path="/acceso" element={<LoginPage />} />

      {/* ---------- Gestión interna (protegida) ---------- */}
      <Route
        path="/gestion"
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

        <Route path="web" element={<AdminRoute><WebIndexPage /></AdminRoute>} />
        <Route path="web/noticias" element={<AdminRoute><WebNoticiasPage /></AdminRoute>} />
        <Route path="web/paginas" element={<AdminRoute><WebPaginasPage /></AdminRoute>} />
        <Route path="web/patrocinadores" element={<AdminRoute><WebPatrocinadoresPage /></AdminRoute>} />
        <Route path="web/directiva" element={<AdminRoute><WebDirectivaPage /></AdminRoute>} />
        <Route path="web/menu" element={<AdminRoute><WebMenuPage /></AdminRoute>} />
        <Route path="web/config" element={<AdminRoute><WebConfigPage /></AdminRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LangProvider } from './lib/i18n'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'

export default function Root() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LangProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </LangProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

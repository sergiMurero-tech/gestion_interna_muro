import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const root = createRoot(document.getElementById('root')!)

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function ConfigError() {
  return (
    <div className="flex min-h-full items-center justify-center p-4">
      <div className="card max-w-md p-6">
        <h1 className="text-lg font-bold text-red-700">Configuración incompleta</h1>
        <p className="mt-2 text-sm text-slate-600">
          Faltan las variables de entorno de Supabase, así que la app no puede arrancar.
        </p>
        <ul className="mt-3 list-inside list-disc text-sm text-slate-600">
          <li>
            <code>VITE_SUPABASE_URL</code>: {url ? 'OK' : 'FALTA'}
          </li>
          <li>
            <code>VITE_SUPABASE_ANON_KEY</code>: {anonKey ? 'OK' : 'FALTA'}
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          Añádelas en Vercel (<em>Settings → Environment Variables</em>) y vuelve a desplegar
          (<em>Deployments → Redeploy</em>). Las variables solo se aplican en compilaciones nuevas.
        </p>
      </div>
    </div>
  )
}

if (!url || !anonKey) {
  root.render(
    <StrictMode>
      <ConfigError />
    </StrictMode>,
  )
} else {
  // Carga la app solo si la configuración es válida (evita el crash al crear el cliente).
  import('./Root')
    .then(({ default: Root }) => {
      root.render(
        <StrictMode>
          <Root />
        </StrictMode>,
      )
    })
    .catch((err) => {
      root.render(
        <div style={{ padding: 16, fontFamily: 'system-ui' }}>
          <h1>Error al cargar la aplicación</h1>
          <pre>{String(err)}</pre>
        </div>,
      )
    })
}

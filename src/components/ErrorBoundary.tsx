import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error no controlado:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="card max-w-md p-6">
            <h1 className="text-lg font-bold text-red-400">Se ha producido un error</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              La aplicación ha fallado al cargar. Prueba a recargar la página. Si persiste, envía esta información al
              administrador:
            </p>
            <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-zinc-100 dark:bg-zinc-800 p-3 text-xs text-zinc-700 dark:text-zinc-200">
              {this.state.error.message}
            </pre>
            <button className="btn-primary mt-4 w-full" onClick={() => location.reload()}>
              Recargar
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

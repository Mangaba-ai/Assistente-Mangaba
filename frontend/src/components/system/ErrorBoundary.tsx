import { Component, ErrorInfo, ReactNode } from 'react'
import Button from '../ui/Button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Algo deu errado
              </h2>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Ocorreu um erro inesperado. Por favor, tente novamente.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left mb-4">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Detalhes do erro
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="space-y-2">
              <Button onClick={this.handleReset} className="w-full">
                Tentar novamente
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Recarregar página
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
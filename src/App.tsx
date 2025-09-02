import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './stores/themeStore'
import { AuthProvider } from './contexts/AuthContext'
import WelcomeScreen from './components/auth/WelcomeScreen'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Layout from './components/layout/Layout'
import { Hubs, Chat } from './pages'
import './index.css'

function App() {
  const { theme } = useThemeStore()

  // Função para obter o tema efetivo (resolve 'system' para 'light' ou 'dark')
  const getEffectiveTheme = () => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }

  const effectiveTheme = getEffectiveTheme()

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Rota pública para usuários não autenticados */}
          <Route path="/" element={<WelcomeScreen />} />
          
          {/* Rotas protegidas com layout */}
          <Route 
            path="/app" 
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Dashboard/Hubs como rota padrão dentro do app */}
            <Route index element={<Hubs />} />
            <Route path="dashboard" element={<Hubs />} />
            <Route path="chat" element={<Chat />} />
          </Route>
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: effectiveTheme === 'dark' ? '#1f2937' : '#ffffff',
              color: effectiveTheme === 'dark' ? '#f9fafb' : '#111827',
              border: effectiveTheme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
            },
            success: {
              style: {
                background: effectiveTheme === 'dark' ? 'hsl(120 20% 10%)' : 'hsl(120 30% 95%)',
                color: effectiveTheme === 'dark' ? 'hsl(120 50% 40%)' : 'hsl(120 50% 50%)',
                border: effectiveTheme === 'dark' ? '1px solid hsl(120 50% 40%)' : '1px solid hsl(120 50% 50%)',
              },
            },
            error: {
              style: {
                background: effectiveTheme === 'dark' ? 'hsl(0 20% 10%)' : 'hsl(0 30% 95%)',
                color: effectiveTheme === 'dark' ? 'hsl(0 70% 40%)' : 'hsl(0 70% 50%)',
                border: effectiveTheme === 'dark' ? '1px solid hsl(0 70% 40%)' : '1px solid hsl(0 70% 50%)',
              },
            },
            loading: {
              style: {
                background: effectiveTheme === 'dark' ? 'hsl(45 30% 10%)' : 'hsl(45 50% 95%)',
                color: effectiveTheme === 'dark' ? 'hsl(45 90% 50%)' : 'hsl(45 90% 60%)',
                border: effectiveTheme === 'dark' ? '1px solid hsl(45 90% 50%)' : '1px solid hsl(45 90% 60%)',
              },
            },
          }}
        />
      </div>
    </AuthProvider>
  )
}

export default App
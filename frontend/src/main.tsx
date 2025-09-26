import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { useThemeStore } from './stores/themeStore'
import { applyTheme } from './utils/theme'
import './index.css'

// Inicializar tema a partir do store
const initializeApp = () => {
  const { theme } = useThemeStore.getState()
  applyTheme(theme)
}

// Inicializar tema antes de renderizar
initializeApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
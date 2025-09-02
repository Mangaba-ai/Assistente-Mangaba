// Utilitários para gerenciamento de tema
import type { Theme } from '../types'
import { getTheme, setTheme } from './storage'
import { THEME_COLORS } from '../constants'

// Aplicar tema ao documento
export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement
  
  // Remover classes de tema existentes
  root.classList.remove('light', 'dark')
  
  if (theme === 'system') {
    // Usar preferência do sistema
    const systemTheme = getSystemTheme()
    root.classList.add(systemTheme)
  } else {
    root.classList.add(theme)
  }
  
  // Salvar tema no storage
  setTheme(theme)
  
  // Disparar evento personalizado
  window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }))
}

// Obter tema do sistema
export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

// Obter tema atual
export const getCurrentTheme = (): Theme => {
  return getTheme() as Theme || 'system'
}

// Alternar tema
export const toggleTheme = (): Theme => {
  const currentTheme = getCurrentTheme()
  
  let newTheme: Theme
  switch (currentTheme) {
    case 'light':
      newTheme = 'dark'
      break
    case 'dark':
      newTheme = 'system'
      break
    case 'system':
    default:
      newTheme = 'light'
      break
  }
  
  applyTheme(newTheme)
  return newTheme
}

// Verificar se o tema atual é escuro
export const isDarkTheme = (): boolean => {
  const theme = getCurrentTheme()
  
  if (theme === 'dark') return true
  if (theme === 'light') return false
  
  // Se for 'system', verificar preferência do sistema
  return getSystemTheme() === 'dark'
}

// Obter cores do tema atual
export const getThemeColors = () => {
  const isDark = isDarkTheme()
  return isDark ? THEME_COLORS.dark : THEME_COLORS.light
}

// Inicializar tema
export const initializeTheme = (): void => {
  const savedTheme = getCurrentTheme()
  applyTheme(savedTheme)
  
  // Escutar mudanças na preferência do sistema
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = () => {
      const currentTheme = getCurrentTheme()
      if (currentTheme === 'system') {
        applyTheme('system')
      }
    }
    
    // Usar addEventListener se disponível, senão usar addListener (compatibilidade)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange)
    } else {
      mediaQuery.addListener(handleSystemThemeChange)
    }
  }
}

// Hook para escutar mudanças de tema
export const onThemeChange = (callback: (theme: Theme) => void): (() => void) => {
  const handleThemeChange = (event: CustomEvent) => {
    callback(event.detail.theme)
  }
  
  window.addEventListener('themeChange', handleThemeChange as EventListener)
  
  // Retornar função de cleanup
  return () => {
    window.removeEventListener('themeChange', handleThemeChange as EventListener)
  }
}

// Obter classe CSS para o tema
export const getThemeClass = (theme?: Theme): string => {
  const currentTheme = theme || getCurrentTheme()
  
  if (currentTheme === 'system') {
    return getSystemTheme()
  }
  
  return currentTheme
}

// Verificar se o navegador suporta preferência de tema
export const supportsSystemTheme = (): boolean => {
  return typeof window !== 'undefined' && 
         window.matchMedia && 
         typeof window.matchMedia('(prefers-color-scheme: dark)').matches === 'boolean'
}

// Obter meta tag de cor do tema
export const getThemeMetaColor = (): string => {
  const colors = getThemeColors()
  return colors.background
}

// Atualizar meta tag de cor do tema
export const updateThemeMetaColor = (): void => {
  if (typeof document === 'undefined') return
  
  const metaThemeColor = document.querySelector('meta[name="theme-color"]')
  const color = getThemeMetaColor()
  
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', color)
  } else {
    const meta = document.createElement('meta')
    meta.name = 'theme-color'
    meta.content = color
    document.head.appendChild(meta)
  }
}

// Aplicar transição suave ao mudar tema
export const applyThemeTransition = (): void => {
  if (typeof document === 'undefined') return
  
  const css = document.createElement('style')
  css.textContent = `
    *,
    *::before,
    *::after {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease !important;
    }
  `
  
  document.head.appendChild(css)
  
  // Remover após a transição
  setTimeout(() => {
    document.head.removeChild(css)
  }, 300)
}

// Obter configuração completa do tema
export const getThemeConfig = () => {
  const currentTheme = getCurrentTheme()
  const isDark = isDarkTheme()
  const colors = getThemeColors()
  const systemTheme = getSystemTheme()
  
  return {
    current: currentTheme,
    resolved: currentTheme === 'system' ? systemTheme : currentTheme,
    isDark,
    colors,
    systemTheme,
    supportsSystem: supportsSystemTheme()
  }
}
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../constants'
import { applyTheme } from '../utils/theme'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggleTheme: () => {
        const currentTheme = get().theme
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
        
        set({ theme: newTheme })
        applyTheme(newTheme)
      },
    }),
    {
      name: STORAGE_KEYS.theme,
    }
  )
)
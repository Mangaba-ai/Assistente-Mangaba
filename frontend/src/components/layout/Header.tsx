import React from 'react'
import Button from '../ui/Button'

interface HeaderProps {
  title?: string
  onMenuClick?: () => void
  onProfileClick?: () => void
  className?: string
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Mangaba Assistente',
  onMenuClick,
  onProfileClick,
  className = ''
}) => {
  return (
    <header className={`bg-background border-b border-border ${className}`}>
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center space-x-4">
          {onMenuClick && (
            <Button
              variant="ghost"
              onClick={onMenuClick}
              className="p-2 lg:hidden"
              title="Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-foreground">
              {title}
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            className="p-2"
            title="Alternar tema"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </Button>
          
          {/* Profile */}
          {onProfileClick && (
            <Button
              variant="ghost"
              onClick={onProfileClick}
              className="p-2"
              title="Perfil"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
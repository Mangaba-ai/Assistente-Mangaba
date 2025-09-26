import React from 'react'

interface FooterProps {
  className?: string
}

export const Footer: React.FC<FooterProps> = ({
  className = ''
}) => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={`bg-background border-t border-border ${className}`}>
      <div className="px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
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
            <span className="text-sm text-muted-foreground">
              © {currentYear} Mangaba Assistente. Todos os direitos reservados.
            </span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacidade
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Termos
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Suporte
            </a>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Desenvolvido com ❤️ para facilitar suas conversas com IA
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
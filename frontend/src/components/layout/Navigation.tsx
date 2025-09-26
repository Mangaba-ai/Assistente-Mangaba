import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface NavigationItem {
  label: string
  href: string
  icon?: React.ReactNode
  isActive?: boolean
}

interface NavigationProps {
  items?: NavigationItem[]
  className?: string
  vertical?: boolean
}

const defaultItems: NavigationItem[] = [
  {
    label: 'Chat',
    href: '/chat',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  {
    label: 'Hubs',
    href: '/hubs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    label: 'Configurações',
    href: '/settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
]

export const Navigation: React.FC<NavigationProps> = ({
  items = defaultItems,
  className = '',
  vertical = false
}) => {
  const location = useLocation()

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/')
  }

  return (
    <nav className={`${className}`}>
      <ul className={`flex ${vertical ? 'flex-col space-y-1' : 'flex-row space-x-1'}`}>
        {items.map((item) => {
          const active = item.isActive ?? isActive(item.href)
          
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                } ${vertical ? 'w-full justify-start' : 'justify-center'}`}
              >
                {item.icon && (
                  <span className={`${vertical && item.label ? 'mr-3' : ''}`}>
                    {item.icon}
                  </span>
                )}
                {(vertical || !item.icon) && (
                  <span>{item.label}</span>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default Navigation
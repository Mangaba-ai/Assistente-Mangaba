import React from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
  isActive?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  className = ''
}) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          
          return (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground">
                  {separator}
                </span>
              )}
              
              {item.href || item.onClick ? (
                <a
                  href={item.href}
                  onClick={item.onClick}
                  className={`text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 ${
                    item.isActive || isLast
                      ? 'text-muted-foreground cursor-default'
                      : 'text-foreground hover:underline cursor-pointer'
                  }`}
                  aria-current={item.isActive || isLast ? 'page' : undefined}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={`text-sm font-medium ${
                    item.isActive || isLast
                      ? 'text-muted-foreground'
                      : 'text-foreground'
                  }`}
                  aria-current={item.isActive || isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'
  
  const variantClasses = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-success-subtle text-success border border-success/20',
    warning: 'bg-warning-subtle text-warning border border-warning/20',
    danger: 'bg-error-subtle text-error border border-error/20'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-sm'
  }
  
  const badgeClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
  
  return (
    <span className={badgeClasses}>
      {children}
    </span>
  )
}

export default Badge
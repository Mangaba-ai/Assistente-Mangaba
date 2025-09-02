import React from 'react'

interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl'
  }
  
  const baseClasses = `inline-flex items-center justify-center rounded-full bg-gray-500 ${sizeClasses[size]} ${className}`
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  
  if (src) {
    return (
      <img
        className={`${baseClasses} object-cover`}
        src={src}
        alt={alt || name || 'Avatar'}
      />
    )
  }
  
  return (
    <span className={`${baseClasses} text-white font-medium`}>
      {name ? getInitials(name) : '?'}
    </span>
  )
}

export default Avatar
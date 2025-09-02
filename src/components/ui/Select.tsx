import React from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  className = ''
}) => {
  const selectId = `select-${Math.random().toString(36).substr(2, 9)}`
  
  const baseClasses = 'block w-full rounded-md border-border bg-background text-foreground shadow-sm focus:border-ring focus:ring-ring sm:text-sm'
  const errorClasses = error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
  const selectClasses = `${baseClasses} ${errorClasses} ${className}`
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
      )}
      
      <select
        id={selectId}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={selectClasses}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default Select
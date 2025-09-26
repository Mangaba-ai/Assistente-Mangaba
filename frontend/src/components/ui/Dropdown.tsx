import React, { useState, useRef, useEffect } from 'react'

interface DropdownOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface DropdownProps {
  options: DropdownOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const selectedOption = options.find(option => option.value === value)
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  
  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }
  
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm ${
          disabled ? 'bg-gray-50 text-gray-500' : ''
        }`}
      >
        <span className="flex items-center">
          {selectedOption?.icon && (
            <span className="mr-2">{selectedOption.icon}</span>
          )}
          <span className="block truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3z" clipRule="evenodd" />
          </svg>
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
          <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {options.map((option) => (
              <li
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-600 hover:text-white ${
                  value === option.value ? 'bg-blue-600 text-white' : 'text-gray-900'
                }`}
              >
                <div className="flex items-center">
                  {option.icon && (
                    <span className="mr-2">{option.icon}</span>
                  )}
                  <span className="block truncate font-normal">
                    {option.label}
                  </span>
                </div>
                {value === option.value && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Dropdown
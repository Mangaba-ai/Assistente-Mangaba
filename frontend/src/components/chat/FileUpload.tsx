import React, { useRef } from 'react'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  multiple?: boolean
  accept?: string
  className?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  disabled = false,
  multiple = false,
  accept = '*/*',
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      onFilesSelected(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Anexar arquivo"
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
            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
          />
        </svg>
      </button>
    </>
  )
}

export default FileUpload
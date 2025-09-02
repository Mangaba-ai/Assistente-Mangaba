import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../ui/Button'

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>
  isLoading?: boolean
  error?: string
  success?: boolean
  className?: string
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  success = false,
  className = ''
}) => {
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(email)
  }

  if (success) {
    return (
      <div className={`w-full max-w-md ${className}`}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <svg
              className="h-6 w-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Email enviado!
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Enviamos um link para redefinir sua senha para <strong>{email}</strong>.
            Verifique sua caixa de entrada e spam.
          </p>
          
          <Link
            to="/auth/login"
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Voltar para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full max-w-md ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Esqueceu a senha?
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Digite seu email para receber um link de redefinição
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="seu@email.com"
            disabled={isLoading}
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="w-full"
        >
          {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/auth/login"
          className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  )
}

export default ForgotPasswordForm
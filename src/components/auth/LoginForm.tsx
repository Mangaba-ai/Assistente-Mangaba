import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onClose?: () => void
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onClose }) => {
  const { login, isLoading } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await login(formData.email, formData.password)
      onClose?.()
      navigate('/app')
    } catch (error) {
      // Error is already handled in the login function
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full">
          <LogIn className="w-8 h-8 text-gray-600 dark:text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Entrar na sua conta
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Bem-vindo de volta! Entre com suas credenciais.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.email ? 'border-gray-500' : 'border-gray-300'
              }`}
              placeholder="seu@email.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.password ? 'border-gray-500' : 'border-gray-300'
              }`}
              placeholder="Sua senha"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              ) : (
                <Eye className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-800"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Lembrar de mim
            </label>
          </div>

          <div className="text-sm">
            <button
              type="button"
              className="font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => toast('Funcionalidade em desenvolvimento')}
            >
              Esqueceu a senha?
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Entrando...
            </div>
          ) : (
            'Entrar'
          )}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Não tem uma conta?
            </span>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
          >
            Criar nova conta
          </button>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface RegisterFormProps {
  onSwitchToLogin: () => void
  onClose?: () => void
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onClose }) => {
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [acceptTerms, setAcceptTerms] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) {
      newErrors.name = 'Nome é obrigatório'
    } else if (formData.name.length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    if (!acceptTerms) {
      newErrors.terms = 'Você deve aceitar os termos de uso'
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
      await register(formData.name, formData.email, formData.password)
      onClose?.()
      navigate('/app')
    } catch (error) {
      // Error is already handled in the register function
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

  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[^\w\s]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(formData.password)
  const strengthLabels = ['Muito fraca', 'Fraca', 'Regular', 'Boa', 'Forte']
  const strengthColors = ['bg-gray-300', 'bg-gray-400', 'bg-gray-500', 'bg-gray-600', 'bg-gray-700']

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-muted rounded-full">
          <UserPlus className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Criar nova conta
        </h2>
        <p className="text-muted-foreground">
          Junte-se a nós e comece a usar o Mangaba Assistente.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Nome completo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground ${
              errors.name ? 'border-destructive' : 'border-border'
            }`}
              placeholder="Seu nome completo"
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-3 py-3 border rounded-lg shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground ${
              errors.email ? 'border-destructive' : 'border-border'
            }`}
              placeholder="seu@email.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-destructive">{errors.email}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
            Senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-foreground ${
              errors.password ? 'border-destructive' : 'border-border'
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
          
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      strengthColors[Math.max(0, passwordStrength - 1)]
                    }`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {strengthLabels[Math.max(0, passwordStrength - 1)]}
                </span>
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">{errors.password}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirmar senha
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`block w-full pl-10 pr-10 py-3 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.confirmPassword ? 'border-gray-500' : 'border-gray-300'
              }`}
              placeholder="Confirme sua senha"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{errors.confirmPassword}</p>
          )}
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked)
                if (errors.terms) {
                  setErrors(prev => ({ ...prev, terms: '' }))
                }
              }}
              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-800"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="terms" className="text-gray-700 dark:text-gray-300">
              Eu aceito os{' '}
              <button
                type="button"
                className="font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => toast('Termos de uso em desenvolvimento')}
              >
                termos de uso
              </button>
              {' '}e a{' '}
              <button
                type="button"
                className="font-medium text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => toast('Política de privacidade em desenvolvimento')}
              >
                política de privacidade
              </button>
            </label>
          </div>
        </div>
        {errors.terms && (
          <p className="text-sm text-gray-600 dark:text-gray-400">{errors.terms}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Criando conta...
            </div>
          ) : (
            'Criar conta'
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
              Já tem uma conta?
            </span>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800"
          >
            Entrar na conta existente
          </button>
        </div>
      </div>
    </div>
  )
}

export default RegisterForm
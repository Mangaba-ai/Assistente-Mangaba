import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MessageSquare, 
  Sparkles, 
  Users, 
  Zap, 
  Shield, 
  LogIn, 
  UserPlus,
  ArrowRight,
  Bot,
  Brain,
  Globe,
  Star,
  CheckCircle,
  Rocket,
  Heart,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'
import AuthModal from './AuthModal'
import { useThemeStore } from '../../stores/themeStore'
import { useAuth } from '../../contexts/AuthContext'

const WelcomeScreen = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const { theme, setTheme } = useThemeStore()
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  // Redirecionar usuários autenticados para o app
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/app')
    }
  }, [isAuthenticated, isLoading, navigate])

  const handleLogin = () => {
    setAuthMode('login')
    setIsAuthModalOpen(true)
  }

  const handleRegister = () => {
    setAuthMode('register')
    setIsAuthModalOpen(true)
  }

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'] as const
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    const newTheme = themes[nextIndex]
    setTheme(newTheme)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return Sun
      case 'dark':
        return Moon
      case 'system':
      default:
        return Monitor
    }
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Claro'
      case 'dark':
        return 'Escuro'
      case 'system':
      default:
        return 'Sistema'
    }
  }

  const features = [
    {
      icon: Bot,
      title: 'Agentes Inteligentes',
      description: 'Crie e personalize agentes de IA especializados para diferentes tarefas e domínios',
      color: 'text-green-500'
    },
    {
      icon: Users,
      title: 'Hubs Colaborativos',
      description: 'Organize seus agentes em hubs temáticos e colabore com sua equipe em tempo real',
      color: 'text-muted-foreground'
    },
    {
      icon: Brain,
      title: 'IA Avançada',
      description: 'Powered by Ollama - modelos de linguagem de última geração rodando localmente',
      color: 'text-green-600'
    },
    {
      icon: Shield,
      title: 'Seguro e Privado',
      description: 'Seus dados ficam seguros com criptografia de ponta a ponta e processamento local',
      color: 'text-red-500'
    },
    {
      icon: Zap,
      title: 'Rápido e Eficiente',
      description: 'Interface moderna e responsiva otimizada para máxima produtividade',
      color: 'text-yellow-500'
    },
    {
      icon: Globe,
      title: 'Acesso Universal',
      description: 'Acesse de qualquer lugar, a qualquer hora, em qualquer dispositivo conectado',
      color: 'text-muted-foreground'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Usuários Ativos' },
    { number: '50K+', label: 'Conversas Criadas' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Suporte' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex flex-col relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2760%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23666666%27 fill-opacity=%270.02%27%3E%3Ccircle cx=%2730%27 cy=%2730%27 r=%271%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-border bg-background/80 dark:bg-background/80 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                 <div className="w-10 h-10 bg-gray-100 dark:bg-card rounded-xl flex items-center justify-center shadow-sm">
                   <Sparkles className="w-6 h-6 text-green-500" />
                 </div>
                 <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background dark:border-background"></div>
               </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Mangaba AI</h1>
                <p className="text-xs text-muted-foreground">Powered by Ollama</p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent rounded-lg transition-all duration-200 border border-border"
                title={`Tema: ${getThemeLabel()}`}
              >
                {React.createElement(getThemeIcon(), { size: 16 })}
                <span className="hidden sm:inline">{getThemeLabel()}</span>
              </button>
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-foreground hover:bg-gray-100 dark:hover:bg-accent rounded-lg transition-all duration-200 border border-gray-200 dark:border-border"
              >
                <LogIn size={16} />
                Entrar
              </button>
              <button
                onClick={handleRegister}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-500 text-foreground hover:bg-green-600 rounded-lg transition-all duration-200 shadow-sm"
              >
                <UserPlus size={16} />
                Cadastrar
              </button>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-card rounded-2xl flex items-center justify-center border border-gray-200 dark:border-border">
                    <MessageSquare className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm">
                    <Sparkles className="w-3 h-3 text-foreground" />
                  </div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
              </div>
              
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <span className="text-foreground">Bem-vindo ao </span>
                <span className="text-green-600 dark:text-green-400">
                  Mangaba AI
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Sua plataforma inteligente para criar, gerenciar e colaborar com agentes de IA. 
                 <span className="text-foreground font-medium">Transforme suas ideias em conversas produtivas.</span>
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <button
                  onClick={handleRegister}
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-green-500 text-white hover:bg-green-600 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Rocket size={20} />
                  Começar Agora
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleLogin}
                  className="flex items-center justify-center gap-3 px-8 py-4 border-2 border-border text-foreground hover:bg-accent rounded-xl font-medium transition-all duration-200"
                >
                  <LogIn size={20} />
                  Já tenho conta
                </button>
              </motion.div>

              {/* Stats */}
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-foreground mb-1">{stat.number}</div>
                    <div className="text-muted-foreground text-sm">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-800 relative z-10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-foreground mb-4">
                 Recursos <span className="text-green-600 dark:text-green-400">Principais</span>
               </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Descubra tudo o que você pode fazer com o Mangaba AI
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="group bg-background dark:bg-background border border-gray-200 dark:border-border rounded-xl p-6 hover:shadow-md transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-gray-100 dark:bg-card rounded-xl flex items-center justify-center mb-4">
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-background dark:bg-background rounded-2xl p-8 border border-gray-200 dark:border-border shadow-sm"
            >
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-4">
                 Pronto para <span className="text-green-600 dark:text-green-400">começar?</span>
               </h2>
              <p className="text-gray-600 dark:text-foreground mb-8 text-lg">
                Junte-se a milhares de usuários que já estão transformando suas ideias em realidade
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleRegister}
                  className="group flex items-center justify-center gap-3 px-8 py-3 bg-green-500 text-foreground hover:bg-green-600 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Heart className="w-5 h-5 text-red-100" />
                  Criar Conta Gratuita
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center gap-2 text-gray-500 dark:text-foreground text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Sem cartão de crédito</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-border bg-background dark:bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gray-100 dark:bg-card rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-gray-900 dark:text-foreground font-medium">Mangaba AI</span>
            </div>
            <div className="text-center text-sm text-gray-500 dark:text-foreground">
              © 2024 Mangaba AI. Todos os direitos reservados. Feito com <span className="text-red-500">❤️</span> para a comunidade.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  )
}

export default WelcomeScreen
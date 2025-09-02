import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  MessageSquare,
  Settings,
  Trash2,
  Edit3,
  Moon,
  Sun,
  User,
  Search,
  Share2,
  MoreHorizontal,
  LogIn,
  LogOut,
  Menu,
  X,
  GitBranch
} from 'lucide-react'
import { useChatStore } from '../stores/chatStore'
import { useThemeStore } from '../stores/themeStore'
import { useSidebarStore } from '../stores/sidebarStore'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './auth/AuthModal'
import UserProfile from './auth/UserProfile'
import HubSelector from './HubSelector'
import { cn } from '../utils/cn'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const Sidebar = () => {
  const {
    chats,
    currentChatId,
    createChat,
    deleteChat,
    setCurrentChat,
    getSelectedHub,
    getSelectedAgent
  } = useChatStore()
  
  const { theme, toggleTheme } = useThemeStore()
  const { isCollapsed, toggleSidebar } = useSidebarStore()
  const { user, logout } = useAuth()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showChatOptions, setShowChatOptions] = useState<string | null>(null)

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [showUserProfile, setShowUserProfile] = useState(false)
  
  const selectedHub = getSelectedHub()
  const selectedAgent = getSelectedAgent()
  
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const handleNewChat = async () => {
    try {
      await createChat(selectedHub?.id, selectedAgent?.id)
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }
  
  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteChat(chatId)
  }
  

  
  const handleLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }
  
  const handleRegister = () => {
    setAuthMode('register')
    setShowAuthModal(true)
  }
  
  const groupChatsByDate = (chats: typeof filteredChats) => {
    const today = new Date()
    const groups = {
      today: [] as typeof chats,
      yesterday: [] as typeof chats,
      thisWeek: [] as typeof chats,
      thisMonth: [] as typeof chats,
      older: [] as typeof chats
    }
    
    chats.forEach(chat => {
      const chatDate = new Date(chat.updatedAt)
      const diffDays = Math.floor((today.getTime() - chatDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDays === 0) {
        groups.today.push(chat)
      } else if (diffDays === 1) {
        groups.yesterday.push(chat)
      } else if (diffDays <= 7) {
        groups.thisWeek.push(chat)
      } else if (diffDays <= 30) {
        groups.thisMonth.push(chat)
      } else {
        groups.older.push(chat)
      }
    })
    
    return groups
  }
  
  const chatGroups = groupChatsByDate(filteredChats)
  
  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      <div className={cn(
        "bg-background dark:bg-card border-r border-border flex flex-col h-full transition-all duration-300",
        "absolute inset-y-0 left-0",
        isCollapsed ? "w-16" : "w-80",
        "lg:translate-x-0",
        isCollapsed ? "-translate-x-full lg:translate-x-0" : "translate-x-0"
      )} style={{ position: 'absolute', zIndex: 999 }}>
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-border bg-background">
          <div className="flex items-center justify-between mb-4">
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-foreground">
                Mangaba AI
              </h1>
            )}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-accent transition-colors border border-border"
                title={isCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
              >
                {isCollapsed ? <Menu size={18} /> : <X size={18} />}
              </button>
              {!isCollapsed && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg hover:bg-accent transition-colors border border-border"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
              )}
            </div>
          </div>
          <button
            onClick={handleNewChat}
            className={cn(
              "w-full flex items-center p-2 sm:p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-sm border border-border",
              "text-sm sm:text-base",
              isCollapsed ? "justify-center" : "gap-2 sm:gap-3"
            )}
            title={isCollapsed ? "Nova Conversa" : ""}
          >
            <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
            {!isCollapsed && (
              <span className="truncate">Nova Conversa</span>
            )}
          </button>
        </div>
        
        {/* Hub Selector */}
        <div className="p-3 sm:p-4 border-b border-border bg-background">
          <HubSelector isCollapsed={isCollapsed} />
        </div>
        
        {/* Navigation */}
        {!isCollapsed && (
          <div className="p-3 sm:p-4 border-b border-border">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
              Ferramentas
            </h3>
            <div className="space-y-1">
              <Link
                to="/app/user-journey"
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-all duration-200 text-sm border border-transparent hover:border-border"
              >
                <GitBranch size={16} className="text-muted-foreground" />
                <span className="truncate">Jornada do Usuário</span>
              </Link>
            </div>
          </div>
        )}
        
        {/* Search */}
        {!isCollapsed && (
          <div className="p-3 sm:p-4 border-b border-border">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>
        )}
        
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {isCollapsed ? (
            <div className="p-1 sm:p-2 space-y-1 sm:space-y-2">
              {filteredChats.slice(0, 10).map((chat) => (
                <button
                    key={chat.id}
                    onClick={() => setCurrentChat(chat.id)}
                    className={cn(
                      "w-full p-2 sm:p-3 rounded-lg transition-all duration-200 flex items-center justify-center border border-transparent",
                      currentChatId === chat.id
                        ? "bg-accent text-accent-foreground border-border"
                        : "hover:bg-accent/50 hover:border-border"
                    )}
                    title={chat.title}
                  >
                  <MessageSquare size={14} className="sm:w-4 sm:h-4" />
                </button>
              ))}
            </div>
          ) : (
            Object.entries(chatGroups).map(([groupName, groupChats]) => {
              if (groupChats.length === 0) return null
              
              const groupLabels = {
                today: 'Hoje',
                yesterday: 'Ontem',
                thisWeek: 'Esta semana',
                thisMonth: 'Este mês',
                older: 'Mais antigo'
              }
              
              return (
                <div key={groupName} className="p-1 sm:p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-1 sm:mb-2 px-1 sm:px-2">
                    {groupLabels[groupName as keyof typeof groupLabels]}
                  </div>
                  <AnimatePresence>
                    {groupChats.map((chat) => (
                      <motion.div
                        key={chat.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                          "group relative flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg cursor-pointer transition-all duration-200 mb-1 border border-transparent",
                          currentChatId === chat.id
                            ? "bg-accent text-accent-foreground border-border"
                            : "hover:bg-accent/50 hover:border-border"
                        )}
                        onClick={() => setCurrentChat(chat.id)}
                      >
                        <MessageSquare size={14} className="sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs sm:text-sm font-medium truncate">
                            {chat.title}
                          </div>
                          <div className="text-xs text-muted-foreground hidden sm:block">
                            {formatDistanceToNow(new Date(chat.updatedAt), {
                              addSuffix: true,
                              locale: ptBR
                            })}
                          </div>
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowChatOptions(showChatOptions === chat.id ? null : chat.id)
                            }}
                            className="p-1 rounded hover:bg-accent transition-colors border border-border"
                          >
                            <MoreHorizontal size={14} />
                          </button>
                        </div>
                        
                        {/* Chat Options Menu */}
                        {showChatOptions === chat.id && (
                          <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[150px]">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowChatOptions(null)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                            >
                              <Edit3 size={14} />
                              Renomear
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                navigator.share?.({
                                  title: chat.title,
                                  text: chat.messages.map(m => `${m.role}: ${m.content}`).join('\n\n')
                                })
                                setShowChatOptions(null)
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
                            >
                              <Share2 size={14} />
                              Compartilhar
                            </button>
                            <button
                              onClick={(e) => handleDeleteChat(chat.id, e)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <Trash2 size={14} />
                              Excluir
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )
            })
          )}
        </div>
        
        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-border bg-background">
          {user ? (
            <div className="space-y-2">
              <button
                onClick={() => setShowUserProfile(true)}
                className={cn(
                  "w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-accent transition-all duration-200 border border-border",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <User size={16} className="sm:w-[18px] sm:h-[18px]" />
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                )}
              </button>
              
              {!isCollapsed && (
                <div className="flex gap-2">
                  <Link
                    to="/settings"
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors text-sm border border-border"
                  >
                    <Settings size={14} />
                    Configurações
                  </Link>
                  <button
                    onClick={logout}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-sm border border-border"
                  >
                    <LogOut size={14} />
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {!isCollapsed && (
                <>
                  <button
                    onClick={handleLogin}
                    className="w-full flex items-center justify-center gap-2 p-2 sm:p-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 text-sm shadow-sm"
                  >
                    <LogIn size={16} />
                    Entrar
                  </button>
                  <button
                    onClick={handleRegister}
                    className="w-full flex items-center justify-center gap-2 p-2 sm:p-3 rounded-lg border border-border hover:bg-accent transition-all duration-200 text-sm"
                  >
                    <User size={16} />
                    Registrar
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
        
        {/* User Profile Modal */}
        <UserProfile 
          isOpen={showUserProfile}
          onClose={() => setShowUserProfile(false)}
        />
      </div>
    </>
  )
}

export default Sidebar
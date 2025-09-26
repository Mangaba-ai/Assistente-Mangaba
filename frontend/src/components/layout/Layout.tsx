import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from '../Sidebar'
import LogViewer from '../LogViewer'
import DebugInfo from '../DebugInfo'

import { useChatStore } from '../../stores/chatStore'
import { useSidebarStore } from '../../stores/sidebarStore'
import { useAuth } from '../../contexts/AuthContext'

import { cn } from '../../utils/cn'
import { Bug } from 'lucide-react'

const Layout = () => {
  const { createChat, chats, currentChatId, loadHubsFromBackend, loadAgentsFromBackend } = useChatStore()
  const { isCollapsed } = useSidebarStore()
  const { user, isAuthenticated } = useAuth()
  const [showLogViewer, setShowLogViewer] = useState(false)
  
  // Debug logs
  console.log('Layout component rendered')
  console.log('Is authenticated:', isAuthenticated)
  console.log('User:', user)
  console.log('Chats:', chats)
  console.log('Current chat ID:', currentChatId)

  useEffect(() => {
    // Load data from backend and create initial chat if none exists
    const initializeApp = async () => {
      if (isAuthenticated) {
        // Load hubs and agents from backend
        try {
          await loadHubsFromBackend()
          await loadAgentsFromBackend()
        } catch (error) {
          console.error('Error loading data from backend:', error)
        }
      }
      
      // Create initial chat if none exists
      if (chats.length === 0 && !currentChatId) {
        try {
          await createChat()
        } catch (error) {
          console.error('Error creating initial chat:', error)
        }
      }
    }
    initializeApp()
  }, [isAuthenticated])

  return (
    <div className="flex h-screen bg-background" style={{ position: 'relative' }}>
      {/* Renderizar sidebar apenas se o usuário estiver autenticado */}
      {isAuthenticated && <Sidebar />}
      <main className={cn(
        "flex flex-col overflow-hidden transition-all duration-300 flex-1",
        "lg:ml-0",
        // Ajustar margem apenas se usuário estiver logado e sidebar estiver visível
        isAuthenticated && (isCollapsed ? "lg:ml-16" : "lg:ml-80")
      )}>
        <Outlet />
        
        {/* Debug Info - apenas logs no console */}
        <DebugInfo />
        
        {/* Debug Log Button */}
        <button
          onClick={() => setShowLogViewer(true)}
          className="fixed bottom-4 right-4 p-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full shadow-lg transition-colors z-40"
          title="Ver Logs de Debug"
        >
          <Bug className="w-5 h-5" />
        </button>
        
        {/* Log Viewer Modal */}
        <LogViewer 
          isOpen={showLogViewer} 
          onClose={() => setShowLogViewer(false)} 
        />
      </main>
    </div>
  )
}

export default Layout
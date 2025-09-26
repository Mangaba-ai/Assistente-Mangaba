import { useEffect } from 'react'
import { useChatStore } from '../stores/chatStore'
import { useAuth } from '../contexts/AuthContext'

const DebugInfo = () => {
  const { hubs, chats, currentChatId, selectedHubId, selectedAgentId } = useChatStore()
  const { user, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    console.group('🔍 Debug Info')
    console.log('Auth Status:', isAuthenticated ? 'Authenticated' : 'Not Authenticated')
    console.log('Loading:', isLoading ? 'Yes' : 'No')
    console.log('User:', user?.name || 'None')
    console.log('Hubs Count:', hubs?.length || 0)
    console.log('Chats Count:', chats?.length || 0)
    console.log('Current Chat ID:', currentChatId || 'None')
    console.log('Selected Hub ID:', selectedHubId || 'None')
    console.log('Selected Agent ID:', selectedAgentId || 'None')
    console.log('URL:', window.location.pathname)
    console.groupEnd()
  }, [user, isAuthenticated, isLoading, hubs, chats, currentChatId, selectedHubId, selectedAgentId])

  // Não renderiza nada no frontend
  return null
}

export default DebugInfo
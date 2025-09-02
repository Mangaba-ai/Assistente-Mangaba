import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Share2, Maximize2, Minimize2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import UserJourneyMindMap from '../components/UserJourneyMindMap'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { cn } from '../utils/cn'

export default function UserJourneyPage() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handleExport = () => {
    // This would implement export functionality
    console.log('Exporting mind map...')
  }

  const handleShare = () => {
    // This would implement share functionality
    if (navigator.share) {
      navigator.share({
        title: 'Mapa Mental da Jornada do Usuário - Assistente Mangaba',
        text: 'Visualização detalhada da jornada do usuário na plataforma Assistente Mangaba',
        url: window.location.href
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      console.log('Link copiado para clipboard')
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={cn(
      "flex flex-col h-screen bg-background",
      isFullscreen ? "fixed inset-0 z-50" : "h-full"
    )}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-card border-b border-border p-4 flex items-center justify-between",
          isFullscreen && "hidden"
        )}
      >
        <div className="flex items-center gap-4">
          <Link
            to="/app"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar ao Dashboard</span>
          </Link>
          
          <div className="h-6 w-px bg-border" />
          
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Mapa Mental da Jornada do Usuário
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualização detalhada do fluxo de experiência do usuário na plataforma
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Exportar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 size={16} />
            Compartilhar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="flex items-center gap-2"
          >
            <Maximize2 size={16} />
            Tela Cheia
          </Button>
        </div>
      </motion.div>

      {/* Fullscreen header */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4 z-10 flex items-center gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="flex items-center gap-2 bg-background/90 backdrop-blur-sm"
          >
            <Minimize2 size={16} />
            Sair da Tela Cheia
          </Button>
        </motion.div>
      )}

      {/* Instructions */}
      {!isFullscreen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4"
        >
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Como usar o mapa mental:
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• <strong>Clique</strong> em qualquer elemento para ver detalhes completos</li>
                  <li>• <strong>Arraste</strong> para navegar pelo mapa</li>
                  <li>• <strong>Use o scroll</strong> para dar zoom in/out</li>
                  <li>• <strong>Cores diferentes</strong> representam diferentes tipos de elementos (veja a legenda)</li>
                  <li>• <strong>Linhas conectoras</strong> mostram o fluxo da jornada do usuário</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Mind Map */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex-1 relative"
      >
        <UserJourneyMindMap className="h-full" />
      </motion.div>

      {/* Footer info */}
      {!isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="p-4 border-t border-border bg-card/50"
        >
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              <span>Baseado nos dados de jornada do usuário v1.0</span>
              <span className="mx-2">•</span>
              <span>Atualizado em 12 de Janeiro, 2025</span>
            </div>
            <div className="flex items-center gap-4">
              <span>5 etapas da jornada</span>
              <span>•</span>
              <span>2 personas</span>
              <span>•</span>
              <span>7 touchpoints</span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
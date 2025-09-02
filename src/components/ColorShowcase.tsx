import React from 'react'
import Button from './ui/Button'
import Alert from './ui/Alert'
import Badge from './ui/Badge'
import Spinner from './ui/Spinner'

const ColorShowcase: React.FC = () => {
  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Sistema de Cores Sutis
        </h2>
        <p className="text-muted-foreground">
          Demonstração das cores verde, amarelo e vermelho aplicadas na interface
        </p>
      </div>

      {/* Seção de Botões */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Botões</h3>
        <div className="flex flex-wrap gap-3">
          <Button variant="success">Sucesso</Button>
          <Button variant="warning">Aviso</Button>
          <Button variant="danger">Erro</Button>
        </div>
      </div>

      {/* Seção de Alertas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Alertas</h3>
        <div className="space-y-3">
          <Alert variant="success" title="Operação realizada com sucesso">
            Sua mensagem foi enviada e o chat está funcionando perfeitamente.
          </Alert>
          <Alert variant="warning" title="Atenção necessária">
            O modelo de IA pode demorar alguns segundos para responder.
          </Alert>
          <Alert variant="error" title="Erro de conexão">
            Não foi possível conectar com o serviço Ollama. Verifique se está rodando.
          </Alert>
        </div>
      </div>

      {/* Seção de Badges */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Badges</h3>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">Online</Badge>
          <Badge variant="warning">Processando</Badge>
          <Badge variant="danger">Offline</Badge>
        </div>
      </div>

      {/* Seção de Spinners */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Indicadores de Carregamento</h3>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Spinner color="success" size="sm" />
            <span className="text-success text-sm">Conectado</span>
          </div>
          <div className="flex items-center gap-2">
            <Spinner color="warning" size="sm" />
            <span className="text-warning text-sm">Carregando</span>
          </div>
          <div className="flex items-center gap-2">
            <Spinner color="error" size="sm" />
            <span className="text-error text-sm">Erro</span>
          </div>
        </div>
      </div>

      {/* Seção de Cores de Fundo Sutis */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Fundos Sutis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-success-subtle border border-success/20">
            <h4 className="font-medium text-success mb-2">Sucesso Sutil</h4>
            <p className="text-sm text-foreground">Fundo verde sutil para indicar estados positivos.</p>
          </div>
          <div className="p-4 rounded-lg bg-warning-subtle border border-warning/20">
            <h4 className="font-medium text-warning mb-2">Aviso Sutil</h4>
            <p className="text-sm text-foreground">Fundo amarelo sutil para chamar atenção.</p>
          </div>
          <div className="p-4 rounded-lg bg-error-subtle border border-error/20">
            <h4 className="font-medium text-error mb-2">Erro Sutil</h4>
            <p className="text-sm text-foreground">Fundo vermelho sutil para indicar problemas.</p>
          </div>
        </div>
      </div>

      {/* Seção de Status de Conexão */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Status de Conexão</h3>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-success-subtle border border-success/20">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-success font-medium">Ollama Online</span>
            <span className="text-sm text-muted-foreground">Todos os modelos disponíveis</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-warning-subtle border border-warning/20">
            <div className="w-3 h-3 bg-warning rounded-full animate-pulse"></div>
            <span className="text-warning font-medium">Conectando...</span>
            <span className="text-sm text-muted-foreground">Verificando disponibilidade</span>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-error-subtle border border-error/20">
            <div className="w-3 h-3 bg-error rounded-full"></div>
            <span className="text-error font-medium">Desconectado</span>
            <span className="text-sm text-muted-foreground">Serviço indisponível</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorShowcase
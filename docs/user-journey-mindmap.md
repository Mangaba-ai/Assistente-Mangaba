# Mapa Mental da Jornada do Usuário

## Visão Geral

O **Mapa Mental da Jornada do Usuário** é uma funcionalidade avançada que visualiza de forma interativa e detalhada todo o fluxo de experiência dos usuários na plataforma Assistente Mangaba. Esta ferramenta permite uma compreensão profunda dos pontos de contato, emoções, problemas e oportunidades ao longo da jornada do usuário.

## Características Principais

### 🎯 **Visualização Interativa**
- Mapa mental construído com ReactFlow para navegação suave
- Elementos clicáveis que revelam detalhes completos
- Zoom, pan e controles de navegação intuitivos
- Design responsivo que funciona em desktop e mobile

### 👥 **Personas Detalhadas**
- **Usuário Empresarial**: Profissional buscando assistência de IA
- **Administrador**: Responsável pela configuração e gestão
- Objetivos, pontos de dor e motivações claramente definidos

### 🛤️ **Etapas da Jornada**
1. **Descoberta** - Primeiro contato com a plataforma
2. **Onboarding** - Processo de integração inicial
3. **Primeiro Uso** - Primeiras interações
4. **Uso Regular** - Utilização contínua
5. **Mastery** - Domínio completo da plataforma

### 📊 **Elementos Visuais**
- **Cores Codificadas**: Diferentes tipos de elementos têm cores distintas
- **Estados Emocionais**: Badges coloridos representam emoções dos usuários
- **Prioridades**: Indicadores visuais para níveis de prioridade
- **Conexões**: Linhas mostram o fluxo da jornada

## Como Usar

### Navegação
1. **Clique** em qualquer elemento para ver detalhes completos no painel lateral
2. **Arraste** para navegar pelo mapa
3. **Use o scroll** para dar zoom in/out
4. **Controles** disponíveis: zoom in, zoom out, ajustar visualização

### Funcionalidades
- **Exportar**: Salvar o mapa em diferentes formatos
- **Compartilhar**: Compartilhar via Web Share API ou clipboard
- **Tela Cheia**: Visualização expandida para análise detalhada

## Dados Utilizados

O mapa mental é baseado no arquivo `user-journey-map-eraser.json` que contém:

- **2 Personas** com objetivos e pontos de dor específicos
- **5 Etapas** da jornada com descrições detalhadas
- **7 Touchpoints** principais com emoções e ações do usuário
- **Métricas** organizadas por categoria (acquisition, activation, retention, etc.)
- **Áreas de Melhoria** com prioridades e ações recomendadas

## Métricas Incluídas

### 📈 **Acquisition**
- Taxa de conversão da landing page
- Tempo até primeiro login
- Origem dos usuários

### ⚡ **Activation**
- Taxa de conclusão do onboarding
- Tempo até primeira conversa
- Número de hubs explorados

### 🔄 **Retention**
- Frequência de uso semanal
- Número de conversas por sessão
- Taxa de retorno em 7 dias

### 💬 **Engagement**
- Duração média das sessões
- Número de agentes utilizados
- Profundidade das conversas

### 😊 **Satisfaction**
- NPS (Net Promoter Score)
- Avaliação das respostas
- Taxa de resolução de problemas

## Áreas de Melhoria Identificadas

### 🔴 **Alta Prioridade**
- **Onboarding**: Simplificar processo inicial
- **Personalização**: Aumentar customização da experiência

### 🟡 **Média Prioridade**
- **Discovery**: Melhorar descoberta de funcionalidades

## Tecnologias Utilizadas

- **ReactFlow**: Biblioteca para criação de diagramas interativos
- **Framer Motion**: Animações suaves e transições
- **Tailwind CSS**: Estilização responsiva
- **TypeScript**: Tipagem estática para maior confiabilidade
- **Lucide React**: Ícones modernos e consistentes

## Acesso

A funcionalidade está disponível através de:
- **URL Direta**: `/app/user-journey`
- **Navegação**: Sidebar → Ferramentas → "Jornada do Usuário"
- **Ícone**: GitBranch (representa ramificações da jornada)

## Benefícios

### Para Desenvolvedores
- Compreensão clara dos fluxos de usuário
- Identificação de pontos de melhoria
- Base para tomada de decisões de produto

### Para Designers
- Visualização de estados emocionais
- Mapeamento de touchpoints críticos
- Insights para melhorias de UX

### Para Gestores
- Métricas organizadas e acessíveis
- Priorização clara de melhorias
- Visão holística da experiência do usuário

## Futuras Melhorias

- [ ] Filtragem por persona ou etapa específica
- [ ] Exportação em múltiplos formatos (PNG, SVG, PDF)
- [ ] Integração com dados reais de analytics
- [ ] Modo de edição para atualizar dados
- [ ] Comparação temporal de jornadas
- [ ] Anotações e comentários colaborativos

---

**Desenvolvido com ❤️ para melhor compreensão da experiência do usuário**
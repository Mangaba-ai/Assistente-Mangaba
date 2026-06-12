<div align="center">
  <img src="assets/mangaba-logo.svg" alt="Mangaba AI" width="140"/>

  [![Mangaba AI](https://img.shields.io/badge/Mangaba-AI-F97518?style=for-the-badge)](https://www.mangaba.ia.br)
  [![Site](https://img.shields.io/badge/mangaba.ia.br-1E0D01?style=for-the-badge)](https://www.mangaba.ia.br)
</div>

# 🥭 Mangaba Assistente

Um clone do ChatGPT desenvolvido em HTML, CSS e JavaScript puro. O Mangaba Assistente é um assistente de IA interativo com interface moderna e funcionalidades completas de chat.

## ✨ Características

- **Interface Moderna**: Design inspirado no ChatGPT com tema escuro elegante
- **Sistema de Hubs**: Organize conversas por áreas de negócio específicas
- **Agentes Especializados**: Cada hub possui agentes especializados em diferentes funções
- **Chat Interativo**: Sistema completo de mensagens com respostas simuladas da IA baseadas no agente selecionado
- **Histórico de Conversas**: Salva e gerencia múltiplas conversas
- **Formatação de Texto**: Suporte a markdown básico (negrito, itálico, código)
- **Prompts Sugeridos**: Cartões com exemplos de perguntas para começar
- **Responsivo**: Funciona perfeitamente em desktop e dispositivos móveis
- **Armazenamento Local**: Conversas salvas no navegador

## 🚀 Como Usar

### Instalação

1. Clone ou baixe este repositório
2. Abra o arquivo `index.html` em seu navegador
3. Selecione um hub e agente na página de hubs
4. Comece a conversar!

### Funcionalidades

#### 🏢 Sistema de Hubs
- Clique em "Selecionar Hub" para acessar a página de hubs
- Escolha entre 6 áreas de negócio: Financeiro, RH, Tecnologia, Marketing, Operações e Jurídico
- Cada hub possui agentes especializados em diferentes funções
- Selecione o agente mais adequado para sua necessidade

#### 🤖 Agentes Especializados
- **Financeiro**: Analista Financeiro, Contador, Consultor de Investimentos
- **RH**: Consultor de RH, Especialista em Recrutamento, Analista de Treinamento
- **Tecnologia**: Desenvolvedor, Analista de Sistemas, Especialista em Segurança
- **Marketing**: Especialista em Marketing, Analista de Mídias Sociais, Designer
- **Operações**: Gerente de Operações, Analista de Processos, Especialista em Qualidade
- **Jurídico**: Advogado Corporativo, Especialista em Contratos, Consultor de Compliance

#### 💬 Enviando Mensagens
- Digite sua mensagem na caixa de texto
- Pressione `Enter` ou clique no botão de envio
- Use `Shift + Enter` para quebrar linha
- O agente selecionado responderá com expertise específica da área

#### 📝 Formatação de Texto
O assistente suporta formatação básica:
- **Negrito**: `**texto**`
- *Itálico*: `*texto*`
- `Código`: `` `código` ``
- Blocos de código: ``` ```código``` ```

#### 🗂️ Gerenciamento de Conversas
- **Nova Conversa**: Clique no botão "Nova Conversa" na barra lateral
- **Histórico**: Acesse conversas anteriores na barra lateral
- **Limpar**: Use o botão de lixeira para limpar a conversa atual
- O hub e agente selecionados são mantidos entre conversas

#### 🎯 Prompts Sugeridos
Clique nos cartões de exemplo para:
- Explicações sobre IA
- Ajuda com e-mails
- Criação de receitas
- Explicações científicas

## 🛠️ Estrutura do Projeto

```
mangaba-assistente-2/
├── index.html          # Página principal do chat
├── hubs.html           # Página de seleção de hubs
├── styles.css          # Estilos da aplicação principal
├── hubs.css            # Estilos da página de hubs
├── script.js           # Lógica JavaScript principal
├── hubs.js             # Lógica JavaScript dos hubs
└── README.md           # Este arquivo
```

## 🎨 Personalização

### Cores e Tema
Edite os arquivos CSS para personalizar:
- `styles.css`: Interface principal do chat
- `hubs.css`: Página de seleção de hubs
- Cores do tema (variáveis CSS no topo dos arquivos)
- Layout e espaçamentos
- Animações e transições

### Hubs e Agentes
Modifique o arquivo `hubs.js` para:
- Adicionar novos hubs de negócio
- Criar agentes especializados
- Personalizar descrições e ícones

### Respostas dos Agentes
Edite a função `getAgentResponses()` em `script.js` para:
- Adicionar novos padrões de resposta por agente
- Integrar com APIs reais de IA
- Personalizar o comportamento específico de cada agente

### Interface
Ajuste os arquivos HTML para:
- `index.html`: Modificar interface do chat
- `hubs.html`: Personalizar página de hubs
- Modificar textos e labels
- Adicionar novos elementos
- Alterar a estrutura das páginas

## 🔧 Funcionalidades Técnicas

### Armazenamento
- Utiliza `localStorage` para persistir conversas
- Dados salvos automaticamente a cada mensagem
- Histórico mantido entre sessões

### Responsividade
- Design mobile-first
- Sidebar colapsável em telas pequenas
- Layout adaptativo para diferentes tamanhos

### Performance
- JavaScript vanilla (sem dependências)
- Carregamento rápido
- Animações suaves com CSS

## 🌟 Exemplos de Uso

### Perguntas Gerais
```
Usuário: Olá! Como você está?
Assistente: Olá! É um prazer conversar com você. Como posso ajudá-lo hoje?
```

### Explicações Técnicas
```
Usuário: Explique como funciona a inteligência artificial
Assistente: A Inteligência Artificial é um campo da ciência da computação...
```

### Ajuda com Tarefas
```
Usuário: Ajude-me a escrever um e-mail profissional
Assistente: Posso ajudá-lo a escrever um e-mail profissional! Aqui está um modelo...
```

## 🔮 Próximas Funcionalidades

- [ ] Integração com APIs de IA reais (OpenAI, Gemini, etc.)
- [ ] Suporte a anexos de arquivos
- [ ] Exportação de conversas
- [ ] Temas personalizáveis
- [ ] Comandos de voz
- [ ] Plugins e extensões

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- Inspirado no design do ChatGPT da OpenAI
- Ícones do Font Awesome
- Comunidade de desenvolvedores web

---

**Desenvolvido com ❤️ para a comunidade**

Se você gostou do projeto, não esqueça de dar uma ⭐!
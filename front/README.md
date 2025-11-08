# Passa a Bola - A Rede Social do Futebol Feminino

<p align="center">
  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8B5pQmu3WV6NFowHTtz5h9dKaCCBVJoRAeA&s" alt="Logo do Passa a Bola" width="150">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-0.1.0-purple?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/license-Private-red?style=for-the-badge" alt="License">
  <img src="https://img.shields.io/badge/status-In_Development-yellow?style=for-the-badge" alt="Status">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/WCAG_2.1-AA_Compliant-green?style=flat-square" alt="WCAG 2.1 AA">
  <img src="https://img.shields.io/badge/Lighthouse-90+-success?style=flat-square" alt="Lighthouse Score">
  <img src="https://img.shields.io/badge/Test_Coverage-70%25+-brightgreen?style=flat-square" alt="Test Coverage">
  <img src="https://img.shields.io/badge/Responsive-320px_to_1920px-blue?style=flat-square" alt="Responsive Range">
</p>

---

## ⚽ Visão Geral do Projeto

Este é um projeto de destaque desenvolvido em colaboração da **FIAP**, como parte do **Desafio de Inovação Tecnológica: Passa a Bola - Tecnologia & Futebol Feminino**. A nossa solução é uma plataforma web que tem como objetivo transformar a maneira como o futebol feminino é vivenciado no ambiente digital.

Em parceria estratégica com o **Passa a Bola**, o principal canal dedicado aos esportes femininos na América Latina, a plataforma busca dar mais visibilidade às atletas e fortalecer a comunidade.

**⚠️ Este projeto ainda está em desenvolvimento. ⚠️**

> **📖 Documentação Completa:** Acesse a [Central de Documentação](./docs/README.md) para guias técnicos detalhados, design system, componentes, acessibilidade e testes.

### Problema e Oportunidade

Apesar do crescimento visível do futebol feminino, a modalidade ainda enfrenta desafios digitais, como a falta de plataformas dedicadas e ferramentas de engajamento que limitam seu potencial. Nossa solução aproveita a tecnologia para preencher essa lacuna, criando uma ponte digital para amplificar as vozes e talentos das atletas brasileiras.

### Propósito da Solução

A plataforma funciona como uma rede social robusta para:

- **Promover Visibilidade**: Permitir que jogadoras se destaquem, construam seus perfis e sejam reconhecidas.
- **Fortalecer a Comunidade**: Conectar jogadoras, clubes, fãs e organizações, gerando engajamento autêntico e apoiando o protagonismo feminino no esporte.
- **Organizar Eventos**: Oferecer ferramentas para a criação e participação em jogos e campeonatos, potencializando a experiência do esporte.
- **Comunicação em Tempo Real**: Sistema de notificações e chat privado para facilitar a interação entre usuários.
- **Gestão de Equipes**: Criação e gerenciamento de equipes com sistema de convites.

## ✨ Tecnologias e Ferramentas

Este projeto foi construído utilizando tecnologias web modernas para criar uma aplicação web responsiva e de alta performance.

- **Framework**: [**Next.js 15**](https://nextjs.org/) - O framework React para produção.
- **Biblioteca UI**: [**React 19**](https://reactjs.org/) - Para construir interfaces de usuário.
- **Estilização**: [**Tailwind CSS 4**](https://tailwindcss.com/) - Um framework CSS utility-first.
- **WebSocket**: [**@stomp/stompjs**](https://stomp-js.github.io/) + [**ws**](https://github.com/websockets/ws) - Para comunicação em tempo real e tail server de logs.
- **Gerenciamento de Estado**: **React Context API** - Para estado global da aplicação.
- **Observabilidade**: Sistema de logs estruturado client-side com streaming em tempo real (SSE/WebSocket).

## 🚀 Como Executar o Projeto

Para rodar a aplicação em seu ambiente de desenvolvimento, siga os passos abaixo:

1.  **Pré-requisitos**:

    - [Instale o Node.js](https://nodejs.org/en/download/).
    - Tenha um gerenciador de pacotes como [npm](https://www.npmjs.com/get-npm) ou [yarn](https://classic.yarnpkg.com/en/docs/install/).

2.  **Clone o Repositório**:

    ```bash
    git clone [URL do seu repositório]
    cd passa_bola
    ```

3.  **Instale as Dependências**:

    ```bash
    npm install
    ```

4.  **Configure as Variáveis de Ambiente**:
    Crie um arquivo `.env.local` na raiz do projeto:

    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8080/api
    NEXT_PUBLIC_ENABLE_WEBSOCKET=false
    ```

    > **Nota**: WebSocket está temporariamente desabilitado aguardando configuração no backend. Para habilitar quando estiver pronto, altere para `true`.

5.  **Execute a Aplicação**:

    ```bash
    npm run dev
    ```

    Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

6.  **Execute o Servidor de Logs (Opcional)**:

    Para habilitar streaming de logs via WebSocket:

    ```bash
    npm run logs:socket
    ```

    O servidor WebSocket estará disponível em `ws://localhost:3001`. Acesse [http://localhost:3000/logs](http://localhost:3000/logs) para visualizar os logs em tempo real.

## 🛠️ Estrutura do Projeto

A estrutura de diretórios foi projetada para ser modular e escalável, seguindo as melhores práticas do Next.js:

```
passabola-web/
├── app/                      # Rotas, componentes e lógica da aplicação
│   ├── api/                  # API Routes (Next.js)
│   │   └── log/              # Endpoints de logs
│   │       ├── route.js      # POST (receber logs), DELETE (limpar logs)
│   │       └── stream/       # SSE streaming de logs
│   ├── components/           # Componentes React reutilizáveis
│   │   ├── Header.jsx        # Cabeçalho com navegação
│   │   ├── NotificationCard.jsx    # Card de notificação
│   │   ├── ConversationItem.jsx    # Item de conversa no chat
│   │   ├── MessageBubble.jsx       # Bolha de mensagem
│   │   └── ...               # Outros componentes
│   ├── context/              # Context API para estado global
│   │   ├── AuthContext.js    # Contexto de autenticação
│   │   ├── NotificationContext.js  # Contexto de notificações (WebSocket)
│   │   ├── ChatContext.js    # Contexto de chat (WebSocket)
│   │   └── ToastContext.js   # Contexto de toasts
│   ├── lib/                  # Utilitários e configurações
│   │   ├── api.js            # Cliente HTTP centralizado com deduplicador
│   │   ├── logger.js         # Logger client-side estruturado
│   │   └── routes/           # Rotas da API organizadas por recurso
│   ├── logs/                 # Sistema de observabilidade
│   │   └── page.jsx          # UI de visualização de logs em tempo real
│   ├── feed/                 # Página do feed de posts
│   ├── games/                # Páginas relacionadas a jogos
│   ├── calendar/             # Página do calendário
│   ├── teams/                # Páginas de equipes
│   ├── notifications/        # Sistema de notificações
│   ├── chat/                 # Sistema de chat em tempo real
│   ├── user/                 # Perfis de usuário
│   ├── login/                # Página de login
│   ├── register/             # Página de registro
│   ├── layout.jsx            # Layout principal com providers
│   └── page.jsx              # Página inicial (landing page)
├── logs/                     # Armazenamento de logs (não versionado)
│   └── client-logs.log       # Arquivo de logs JSON-line
├── scripts/                  # Scripts utilitários
│   └── log-socket-server.js  # Servidor WebSocket para tail de logs
├── public/                   # Arquivos estáticos
│   ├── icons/                # Ícones SVG
│   └── media/                # Imagens e mídia
├── .github/                  # Documentação e workflows
│   ├── CHAT.md               # Documentação do sistema de chat
│   ├── NOTIFICATIONS.md      # Documentação do sistema de notificações
│   ├── TROUBLESHOOTING.md    # Guia de solução de problemas
│   └── CHANGELOG.md          # Histórico de mudanças
├── .env.example              # Template de variáveis de ambiente
├── .env.local                # Configurações locais (não versionado)
├── next.config.mjs           # Configurações do Next.js
├── tailwind.config.mjs       # Configurações do Tailwind CSS
├── package.json              # Dependências e scripts
└── README.md                 # Este arquivo
```

## 📱 Funcionalidades Principais

### 🔐 Autenticação

- Login e registro de usuários
- Três tipos de perfil: Jogadora, Espectador e Organização
- Proteção de rotas privadas
- JWT Token para autenticação

### 📰 Feed Social

- Publicação de posts
- Lista de posts com paginação
- Interação social

### 🎮 Gerenciamento de Jogos

- Criação de jogos (amistoso, campeonato, copa)
- Edição e exclusão de jogos
- Sistema de convites para jogos
- Calendário de eventos

### 👥 Sistema de Equipes

- Criação e gerenciamento de equipes
- Sistema de convites para equipes
- Lista de membros da equipe

### 🔔 Notificações em Tempo Real

- Notificações via WebSocket (STOMP)
- Suporte a múltiplos tipos: Convite de Equipe, Convite de Jogo, Mensagem do Sistema
- Contador de notificações não lidas
- Filtros e ações em massa
- Fallback HTTP quando WebSocket indisponível

### 💬 Chat em Tempo Real

- Chat privado entre usuários via WebSocket (STOMP)
- Lista de conversas com preview
- Envio de mensagens em tempo real
- Contador de mensagens não lidas
- Fallback HTTP quando WebSocket indisponível

### 👤 Perfis de Usuário

- Visualização de perfil público
- Edição de perfil
- Sistema de seguir/deixar de seguir
- Lista de seguidores e seguindo

### 🤖 Chatbot de Suporte

- Assistente virtual para ajuda

### 📊 Sistema de Observabilidade e Logs

- **Logger Client-Side Estruturado**: Logging centralizado com redação automática de headers sensíveis (Authorization, Cookie)
- **Coleta de Logs**: POST `/api/log` - Endpoint para receber logs do cliente
- **Streaming em Tempo Real**:
  - SSE (Server-Sent Events) via `/api/log/stream`
  - WebSocket via `ws://localhost:3001` (servidor tail dedicado)
- **UI de Visualização**: Interface em tempo real em `/logs` com:
  - Filtros por nível (info, warn, error)
  - Busca textual em logs
  - Auto-scroll e exportação (JSON/CSV)
  - Auto-detect de servidor WebSocket
  - Limpeza de logs (client + server)
- **Persistência**: Logs salvos em JSON-line format em `logs/client-logs.log`
- **Instrumentação**: Todas as requisições HTTP são automaticamente logadas com request/response completos

## 🏗️ Arquitetura e Padrões de Design

### Padrões Arquiteturais

#### 1. **Client HTTP Centralizado** (`app/lib/api.js`)

- **Padrão**: Facade + Factory
- **Funcionalidades**:
  - Gerenciamento centralizado de autenticação (JWT token)
  - Tratamento global de erros HTTP
  - Logging automático de request/response
  - **Deduplicador de requisições**: Evita requisições paralelas idênticas usando Map global de promises pendentes
  - Organização modular por recurso (auth, games, teams, etc.)

```javascript
// Exemplo de uso
import { api } from "@/app/lib/api";

// Automaticamente deduplica se chamado em paralelo
const games = await api.games.getAll();
const players = await api.players.getById(1);
```

#### 2. **Logger Estruturado** (`app/lib/logger.js`)

- **Padrão**: Singleton + Observer
- **Características**:
  - Logs estruturados em JSON
  - Redação automática de headers sensíveis
  - Envio assíncrono usando `sendBeacon` ou `fetch` com keepalive
  - Integração transparente com o client HTTP

```javascript
import { logger } from "@/app/lib/logger";

logger.info("User action", { userId: 123, action: "click" });
logger.error("API Error", { endpoint: "/games", status: 500 });
```

#### 3. **Context API Pattern**

Gerenciamento de estado global seguindo o padrão Provider:

- `AuthContext`: Autenticação e dados do usuário logado
- `NotificationContext`: Notificações em tempo real via WebSocket/STOMP
- `ChatContext`: Mensagens de chat via WebSocket/STOMP
- `ToastContext`: Notificações toast UI
- `ThemeContext`: Tema claro/escuro

#### 4. **Route Handlers (Next.js API Routes)**

Endpoints API seguindo padrão RESTful:

```javascript
// app/api/log/route.js
export async function POST(request) {
  /* receber logs */
}
export async function DELETE(request) {
  /* limpar logs */
}
```

#### 5. **Real-time Streaming**

Duplo transporte para observabilidade:

- **SSE (Server-Sent Events)**: Fallback padrão, sempre disponível
- **WebSocket**: Servidor dedicado Node.js com `ws` para performance
- **Auto-detect**: Client detecta disponibilidade do WS e conecta automaticamente

### Decisões de Design

#### Performance e Otimização

1. **Request Deduplication**:

   - Requisições idênticas em paralelo compartilham a mesma Promise
   - Previne race conditions e duplicação de chamadas (ex: múltiplos useEffect)
   - Implementado via Map global com cleanup automático

2. **Lazy Loading**:

   - Componentes carregados sob demanda
   - Reduz bundle inicial

3. **Logging Assíncrono**:
   - `sendBeacon` para logs críticos (não bloqueia navegação)
   - `fetch` com keepalive como fallback

#### Segurança

1. **Redação de Dados Sensíveis**:

   - Headers `Authorization` e `Cookie` são automaticamente redatados em logs
   - Evita vazamento acidental de tokens em logs persistidos

2. **JWT Token Management**:
   - Token armazenado em memória (não em localStorage por padrão)
   - Injetado automaticamente em todas as requisições

#### Resiliência

1. **Fallback Cascading**:

   - WebSocket → SSE → HTTP polling
   - Garantia de funcionalidade mesmo com servidores indisponíveis

2. **Reconnection Strategy**:

   - Backoff exponencial para reconexão WebSocket
   - Máximo de 4 tentativas antes de fallback para SSE

3. **Error Handling**:
   - Try-catch em todas as operações críticas
   - Mensagens de erro user-friendly
   - Logging automático de exceções

---

## 🎨 Design System

### Paleta de Cores

#### Cores Primárias (Brand)

| Nome              | Hex                   | RGB          | CSS Variable            | Uso                                |
| ----------------- | --------------------- | ------------ | ----------------------- | ---------------------------------- |
| **Accent**        | `#6d28d9`             | `109 40 217` | `--color-accent`        | CTAs, links, elementos interativos |
| **Accent Strong** | `#581cb4`             | `88 28 180`  | `--color-accent-strong` | Hover states, ênfase               |
| **Accent Soft**   | `#e5dbff` / `#321a5d` | Light/Dark   | `--color-accent-soft`   | Backgrounds sutis, badges          |

#### Superfícies (Adaptativas - Light/Dark)

| Nome                 | Light Hex | Dark Hex  | CSS Variable               | Uso                           |
| -------------------- | --------- | --------- | -------------------------- | ----------------------------- |
| **Page Background**  | `#f4f7fc` | `#090b16` | `--color-page`             | Fundo da página               |
| **Surface**          | `#ffffff` | `#151b2e` | `--color-surface`          | Cards, modals, containers     |
| **Surface Muted**    | `#f6f8fc` | `#1e263c` | `--color-surface-muted`    | Backgrounds secundários       |
| **Surface Elevated** | `#f9f4ff` | `#2e3a58` | `--color-surface-elevated` | Elementos elevados, dropdowns |

#### Tipografia (Adaptativa - Light/Dark)

| Nome               | Light Hex | Dark Hex  | CSS Variable             | Uso                             |
| ------------------ | --------- | --------- | ------------------------ | ------------------------------- |
| **Text Primary**   | `#111827` | `#e9eeff` | `--color-text-primary`   | Títulos, texto principal        |
| **Text Secondary** | `#4f5669` | `#bbc4de` | `--color-text-secondary` | Subtítulos, labels              |
| **Text Tertiary**  | `#717989` | `#929dba` | `--color-text-tertiary`  | Placeholder, texto auxiliar     |
| **Text Inverse**   | `#ffffff` | `#0c1018` | `--color-text-inverse`   | Texto sobre backgrounds escuros |

#### Bordas (Adaptativas - Light/Dark)

| Nome              | Light Hex | Dark Hex  | CSS Variable            | Uso                 |
| ----------------- | --------- | --------- | ----------------------- | ------------------- |
| **Border Subtle** | `#e0e3eb` | `#252e44` | `--color-border-subtle` | Divisores sutis     |
| **Border Strong** | `#cbd0dd` | `#4a5a78` | `--color-border-strong` | Borders de destaque |

#### Estados

| Nome        | Hex                                  | RGB        | CSS Variable      | Uso                      |
| ----------- | ------------------------------------ | ---------- | ----------------- | ------------------------ |
| **Success** | `#10b981` (Light) / `#22c55e` (Dark) | Light/Dark | `--color-success` | Sucesso, confirmação     |
| **Danger**  | `#ef4444` (Light) / `#f87171` (Dark) | Light/Dark | `--color-danger`  | Erros, ações destrutivas |

### Classes Utilitárias CSS

```css
/* Superfícies */
.bg-page             /* Background da página */
/* Background da página */
/* Background da página */
/* Background da página */
/* Background da página */
/* Background da página */
/* Background da página */
/* Background da página */
.bg-surface          /* Cards e containers */
.bg-surface-muted    /* Backgrounds secundários */
.bg-surface-elevated /* Elementos elevados */

/* Tipografia */
.text-primary        /* Texto principal */
.text-secondary      /* Texto secundário */
.text-tertiary       /* Texto auxiliar */
.text-accent         /* Texto com cor da marca */

/* Bordas */
.border-default      /* Border sutil */
.border-strong       /* Border de destaque */

/* Gradientes */
.bg-brand-gradient   /* Gradiente roxo (CTAs) */
.bg-empty-gradient; /* Gradiente para empty states */
```

---

## 📏 Escala de Espaçamento

Baseada no sistema de **4px** (Tailwind CSS):

| Token  | Pixels | Rem     | Uso                                 |
| ------ | ------ | ------- | ----------------------------------- |
| `xs`   | 4px    | 0.25rem | Espaçamento mínimo, ícones pequenos |
| `sm`   | 8px    | 0.5rem  | Gaps, padding compacto              |
| `base` | 12px   | 0.75rem | Padding padrão                      |
| `md`   | 16px   | 1rem    | Margens, padding médio              |
| `lg`   | 24px   | 1.5rem  | Seções, espaçamento generoso        |
| `xl`   | 32px   | 2rem    | Grandes espaçamentos                |
| `2xl`  | 48px   | 3rem    | Separação de seções                 |
| `3xl`  | 64px   | 4rem    | Hero sections, espaçamento máximo   |

**Exemplo de uso:**

```jsx
<div className="p-4 mb-6 space-y-4">
  {/* padding: 16px, margin-bottom: 24px, gap vertical: 16px */}
</div>
```

---

## 🔤 Tipografia

### Escala Tipográfica

| Classe      | Tamanho | Line Height | Peso    | Uso                        |
| ----------- | ------- | ----------- | ------- | -------------------------- |
| `text-xs`   | 12px    | 16px        | 400-600 | Labels pequenos, badges    |
| `text-sm`   | 14px    | 20px        | 400-600 | Corpo secundário, captions |
| `text-base` | 16px    | 24px        | 400-600 | Corpo de texto padrão      |
| `text-lg`   | 18px    | 28px        | 500-700 | Subtítulos, leads          |
| `text-xl`   | 20px    | 28px        | 600-700 | Títulos de cards           |
| `text-2xl`  | 24px    | 32px        | 700-800 | Títulos de seções          |
| `text-3xl`  | 30px    | 36px        | 700-800 | Títulos de páginas         |
| `text-4xl`  | 36px    | 40px        | 700-900 | Hero titles (mobile)       |
| `text-5xl`  | 48px    | 1           | 800-900 | Hero titles (desktop)      |

### Famílias de Fonte

```css
/* Padrão do sistema (sans-serif) */
font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

**Pesos disponíveis:**

- `font-normal` (400) - Corpo de texto
- `font-medium` (500) - Ênfase leve
- `font-semibold` (600) - Subtítulos, labels
- `font-bold` (700) - Títulos, botões
- `font-extrabold` (800) - Hero titles

---

## 🎭 Sombras e Efeitos

### Sombras

| Classe            | CSS Box Shadow                                     | Uso                      |
| ----------------- | -------------------------------------------------- | ------------------------ |
| `shadow-sm`       | `0 1px 2px rgba(0,0,0,0.05)`                       | Sombra sutil em cards    |
| `shadow`          | `0 1px 3px rgba(0,0,0,0.1)`                        | Sombra padrão            |
| `shadow-md`       | `0 4px 6px rgba(0,0,0,0.1)`                        | Cards elevados           |
| `shadow-lg`       | `0 10px 15px rgba(0,0,0,0.1)`                      | Modals, dropdowns        |
| `shadow-xl`       | `0 20px 25px rgba(0,0,0,0.1)`                      | Elementos flutuantes     |
| `shadow-elevated` | `0 25px 50px -24px rgb(var(--shadow-color) / 0.6)` | Máxima elevação (custom) |

### Border Radius

| Classe         | Valor  | Uso                               |
| -------------- | ------ | --------------------------------- |
| `rounded`      | 4px    | Bordas sutis                      |
| `rounded-md`   | 6px    | Botões pequenos, inputs           |
| `rounded-lg`   | 8px    | Cards, containers                 |
| `rounded-xl`   | 12px   | Cards principais, modals          |
| `rounded-2xl`  | 16px   | Hero sections, imagens destacadas |
| `rounded-full` | 9999px | Avatares, badges circulares       |

---

## 🧩 Biblioteca de Componentes

### Componentes UI Core

#### 1. **Button**

Botão reutilizável com 3 variantes e estados de loading.

**Props:**

```typescript
variant?: 'primary' | 'secondary' | 'ghost'
size?: 'small' | 'medium' | 'large'
loading?: boolean
disabled?: boolean
fullWidth?: boolean
type?: 'button' | 'submit' | 'reset'
onClick?: () => void
```

**Exemplo:**

```jsx
import Button from "@/app/components/ui/Button";

<Button variant="primary" size="medium" loading={false}>
  Salvar
</Button>;
```

**Acessibilidade:**

- ✅ `aria-disabled` quando desabilitado
- ✅ `aria-busy` durante loading
- ✅ Touch target 44x44px mínimo (WCAG 2.1 AA)
- ✅ Focus ring visível (`focus-visible`)

---

#### 2. **LoadingSkeleton**

Skeleton screen com 5 variantes e animação shimmer.

**Props:**

```typescript
count?: number           // Quantidade de skeletons (padrão: 3)
variant?: 'card' | 'list' | 'post' | 'notification' | 'game'
className?: string
```

**Exemplo:**

```jsx
import LoadingSkeleton from "@/app/components/ui/LoadingSkeleton";

<LoadingSkeleton count={5} variant="post" />;
```

**Variantes:**

- `card` - Card simples com título e descrição
- `list` - Item de lista com avatar e texto
- `post` - Post completo com avatar, conteúdo e ações
- `notification` - Notificação com avatar e mensagem
- `game` - Card de jogo com informações detalhadas

**Acessibilidade:**

- ✅ `role="status"` e `aria-live="polite"`
- ✅ Texto alternativo `"Carregando conteúdo..."`
- ✅ CSS `contain: paint` para performance

---

#### 3. **EmptyState**

Estado vazio reutilizável com ícone, título e CTA.

**Props:**

```typescript
icon?: React.ReactNode       // Ícone do lucide-react
title: string                // Título obrigatório
description?: string         // Descrição opcional
action?: React.ReactNode     // Botão ou link de ação
variant?: 'default' | 'gradient' | 'bordered'
className?: string
```

**Exemplo:**

```jsx
import EmptyState from "@/app/components/ui/EmptyState";
import { FileQuestion } from "lucide-react";
import Button from "@/app/components/ui/Button";

<EmptyState
  icon={<FileQuestion />}
  title="Nenhum post encontrado"
  description="Comece criando seu primeiro post!"
  action={<Button variant="primary">Criar Post</Button>}
  variant="gradient"
/>;
```

**Acessibilidade:**

- ✅ `role="status"` e `aria-live="polite"`
- ✅ `aria-label` com o título
- ✅ Ícone com `aria-hidden="true"`

---

#### 4. **Modal**

Modal acessível com overlay e foco gerenciado.

**Props:**

```typescript
isOpen: boolean
onClose: () => void
title?: string
children: React.ReactNode
size?: 'sm' | 'md' | 'lg' | 'xl'
```

**Exemplo:**

```jsx
import Modal from "@/app/components/ui/Modal";

<Modal isOpen={isOpen} onClose={handleClose} title="Confirmar Ação">
  <p>Tem certeza que deseja continuar?</p>
  <Button onClick={handleConfirm}>Confirmar</Button>
</Modal>;
```

**Acessibilidade:**

- ✅ `role="dialog"` e `aria-modal="true"`
- ✅ Focus trap (foco fica dentro do modal)
- ✅ Fecha com `Escape`
- ✅ Retorna foco ao elemento que abriu

---

#### 5. **Input**

Input controlado com suporte a erros e labels.

**Props:**

```typescript
label?: string
error?: string
type?: string
placeholder?: string
value: string
onChange: (value: string) => void
disabled?: boolean
required?: boolean
```

**Exemplo:**

```jsx
import Input from "@/app/components/ui/Input";

<Input
  label="Email"
  type="email"
  placeholder="seu@email.com"
  value={email}
  onChange={setEmail}
  error={emailError}
  required
/>;
```

**Acessibilidade:**

- ✅ Label associado com `htmlFor`
- ✅ `aria-invalid` quando há erro
- ✅ `aria-describedby` para mensagem de erro
- ✅ `required` e `aria-required`

---

#### 6. **Alert**

Alertas contextuais (sucesso, erro, warning, info).

**Props:**

```typescript
type?: 'success' | 'error' | 'warning' | 'info'
title?: string
message: string
dismissible?: boolean
onDismiss?: () => void
```

**Exemplo:**

```jsx
import Alert from "@/app/components/ui/Alert";

<Alert
  type="success"
  title="Sucesso!"
  message="Seu post foi criado com sucesso."
  dismissible
  onDismiss={handleDismiss}
/>;
```

**Acessibilidade:**

- ✅ `role="alert"` ou `role="status"`
- ✅ `aria-live="assertive"` para erros
- ✅ Ícones com `aria-hidden="true"`

---

### Componentes de Lista

- **PostList** - Lista de posts com paginação
- **TeamList** - Lista de equipes com filtros
- **TeamInviteList** - Lista de convites de equipe
- **UserListCard** - Card de usuário para listas

### Componentes de Card

- **GameCard** - Card de jogo com informações e ações
- **PostCard** - Card de post com interações
- **TeamCard** - Card de equipe
- **NotificationCard** - Card de notificação
- **UserListCard** - Card de usuário

### Componentes de Layout

- **Header** - Cabeçalho com navegação responsiva
- **AuthLayout** - Layout para páginas de autenticação
- **PrivateRoute** - HOC para rotas protegidas
- **BackgroundDecorations** - Decorações de fundo animadas

### Componentes de Chat

- **MessageBubble** - Bolha de mensagem
- **MessageInput** - Input de mensagem com envio
- **ConversationItem** - Item de conversa na lista
- **TypingIndicator** - Indicador de digitação

### Componentes de Formulário

- **CreateTeamForm** - Formulário de criação de equipe
- **NewPostForm** - Formulário de novo post

### Componentes de Perfil

- **ProfileHeader** - Cabeçalho de perfil com avatar e stats
- **PlayerStats** - Estatísticas de jogador
- **ProfileTabs** - Tabs de conteúdo do perfil

---

## ♿ Acessibilidade

### Conformidade WCAG 2.1 AA

✅ **Contraste de Cores:** Todos os textos atendem proporção mínima de 4.5:1 (texto normal) e 3:1 (texto grande)

✅ **Touch Targets:** Todos os elementos interativos possuem mínimo de 44x44px

✅ **Navegação por Teclado:** Todos os componentes são navegáveis via teclado (Tab, Enter, Escape, Arrow keys)

✅ **Screen Reader:** ARIA labels, roles e live regions implementados em todos os componentes

✅ **Focus Indicators:** Indicadores de foco visíveis e de alto contraste (`focus-visible`)

### Recursos de Acessibilidade

```css
/* Focus ring customizado */
.focus-visible:focus-visible {
  outline: 3px solid rgb(var(--color-accent));
  outline-offset: 2px;
}

/* Skip to main content */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: rgb(var(--color-accent));
  color: rgb(var(--color-accent-contrast));
  padding: 8px 16px;
  transition: top 0.2s ease-in-out;
}

.skip-link:focus {
  top: 0;
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Suporte a Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 📚 Documentação

### Documentação Técnica Completa

Acesse nossa [**Central de Documentação**](./docs/README.md) para guias completos:

- [**Design System**](./docs/DESIGN-SYSTEM.md) - Paleta de cores, tipografia, espaçamento e tokens de design
- [**Biblioteca de Componentes**](./docs/COMPONENT-LIBRARY.md) - 35+ componentes React reutilizáveis com exemplos de uso
- [**Guia de Acessibilidade**](./docs/ACCESSIBILITY.md) - Diretrizes WCAG 2.1 AA e checklist de conformidade
- [**Guia de Testes**](./docs/TESTING-GUIDE.md) - Estratégia de testes, ferramentas e melhores práticas

### Documentação de Sprint

- [**SPRINT-001: UX Improvements**](./docs/sprints/SPRINT-001-UX-IMPROVEMENTS.md) - Planejamento completo da sprint de melhorias UX

### Documentação de Sistemas Específicos

Para informações detalhadas sobre sistemas específicos, consulte:

- [**Sistema de Notificações**](./.github/NOTIFICATIONS.md) - Documentação completa do sistema de notificações em tempo real
- [**Sistema de Chat**](./.github/CHAT.md) - Documentação completa do sistema de chat privado
- [**Troubleshooting**](./.github/TROUBLESHOOTING.md) - Guia de solução de problemas comuns
- [**Changelog**](./.github/CHANGELOG.md) - Histórico detalhado de mudanças

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento (port 3000)
npm run build            # Build de produção
npm run start            # Inicia servidor de produção

# Logs e Observabilidade
npm run logs:socket      # Inicia servidor WebSocket de logs (port 3001)

# Utilitários
npm run lint             # Executa linter
```

### Variáveis de Ambiente

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Logs (opcional - se não definido, usa defaults)
LOG_SOCKET_URL=ws://localhost:3001
```

---

<p align="center">
  Feito com ❤️ por <strong>Vinícius Lugli</strong>
</p>

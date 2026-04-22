# Nudos

> **[Acesse a aplicação em produção](https://frontend-production-e8b9.up.railway.app/login)**

Rede social voltada para desenvolvedores, onde os usuários podem criar publicações, interagir com outros devs, seguir perfis, trocar mensagens em tempo real e construir sua rede profissional.

## Visão Geral

O projeto é composto por um **frontend em React** e um **backend em Django REST Framework**, ambos orquestrados via **Docker Compose**. A aplicação possui autenticação JWT, feed de posts com suporte a markdown, sistema de likes, comentários, follows, chat em tempo real via WebSocket, dark mode e internacionalização (PT/EN).

## Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** como bundler
- **Tailwind CSS v4** para estilização
- **React Router v6** para rotas
- **Axios** para requisições HTTP
- **react-markdown** + **remark-gfm** para renderização de markdown nos posts
- **emoji-mart** para seleção de emojis

### Backend
- **Django 5** + **Django REST Framework**
- **JWT** (SimpleJWT) para autenticação
- **PostgreSQL 16** como banco de dados
- **Django Channels** + **Redis** para WebSocket (chat em tempo real)
- **Daphne** como servidor ASGI
- **WhiteNoise** para servir arquivos estáticos em produção

### Infraestrutura
- **Docker Compose** com 4 containers (PostgreSQL, Redis, backend, frontend)
- **Railway** para deploy em produção

## Funcionalidades

- Cadastro e login com autenticação JWT (access + refresh token)
- Criação, edição e exclusão de posts (apenas autor)
- Upload de imagem nos posts e no perfil
- Suporte a **markdown** no conteúdo dos posts (headings, negrito, itálico, listas, código, links, citações)
- Preview do markdown antes de publicar
- **@menções** clicáveis no conteúdo
- Sistema de likes com atualização otimista
- Comentários com edição, exclusão (com confirmação) e contagem
- Follow/unfollow de usuários
- Sidebar com sugestões "Quem seguir" e lista "Seguindo"
- Feed com filtros: posts recentes, meus posts, posts curtidos
- Ordenação por recentes ou em alta (trending)
- Scroll infinito com IntersectionObserver
- Edição de perfil (foto, username, bio)
- **Chat em tempo real** via WebSocket (widget flutuante estilo LinkedIn)
- **Notificações** de follows, likes e comentários
- **Dark mode** com alternância claro/escuro
- Internacionalização completa (Português e Inglês)
- Seletor de emojis integrado na criação de posts
- Design responsivo com layout de 3 colunas

## Estrutura do Projeto

```
CodeLeap/
├── docker-compose.yml
├── frontend/                # Aplicação React
│   ├── src/
│   │   ├── api/             # Clients HTTP (Axios)
│   │   ├── components/      # Componentes reutilizáveis
│   │   │   ├── chat/        # ChatWidget, ChatWindow, ChatBubble, ConversationList
│   │   │   ├── feed/        # PostCard, PostList, CreatePostBox
│   │   │   ├── layout/      # TopBar, Sidebar, RightSidebar
│   │   │   ├── modals/      # EditPost, DeleteConfirm, EditProfile
│   │   │   └── shared/      # Avatar, Spinner, TimeAgo, MentionText
│   │   ├── context/         # AuthContext, ThemeContext
│   │   ├── hooks/           # usePosts, useComments, useSuggestions, useChat, useWebSocket
│   │   ├── i18n/            # Traduções e LanguageContext
│   │   ├── pages/           # LoginPage, RegistrationPage, MainFeedPage
│   │   ├── types/           # Interfaces TypeScript
│   │   └── utils/           # Funções utilitárias
│   └── ...
└── backend/                 # API Django
    ├── api/
    │   ├── models/          # User, Post, Like, Comment, Follow, Notification
    │   ├── views/           # Views da API REST
    │   ├── serializers/     # Serializers DRF
    │   └── urls/            # Rotas da API
    ├── chat/
    │   ├── models.py        # Conversation, Message
    │   ├── consumers.py     # WebSocket consumer
    │   ├── middleware.py     # JWT auth para WebSocket
    │   ├── views.py         # REST endpoints do chat
    │   └── routing.py       # Rotas WebSocket
    └── ...
```

## Como Executar

### Pré-requisitos
- [Docker](https://www.docker.com/) e Docker Compose instalados

### Subindo o projeto

```bash
# Clonar o repositório
git clone https://github.com/TaliaPacheco/CodeLeap.git
cd CodeLeap

# Subir todos os containers
docker compose up --build

# Em outro terminal, rodar as migrations
docker compose exec backend python manage.py migrate

# (Opcional) Criar um superusuário para acessar o admin Django
docker compose exec backend python manage.py createsuperuser
```

Após isso, acesse:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/
- **Admin Django:** http://localhost:8000/admin/

### Executando sem Docker

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Endpoints da API

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register/` | Cadastro de usuário |
| POST | `/api/auth/login/` | Login (retorna tokens JWT) |
| POST | `/api/auth/token/refresh/` | Renovar access token |
| POST | `/api/auth/logout/` | Logout |

### Usuários
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/users/me/` | Perfil do usuário logado |
| PATCH | `/api/users/me/` | Atualizar perfil |
| GET | `/api/users/:username/` | Perfil público |
| GET | `/api/users/suggestions/` | Sugestões de quem seguir |
| GET | `/api/users/following/` | Lista de quem o usuário segue |
| POST | `/api/users/:username/follow/` | Seguir usuário |
| DELETE | `/api/users/:username/follow/` | Deixar de seguir |

### Posts
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/posts/` | Feed (query: `?sort=recent\|trending`, `?author=me`, `?liked=true`) |
| POST | `/api/posts/` | Criar post |
| GET | `/api/posts/:id/` | Detalhes do post |
| PATCH | `/api/posts/:id/` | Editar post (apenas autor) |
| DELETE | `/api/posts/:id/` | Excluir post (apenas autor) |
| POST | `/api/posts/:id/like/` | Curtir post |
| DELETE | `/api/posts/:id/like/` | Descurtir post |

### Comentários
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/posts/:id/comments/` | Listar comentários do post |
| POST | `/api/posts/:id/comments/` | Criar comentário |
| PATCH | `/api/posts/comments/:id/` | Editar comentário (apenas autor) |
| DELETE | `/api/posts/comments/:id/` | Excluir comentário (apenas autor) |

### Notificações
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/notifications/` | Listar notificações |
| POST | `/api/notifications/read-all/` | Marcar todas como lidas |
| GET | `/api/notifications/unread-count/` | Contagem de não lidas |

### Chat
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/chat/conversations/` | Listar conversas |
| POST | `/api/chat/conversations/` | Criar nova conversa |
| GET | `/api/chat/conversations/:id/messages/` | Histórico de mensagens |
| POST | `/api/chat/conversations/:id/read/` | Marcar mensagens como lidas |
| WebSocket | `ws/chat/:id/?token=JWT` | Chat em tempo real |

## Telas

### Login
Tela de autenticação com campos de email/username e senha, toggle de idioma (PT/EN) e link para cadastro.

### Cadastro
Formulário com upload de foto de perfil, campos de username, email e senha, checkbox de termos de uso e toggle de idioma.

### Feed Principal
Layout de três colunas:
- **Sidebar esquerda:** navegação (Feed, Meus Posts, Curtidos) e ordenação (Recentes, Em Alta)
- **Centro:** caixa de criação de post com preview de markdown, emoji picker e upload de imagem; lista de posts com scroll infinito
- **Sidebar direita:** sugestões de quem seguir, lista de seguindo e card promocional

### Chat
Widget flutuante no canto inferior direito (estilo LinkedIn) com lista de conversas, janela de chat com mensagens em tempo real via WebSocket e modal para iniciar nova conversa.

## Decisões Técnicas

- **JWT com refresh automático:** o Axios intercepta respostas 401 e renova o token automaticamente, sem o usuário perceber
- **Imagens em base64:** as imagens são armazenadas como BinaryField no Django e trafegam como base64, eliminando a necessidade de configurar storage de arquivos
- **Markdown implícito:** o conteúdo dos posts suporta markdown sem botões extras — o usuário simplesmente escreve a sintaxe e a renderização acontece automaticamente
- **Likes otimistas:** a UI atualiza instantaneamente ao curtir/descurtir, sem esperar a resposta do servidor
- **i18n sem dependência externa:** sistema de traduções leve usando React Context, sem bibliotecas como i18next
- **Scroll infinito:** implementado com IntersectionObserver nativo, sem bibliotecas adicionais
- **WebSocket com reconexão:** o chat usa WebSocket com backoff automático (1s, 2s, 4s... max 10s) para reconexão em caso de queda
- **Dark mode com CSS Variables:** tema claro/escuro implementado via custom properties CSS, sem necessidade de classes Tailwind `dark:` em cada elemento
- **Deploy via Railway:** frontend (Vite dev server) e backend (Daphne ASGI) rodando em containers Docker separados, com PostgreSQL e Redis como serviços gerenciados

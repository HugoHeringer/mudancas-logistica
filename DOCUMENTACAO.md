# Documentação do Projeto

## 📋 Visão Geral

Sistema de Gestão de Mudanças - Plataforma SaaS Multi-tenant

## 🏗️ Arquitectura

### Monorepo Structure

```
mudancas-logistica/
├── packages/
│   ├── shared/        # Tipos, schemas Zod, utilitários
│   ├── backend/       # NestJS API + Prisma ORM
│   ├── admin/         # Painel Administrativo (React + Vite)
│   ├── pwa/           # PWA do Motorista (React + Vite PWA)
│   ├── site/          # Site Público (Next.js)
│   └── superadmin/    # Painel Super-Admin (React + Vite)
├── docker/            # Dockerfiles
└── docker-compose.yml
```

### Multi-Tenancy

O sistema utiliza arquitectura multi-tenant com isolamento lógico:

- **tenantId** em todas as tabelas (exceto super-admin)
- **Subdomínios** para identificação (empresa.plataforma.pt)
- **Middleware** que valida tenant e injeta contexto

## 🚀 Quick Start

### Pré-requisitos

- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker Desktop

### Instalação

```bash
# 1. Clonar e instalar
cd mudancas-logistica
npm install

# 2. Iniciar banco de dados
docker compose up -d

# 3. Configurar .env no backend
cp packages/backend/.env.example packages/backend/.env

# 4. Rodar migrações
npm run db:migrate

# 5. Iniciar desenvolvimento
npm run dev
```

## 📦 Pacotes

### @mudancas/shared

Tipos TypeScript, schemas Zod e utilitários partilhados.

```bash
npm run dev --workspace=packages/shared
```

### @mudancas/backend

API NestJS com Prisma ORM.

**Endpoints principais:**

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | /api/auth/login | Login |
| POST | /api/auth/register | Registar utilizador |
| GET | /api/mudancas | Listar mudanças |
| POST | /api/mudancas | Criar mudança |
| POST | /api/mudancas/:id/aprovar | Aprovar mudança |
| GET | /api/mudancas/dashboard | Dashboard data |
| GET | /api/clientes | Listar clientes |
| GET | /api/motoristas | Listar motoristas |
| GET | /api/veiculos | Listar veículos |
| GET | /api/agenda/mensal/:ano/:mes | Agenda mensal |
| GET | /api/financeiro/resumo | Resumo financeiro |
| GET | /api/comunicacao/templates | Templates de email |
| GET | /api/super-admin/tenants | Todos tenants |
| POST | /api/super-admin/tenants | Criar tenant |

**Swagger:** http://localhost:3333/docs

### @mudancas/admin

Painel administrativo React + Vite + Tailwind.

```bash
npm run dev --workspace=packages/admin
```

### @mudancas/pwa

PWA do motorista com suporte offline.

```bash
npm run dev --workspace=packages/pwa
```

### @mudancas/site

Site público Next.js com SEO.

```bash
npm run dev --workspace=packages/site
```

### @mudancas/superadmin

Painel Super-Admin para gestão da plataforma.

```bash
npm run dev --workspace=packages/superadmin
```

## 🗄️ Database

### Schema Principal

- **Tenant** - Empresas clientes
- **User** - Utilizadores por tenant
- **Mudanca** - Solicitações de mudança
- **Cliente** - Clientes registados
- **Motorista** - Motoristas cadastrados
- **Veiculo** - Veículos da frota
- **Ajudante** - Ajudantes (sem acesso ao sistema)
- **SlotAgenda** - Slots de horário
- **BloqueioAgenda** - Bloqueios de agenda
- **MovimentoFinanceiro** - Receitas e custos
- **EmailTemplate** - Templates de comunicação
- **TenantLog** - Logs de auditoria

### Comandos

```bash
# Abrir Prisma Studio
npm run db:studio

# Criar nova migração
npx prisma migrate dev --name nova_migracao

# Resetar database
npx prisma migrate reset

# Gerar Prisma Client
npx prisma generate
```

## 🔐 Autenticação

### JWT Flow

1. POST /api/auth/login → accessToken + refreshToken
2. accessToken expira em 1d
3. refreshToken expira em 7d
4. POST /api/auth/refresh → novo accessToken

### Perfis

| Perfil | Acesso |
|--------|--------|
| admin | Total |
| gerente | Tudo exceto financeiro e configurações |
| financeiro | Apenas relatórios e financeiro |
| operacional | Aprovações, agenda, mudancas, clientes |
| motorista | PWA apenas |

## 📊 Endpoints por Módulo

### Mudanças

```
GET    /api/mudancas              # Listar (com filtros)
GET    /api/mudancas/dashboard    # Dashboard
GET    /api/mudancas/:id          # Detalhe
POST   /api/mudancas              # Criar
PATCH  /api/mudancas/:id          # Atualizar
POST   /api/mudancas/:id/aprovar  # Aprovar
POST   /api/mudancas/:id/iniciar  # Iniciar deslocamento
POST   /api/mudancas/:id/em-servico
POST   /api/mudancas/:id/concluir # Concluir com ficha
POST   /api/mudancas/:id/recusar
POST   /api/mudancas/:id/cancelar
DELETE /api/mudancas/:id
```

### Agenda

```
GET  /api/agenda/slots/:data
GET  /api/agenda/slots
GET  /api/agenda/disponibilidade/:data
GET  /api/agenda/semanal/:dataInicio
GET  /api/agenda/mensal/:ano/:mes
POST /api/agenda/slots/:data
POST /api/agenda/bloqueios
DELETE /api/agenda/bloqueios/:id
```

### Financeiro

```
GET  /api/financeiro/resumo
GET  /api/financeiro/movimentos
GET  /api/financeiro/breakdown/motoristas
GET  /api/financeiro/breakdown/tipo-servico
GET  /api/financeiro/gastos-detalhados
POST /api/financeiro/movimentos
```

## 🎨 Frontend

### Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui (componentes)
- React Query (data fetching)
- Zustand (state management)
- React Hook Form + Zod (formulários)

### Estrutura de Pastas (Admin)

```
packages/admin/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas por feature
│   ├── hooks/          # Hooks customizados
│   ├── lib/            # Utilitários, API client
│   ├── stores/         # Zustand stores
│   └── types/          # Tipos TypeScript
```

## 📱 PWA Motorista

### Features

- Offline-first com Workbox
- Install prompt
- Push notifications (futuro)
- Background sync (futuro)

### Estados da Mudança

1. **Por iniciar** - Aguardando início
2. **A caminho** - Motorista em deslocamento
3. **Em serviço** - No local da mudança
4. **Concluído** - Ficha preenchida

## 🌐 Site Público

### Next.js Pages

- `/` - Home
- `/agendar` - Fluxo normal com calendário
- `/urgente` - Fluxo urgente direto ao formulário
- `/servicos` - Serviços
- `/sobre` - Sobre a empresa
- `/contacto` - Contacto

## 📝 Testes

```bash
# Backend
npm run test --workspace=packages/backend

# Frontend
npm run test --workspace=packages/admin

# Coverage
npm run test:cov --workspace=packages/backend
```

## 🚢 Deploy

### Backend (Railway/Render)

```bash
npm run build --workspace=packages/backend
npm run start:prod --workspace=packages/backend
```

### Frontend (Vercel)

```bash
npm run build --workspace=packages/admin
```

## 📄 Licença

Confidencial - 2026

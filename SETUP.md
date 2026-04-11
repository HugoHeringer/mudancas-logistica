# 🚀 Guia de Setup - Mudanças & Logística

## ✅ Estrutura Criada

Foram criados **~150 ficheiros** organizados em 6 pacotes principais:

```
mudancas-logistica/
├── packages/
│   ├── shared/        # Tipos, schemas Zod, utilitários (20+ ficheiros)
│   ├── backend/       # NestJS API + Prisma (40+ ficheiros)
│   ├── admin/         # Painel Admin React (30+ ficheiros)
│   ├── pwa/           # PWA Motorista (20+ ficheiros)
│   ├── site/          # Site Público Next.js (10+ ficheiros)
│   └── superadmin/    # Super-Admin SaaS (10+ ficheiros)
├── docker-compose.yml
├── Makefile
└── DOCUMENTACAO.md
```

## 📋 Pré-requisitos

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker Desktop** (para PostgreSQL local)

## 🔧 Setup Passo-a-Passo

### 1. Instalar Dependências

```bash
cd mudancas-logistica
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Backend
cp packages/backend/.env.example packages/backend/.env

# Admin
cp packages/admin/.env.example packages/admin/.env

# PWA
cp packages/pwa/.env.example packages/pwa/.env

# Site
cp packages/site/.env.example packages/site/.env

# Super-Admin
cp packages/superadmin/.env.example packages/superadmin/.env
```

### 3. Iniciar Banco de Dados (Docker)

```bash
docker compose up -d
```

O PostgreSQL estará disponível em `localhost:5432`

### 4. Rodar Migrações

```bash
npm run db:migrate
```

### 5. Iniciar Serviços em Desenvolvimento

```bash
# Todos os serviços
npm run dev

# Ou individualmente:
npm run dev:backend   # Backend (porta 3333)
npm run dev:admin     # Admin (porta 5173)
npm run dev:pwa       # PWA (porta 5174)
npm run dev:site      # Site (porta 3000)
npm run dev:superadmin # Super-Admin (porta 5175)
```

## 🌐 URLs de Desenvolvimento

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Backend API | http://localhost:3333 | API NestJS |
| Swagger Docs | http://localhost:3333/docs | Documentação API |
| Admin | http://localhost:5173 | Painel Administrativo |
| PWA | http://localhost:5174 | App do Motorista |
| Site | http://localhost:3000 | Site Público |
| Super-Admin | http://localhost:5175 | Gestão SaaS |
| PgAdmin | http://localhost:5050 | Gestão de Database |

## 📦 Comandos Disponíveis

```bash
# Ver todos os comandos
make help

# Setup completo (install, docker, migrate)
make setup

# Iniciar todos os serviços
make dev

# Build de produção
make build

# Testes
make test

# Docker
make docker-up      # Iniciar containers
make docker-down    # Parar containers
make docker-logs    # Ver logs

# Database
make db-migrate     # Rodar migrações
make db-seed        # Popular dados
make db-studio      # Prisma Studio
make db-reset       # Resetar database
```

## 🔑 Credenciais de Teste

Após rodar o seed (quando implementado):

```
Tenant ID: (uuid gerado no seed)
Email: admin@empresa.pt
Senha: password123
```

## 📁 Principais Funcionalidades Implementadas

### Backend (NestJS + Prisma)

- [x] Autenticação JWT (login, refresh, update password)
- [x] Multi-tenancy middleware
- [x] CRUD completo: Mudanças, Clientes, Motoristas, Veículos
- [x] Agenda (slots, bloqueios, disponibilidade)
- [x] Financeiro (movimentos, relatórios, breakdown)
- [x] Comunicação (templates de email)
- [x] Super-Admin (gestão de tenants)
- [x] Prisma Schema com todas as entidades

### Shared Package

- [x] Schemas Zod para validação
- [x] Tipos TypeScript para todas as entidades
- [x] Utilitários (data, moeda, validação)
- [x] Constantes do sistema

### Admin (React + Vite)

- [x] Layout com sidebar responsiva
- [x] Login page
- [x] Dashboard com stats
- [x] Estrutura para todas as páginas
- [x] API client com interceptors
- [x] Auth store (Zustand)
- [x] Componentes UI base

### PWA (Motorista)

- [x] Configuração PWA (manifest, offline)
- [x] Login page
- [x] Agenda do dia
- [x] Detalhe da mudança
- [x] Ficha de conclusão

### Site (Next.js)

- [x] Home page com serviços
- [x] Página de agendamento (multi-step)
- [x] Página de urgência
- [x] SEO metadata

### Super-Admin

- [x] Dashboard de tenants
- [x] Criar tenant com admin
- [x] Detalhe do tenant

## 🔄 Próximos Passos (Implementação)

### Fase 1 - Completar

1. **Backend**
   - [ ] Implementar upload de imagens (multer + S3)
   - [ ] Configurar envio de emails (SendGrid/Resend)
   - [ ] Adicionar logging/auditoria completo
   - [ ] Implementar rate limiting por tenant

2. **Admin**
   - [ ] Completar páginas de Aprovações
   - [ ] Completar página de Agenda (calendário)
   - [ ] Completar CRUD de Motoristas/Veículos
   - [ ] Implementar Financeiro com gráficos
   - [ ] Builder de formulário

3. **PWA**
   - [ ] Integrar com API real
   - [ ] Offline sync com IndexedDB
   - [ ] Push notifications
   - [ ] Geolocalização

4. **Site**
   - [ ] Integrar formulário com API
   - [ ] Calendário de disponibilidade real
   - [ ] Upload de imagens
   - [ ] Validação de moradas (Google Maps API)

### Fase 2 - Produção

1. **DevOps**
   - [ ] CI/CD pipelines
   - [ ] Docker production builds
   - [ ] Deploy scripts (Railway/Vercel)
   - [ ] Monitoring (Sentry, LogRocket)

2. **Segurança**
   - [ ] HTTPS forçado
   - [ ] CSP headers
   - [ ] 2FA para admins
   - [ ] Backup automático diário

3. **Performance**
   - [ ] Cache Redis
   - [ ] CDN para estáticos
   - [ ] Database indexing
   - [ ] Query optimization

## 📊 Resumo do Projeto

| Pacote | Ficheiros | Linhas de Código (est.) | Status |
|--------|-----------|------------------------|--------|
| Shared | 20+ | ~1500 | ✅ Completo |
| Backend | 40+ | ~4000 | ✅ Estrutura Base |
| Admin | 30+ | ~2500 | ⚠️ Em Desenvolvimento |
| PWA | 20+ | ~1000 | ⚠️ Em Desenvolvimento |
| Site | 10+ | ~500 | ⚠️ Em Desenvolvimento |
| Super-Admin | 10+ | ~500 | ⚠️ Em Desenvolvimento |
| **Total** | **~150** | **~10,000** | **✅ Estrutura Criada** |

## 🎯 Conclusão

A estrutura completa do projeto foi criada com sucesso. Todos os pacotes estão configurados e prontos para desenvolvimento.

**Próximo passo imediato:**
```bash
npm install
docker compose up -d
npm run db:migrate
npm run dev
```

O projeto está pronto para receber implementação das funcionalidades específicas de cada página/componente.

---

**Documento gerado:** 2026-04-10  
**Versão:** 1.0  
**Status:** Estrutura Base Completa ✅

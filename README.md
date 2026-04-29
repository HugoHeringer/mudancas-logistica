# Movefy

Plataforma SaaS Multi-tenant para Gestao de Empresas de Mudancas

## Visao Geral

Plataforma completa para gestao de empresas de mudancas portuguesas, composta por:

- **Movefy.pt** - Site institucional B2B com landing page, precos e registo trial
- **Site Publico** - Vitrine dinamica por tenant para clientes solicitarem mudancas
- **Painel Administrativo** - Gestao completa do negocio (dashboard, agenda, clientes, financeiro)
- **PWA do Motorista** - App mobile para equipas em campo
- **Movefy Console** - Gestao da plataforma SaaS (super-admin)

## Arquitectura

```
mudancas-logistica/
├── packages/
│   ├── backend/       # NestJS + PostgreSQL + Prisma + Resend
│   ├── admin/         # React + Vite + Tailwind (Painel Admin)
│   ├── pwa/           # React + Vite PWA (Motorista)
│   ├── site/          # Vite + React (Site Publico por tenant)
│   ├── movefy-site/   # Next.js 15 App Router (Site Institucional movefy.pt)
│   ├── superadmin/    # React + Vite (Movefy Console)
│   └── shared/        # Tipos, schemas e utilitarios partilhados
```

## Stack Tecnica

| Camada | Tecnologia |
|--------|-----------|
| Backend | NestJS, Prisma ORM, PostgreSQL (Supabase), JWT, bcrypt |
| Admin | React 19, Vite, Tailwind CSS, React Query |
| PWA | React 19, Vite, vite-plugin-pwa, Workbox |
| Site Publico | Vite, React, Tailwind CSS |
| Movefy.pt | Next.js 15 (App Router), React 19, Zod, JSON-LD |
| Console | React 19, Vite, Tailwind CSS, React Query |
| Email | Resend (emails transaccionais) |
| Base de Dados | PostgreSQL (Supabase) com 16 modelos Prisma |

## Modelos de Dados

Tenant, User, Cliente, Motorista, Ajudante, Veiculo, Mudanca, SlotAgenda, BloqueioAgenda, MovimentoFinanceiro, EmailTemplate, EmailLog, Notificacao, CampoFormulario, Ficheiro, TenantLog

## Quick Start

### Pre-requisitos
- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL (local ou Supabase)

### Instalacao

```bash
# Instalar dependencias
npm install

# Rodar migracoes
npm run db:migrate

# Iniciar todos os servicos em desenvolvimento
npm run dev
```

### Acesso em Desenvolvimento

| Servico | URL | Package |
|---------|-----|---------|
| Backend API | http://localhost:3333 | `@mudancas/backend` |
| Admin | http://localhost:5173 | `@mudancas/admin` |
| PWA | http://localhost:5174 | `@mudancas/pwa` |
| Console | http://localhost:5175 | `@mudancas/superadmin` |
| Site Publico | http://localhost:5176 | `@mudancas/site` |
| Movefy.pt | http://localhost:3002 | `@mudancas/movefy-site` |

### Scripts Principais

```bash
npm run dev              # Iniciar todos os servicos
npm run dev:backend      # Apenas backend
npm run dev:admin        # Apenas admin
npm run dev:pwa          # Apenas PWA
npm run dev:site         # Apenas site publico
npm run dev:superadmin   # Apenas console
npm run dev:movefy-site  # Apenas movefy.pt
npm run build:movefy-site # Build do site institucional
npm run db:migrate       # Rodar migracoes Prisma
npm run db:seed          # Seed da base de dados
```

## Funcionalidades

### Multi-tenant
- Resolucao por subdominio ou slug
- Base de dados isolada por tenant
- Configuracoes de marca, precos e agenda por empresa

### Autenticacao e Autorizacao
- JWT com refresh tokens
- Perfis: admin, gerente, financeiro, operacional, motorista
- Guard de super-admin para o Movefy Console
- Rate limiting no endpoint de trial publico

### Financeiro
- Calculo automatico com base em ConfigPreco e snapshots gravados
- Acrescimos por ajudantes e urgencia
- Registo de movimentos financeiros por mudanca

### Comunicacao
- Templates de email personalizados por tenant
- Envio via Resend (confirmacao, aprovacao, deslocamento, conclusao, recusa)
- Notificacoes in-app

### SEO e Conversao
- JSON-LD (SoftwareApplication, FAQPage) no site institucional
- Sitemap e robots.txt dinamicos
- Meta tags completas por pagina
- Formulario de registo trial com validacao Zod

## Licenca

Confidencial - 2026

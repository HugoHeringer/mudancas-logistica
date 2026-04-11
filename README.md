# Mudanças & Logística

Sistema de Gestão de Mudanças - Plataforma SaaS Multi-tenant

## 📋 Visão Geral

Plataforma completa para gestão de empresas de mudanças, composta por:

- **Site Público** - Vitrine para clientes solicitarem mudanças
- **Painel Administrativo** - Gestão completa do negócio
- **PWA do Motorista** - App mobile para equipas em campo
- **Super-Admin** - Gestão da plataforma SaaS

## 🏗️ Arquitectura

```
mudancas-logistica/
├── packages/
│   ├── backend/       # NestJS + PostgreSQL + Prisma
│   ├── admin/         # React + Vite + Tailwind (Painel Admin)
│   ├── pwa/           # React + Vite PWA (Motorista)
│   ├── site/          # Next.js (Site Público)
│   ├── superadmin/    # React + Vite (Super-Admin)
│   └── shared/        # Tipos, schemas e utilitários partilhados
└── docker/            # Configuração Docker
```

## 🚀 Quick Start

### Pré-requisitos
- Node.js >= 20.0.0
- npm >= 10.0.0
- Docker Desktop (para PostgreSQL local)

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar banco de dados local
docker compose up -d

# Rodar migrações
npm run db:migrate

# Iniciar todos os serviços em desenvolvimento
npm run dev
```

### Acesso em Desenvolvimento

| Serviço | URL |
|---------|-----|
| Admin | http://localhost:5173 |
| PWA | http://localhost:5174 |
| Site | http://localhost:3000 |
| Super-Admin | http://localhost:5175 |
| Backend API | http://localhost:3333 |

## 📦 Estrutura do Projeto

Ver [DOCUMENTACAO.md](./DOCUMENTACAO.md) para detalhes completos.

## 📄 Licença

Confidencial - 2026

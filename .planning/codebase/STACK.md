# Tech Stack

## Core Technologies
- **Runtime**: Node.js (>= 20.0.0)
- **Language**: TypeScript (v5.7.3)
- **Monorepo Manager**: NPM Workspaces / Turborepo (implied)

## Backend (@mudancas/backend)
- **Framework**: NestJS (v11.0.1)
- **ORM**: Prisma (v6.3.1)
- **Database**: PostgreSQL (Prisma Client)
- **Authentication**: Passport.js with JWT and Local strategies
- **Validation**: Zod (v3.24.1), class-validator, class-transformer
- **Logging/Utilities**: RxJS, reflect-metadata
- **Security**: Helmet, Compression, Throttler
- **Documentation**: Swagger (@nestjs/swagger)

## Frontend Admin (@mudancas/admin)
- **Library**: React (v19.0.0)
- **Build Tool**: Vite (v6.1.0)
- **Styling**: Tailwind CSS, Radix UI (Primitives), Lucide React (Icons)
- **State Management**: Zustand (v5.0.3)
- **Data Fetching**: TanStack Query (v5.66.0)
- **Routing**: React Router Dom (v7.1.5)
- **Forms**: React Hook Form with Zod resolvers
- **Tables**: TanStack Table (v8.21.2)
- **Charts**: Recharts (v2.15.1)

## Frontend PWA (@mudancas/pwa)
- *Assumed similar to Admin based on project context*

## Shared (@mudancas/shared)
- Contains schemas, types, utils, and constants used by both backend and frontend.

## Infrastructure
- **Containerization**: Docker, Docker Compose
- **Deployment**: Railway (indicated by railway.json)
- **Email**: Resend (v6.11.0)

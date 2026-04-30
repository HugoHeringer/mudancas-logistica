# Architecture

## High-Level Pattern
- **Monorepo**: Modularized codebase split into functional packages (Backend, Admin, PWA, Site, Shared).
- **Multi-tenant SaaS**: The system is designed to support multiple "tenants" (moving companies) with data isolation.

## Backend Architecture (NestJS)
- **Modular Design**: Each domain (mudanca, cliente, motorista, etc.) has its own module containing:
  - **Controllers**: Handle HTTP requests and routing.
  - **Services**: Contain business logic and interact with Prisma.
  - **DTOs**: Data Transfer Objects for request validation.
- **Middleware**: Used for tenant resolution (extracting tenantId from JWT or query).
- **Guards**: Role-based access control (RBAC) and SuperAdmin protection.

## Frontend Architecture (React)
- **Component-Based**: UI built with reusable components (Radix UI + Tailwind).
- **State Management**: Zustand for global state (Auth, Theme).
- **Query Management**: TanStack Query for server state synchronization and caching.
- **Layouts**: Consistent page structure across the application.
- **Form Management**: React Hook Form for efficient form handling with Zod validation.

## Data Flow
1. User interacts with Frontend (Admin/PWA/Site).
2. Request sent to Backend API with Authentication (JWT).
3. Backend Middleware resolves Tenant context.
4. Controller routes to Service.
5. Service interacts with PostgreSQL via Prisma.
6. Response returned to Frontend.
7. Frontend updates UI state (TanStack Query/Zustand).

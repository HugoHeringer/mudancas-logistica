# Conventions

## Coding Standards
- **Language**: TypeScript throughout.
- **Backend Framework**: NestJS patterns (Dependency Injection, Controllers/Services).
- **Frontend Framework**: Functional components with Hooks.
- **Naming Conventions**:
  - **Domains**: Portuguese terms for business concepts (mudanca, ajudante, etc.).
  - **Technical**: English terms for infrastructure (Service, Controller, Module).
  - **Files**: kebab-case (e.g., `nova-mudanca.page.tsx`).
  - **Variables/Functions**: camelCase.
  - **Classes/Interfaces**: PascalCase.

## API Patterns
- RESTful principles where applicable.
- Authentication via JWT in the Authorization header (`Bearer <token>`).
- Consistent error handling via `AllExceptionsFilter` returning JSON errors.

## Frontend Patterns
- **Tailwind CSS**: Primary styling method.
- **Radix UI**: Accessible UI primitives.
- **Lucide**: Consistent icon set.
- **Zustand**: Global state for non-ephemeral data.
- **React Hook Form**: Mandatory for form handling with Zod validation.

## Git & Workflow
- Mono-repository structure.
- Task-driven development (as seen in `checklist-teste1.md`).
- Focus on "Premium Design" and "Visual Excellence" as per project rules.

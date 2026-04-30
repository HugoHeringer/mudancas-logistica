# Structure

## Directory Overview
```text
/
├── packages/
│   ├── admin/          # Admin dashboard (React/Vite)
│   ├── backend/        # NestJS API
│   ├── movefy-site/    # Marketing/Institutional site (Next.js/Vite)
│   ├── pwa/            # Driver/Field worker app (React)
│   ├── shared/         # Shared logic, types, and schemas
│   ├── site/           # Public customer-facing site
│   └── superadmin/     # Platform administration panel
├── docker/             # Docker configuration files
├── .planning/          # Project planning and codebase mapping
└── uploads/            # (In backend) Local storage for uploaded files
```

## Package Deep Dive: Backend
- `src/`: Core logic.
  - `[module]/`: Domain modules (agenda, mudanca, etc.).
  - `common/`: Global filters, interceptors, and middleware.
  - `prisma/`: Database connection and service.
  - `test-runner/`: Custom internal test execution module.

## Package Deep Dive: Frontend (Admin/PWA)
- `src/`: Source code.
  - `components/`: UI building blocks.
  - `hooks/`: Custom React hooks.
  - `pages/`: Page-level components.
  - `stores/`: Zustand stores.
  - `lib/`: API clients (Axios) and utility libraries.
  - `theme/`: Branding and visual configuration.

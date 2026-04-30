# Integrations

## External Services
- **Resend**: Used for sending emails (transactional notifications, auth).
- **Prisma/PostgreSQL**: Primary data persistence.
- **Local File System**: Used for file uploads (stored in `packages/backend/uploads/`).

## Internal Integrations (Monorepo)
- **Shared Package**: Centralized schemas (Zod) and TypeScript types ensuring consistency across services.
- **REST API**: Backend exposes a JSON REST API consumed by Admin, PWA, and Site.
- **Tenant Isolation**: Multi-tenant system where data is filtered by `tenantId` in most queries.

## Potential Integrations (Based on Domain)
- **Google Maps**: Likely used or planned for location/address selection (noted `localidade` vs `locality` concerns).
- **Payment Gateway**: Planned or implied for billing (not explicitly found in current main deps, but domain suggests it).
- **Calendar**: Integration with Google Calendar or similar suggested in conversation history.

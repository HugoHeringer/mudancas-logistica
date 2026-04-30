# Testing

## Strategy
- **Unit/Integration Testing**: Primarily handled via `Jest` (as seen in `package.json` scripts).
- **Internal Test Runner**: The backend contains a custom `test-runner` module (`packages/backend/src/test-runner`) allowing the execution of test suites via HTTP endpoints.
- **Checklist-Driven QA**: Use of markdown checklists (`checklist.md`, `checklist-teste1.md`) for manual and systematic verification of features.

## Test Types
- **Backend**: Jest suites for services and controllers.
- **Frontend**: Linting and type checking (TSC). (E2E testing infrastructure not explicitly detailed but might be planned).

## Execution
- `npm run test`: Runs tests across all workspaces.
- `packages/backend/src/test-runner`: Custom logic for running specific scenarios and suites.
- `test-logs/`: Local directory in backend for storing test output.

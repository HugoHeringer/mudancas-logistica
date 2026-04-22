# Makefile para desenvolvimento

.PHONY: help install dev build test clean docker-up docker-down db-migrate db-seed

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	npm install

dev: ## Start all services in development mode
	npm run dev

dev-backend: ## Start only backend
	npm run dev:backend

dev-admin: ## Start only admin frontend
	npm run dev:admin

dev-pwa: ## Start only PWA
	npm run dev:pwa

dev-site: ## Start only site public
	npm run dev:site

build: ## Build all services
	npm run build

test: ## Run tests
	npm run test

lint: ## Run linter
	npm run lint --workspaces

docker-up: ## Start Docker containers
	docker compose up -d

docker-down: ## Stop Docker containers
	docker compose down

docker-logs: ## Show Docker logs
	docker compose logs -f

db-migrate: ## Run database migrations
	npm run db:migrate --workspace=@mudancas/backend

db-seed: ## Seed database
	npm run db:seed --workspace=@mudancas/backend

db-studio: ## Open Prisma Studio
	npm run db:studio --workspace=@mudancas/backend

db-reset: ## Reset database
	npm run db:migrate --workspace=@mudancas/backend -- --reset

clean: ## Clean build artifacts
	rm -rf packages/*/dist
	rm -rf packages/*/node_modules
	rm -rf node_modules

setup: install docker-up db-migrate db-seed ## Full setup: install, docker, migrate, seed

# Mudanças Logística

## What This Is

Sistema de Gestão de Mudanças (SaaS Multi-tenant) desenhado para empresas transportadoras. O produto automatiza todo o ciclo de vida de uma mudança: desde o agendamento público e orçamento, até a aprovação operacional, execução via PWA para motoristas/ajudantes e análise financeira para os administradores.

## Core Value

Entregar um sistema robusto, sem bugs de isolamento de dados, que forneça análises potentes para decisões de negócio enquanto mantém uma experiência visual premium e intuitiva (Curated Transit).

## Requirements

### Validated

- ✓ Estrutura base Multi-tenant (Prisma + NestJS) — existing
- ✓ Autenticação JWT e RBAC (Admin, Operacional, Motorista) — existing
- ✓ Módulo de Gestão de Motoristas e Veículos — existing
- ✓ Fluxo de Upload de Ficheiros local — existing
- ✓ Mapeamento de Codebase (.planning/codebase) — Phase 0

### Active

- [ ] Correção total de bugs de isolamento de tenant (filtros tenantId)
- [ ] Dashboard com dados reais e coerentes (correção de contadores e agregadores)
- [ ] Agenda persistente com slots dinâmicos integrados ao fluxo de aprovação
- [ ] Redesign Visual Premium (Curated Transit) em todos os módulos (Admin, PWA, Site)
- [ ] Fluxo de aprovação robusto com atribuição correta de recursos (Motoristas/Veículos)
- [ ] PWA funcional com cache offline e UX simplificada para motoristas

### Out of Scope

- Expansão para outros setores de logística (ex: entregas expressas) — focado 100% em mudanças no momento.
- Integração com gateways de pagamento externos — não priorizado nesta fase de correção e UX.
- Aplicativo Mobile Nativo — foco total no PWA para field workers.

## Context

O projeto já possui uma base tecnológica sólida (NestJS/React v19/Prisma), mas sofreu com inconsistências de lógica em versões anteriores. O arquivo `DIAGNOSTICO_COMPLETO.md` detalha 45 correções necessárias, das quais as de segurança e isolamento foram as primeiras priorizadas. Atualmente, o projeto está em uma fase de estabilização e "salto de qualidade" visual.

## Constraints

- **Tech Stack**: NestJS, React v19, Prisma, PostgreSQL, Tailwind CSS — Escolhas fundamentais do projeto.
- **Data Integrity**: Inegociável — dados entre tenants nunca podem vazar e os cálculos financeiros devem ser exatos.
- **Design**: Deve seguir a estética "Curated Transit" (vibrante, moderna, glassmorphism) conforme o sucesso da página de vendas (localhost:3002).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monorepo c/ NPM Workspaces | Facilita a partilha de schemas (Zod) e tipos entre backend e múltiplos frontends. | ✓ Good |
| Estética Curated Transit | Diferenciação de mercado através de design premium e editorial. | — Pending |
| Armazenamento Local (Uploads) | Simplicidade inicial, mas monitorar para futura migração para Cloud Storage. | ⚠️ Revisit |

## Evolution

Este documento evolui nas transições de fase e marcos do projeto.

**Após cada transição de fase** (via `/gsd-transition`):
1. Requisitos invalidados? → Mover para Out of Scope com motivo
2. Requisitos validados? → Mover para Validated com referência à fase
3. Novos requisitos surgiram? → Adicionar em Active
4. Decisões a registar? → Adicionar em Key Decisions
5. "What This Is" ainda está preciso? → Atualizar se houve derivação

**Após cada marco (milestone)** (via `/gsd-complete-milestone`):
1. Revisão completa de todas as secções
2. Verificação do Core Value — ainda é a prioridade correta?
3. Auditoria de Out of Scope — motivos ainda válidos?
4. Atualizar Contexto com o estado atual

---
*Last updated: 2026-04-30 after initialization*

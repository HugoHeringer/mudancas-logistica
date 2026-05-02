# Roadmap: Mudanças Logística

## Overview

O projeto focará inicialmente na estabilização crítica (segurança, isolamento de tenants e integridade de dados) para garantir uma fundação robusta. Em seguida, avançaremos para a transformação visual "Curated Transit", elevando a experiência do utilizador (Admin, PWA e Site) para um padrão premium e editorial, com dados precisos e úteis para análise de negócio.

## Phases

- [ ] **Phase 1: Estabilização e Integridade de Dados** - Correção de bugs críticos de isolamento, fluxos de aprovação e dashboard.
- [ ] **Phase 2: Redesign Premium e Polimento UX** - Implementação da estética Curated Transit e melhorias de usabilidade no PWA e Admin.

## Phase Details

### Phase 1: Estabilização e Integridade de Dados
**Goal**: Garantir que o sistema seja robusto, seguro entre tenants e que os dados exibidos no dashboard sejam 100% confiáveis.
**Depends on**: Nothing (Mapeamento de codebase concluído)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, FLOW-01, FLOW-02, FLOW-03, FLOW-04
**Success Criteria**:
  1. Usuários de um tenant não conseguem visualizar ou modificar dados de outro tenant (verificado via testes de isolamento).
  2. O Dashboard exibe receitas e contagens de mudanças corretas para o mês atual.
  3. Aprovar uma mudança atribui corretamente motoristas/veículos e ocupa o slot na agenda.
  4. Slots de agenda são persistidos no banco de dados quando gerados.
**Plans**: 3 plans

Plans:
- [ ] 01-01: Correção de Isolamento de Tenant e Segurança (Middleware/Guards)
- [ ] 01-02: Integridade de Dados do Dashboard e Lógica de Datas
- [ ] 01-03: Refatoração do Fluxo de Aprovação e Persistência de Agenda

### Phase 2: Redesign Premium e Polimento UX
**Goal**: Transformar a interface num produto premium (Curated Transit) e otimizar a experiência de uso no Admin e PWA.
**Depends on**: Phase 1
**Requirements**: UI-01, UI-02, UI-03, UI-04, PERF-01, OFFL-01
**Success Criteria**:
  1. Interface Admin utiliza o novo sistema de cores, tipografia e glassmorphism.
  2. Dashboard visualmente impactante com gráficos Recharts estilizados.
  3. PWA com persistência de auth robusta e navegação fluida.
  4. Todos os textos do sistema padronizados em Português e sem termos técnicos desnecessários.
**Plans**: 3 plans

Plans:
- [ ] 02-01: Implementação do Design System Curated Transit (Core UI)
- [ ] 02-02: Redesign do Dashboard e Páginas Operacionais (Admin)
- [ ] 02-03: Polimento de UX no PWA e Performance (Server-side filtering)

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Estabilização | 0/3 | Not started | - |
| 2. Redesign Premium | 0/3 | Not started | - |

---
*Roadmap defined: 2026-04-30*
*Last updated: 2026-04-30 after initial definition*

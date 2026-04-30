# Phase 1: Estabilização e Integridade de Dados - Context

**Gathered:** 2026-04-30
**Status:** Ready for planning
**Source:** PRD Express Path (MOVEFY_CORRECOES_V2.md)

<domain>
## Phase Boundary

Esta fase foca na estabilização crítica do sistema, garantindo segurança entre tenants (isolamento), integridade no fluxo de dados (uploads, estados de entidades) e confiabilidade nas regras de negócio (conflitos de agenda, dashboard e disponibilidade). O objetivo é sair de um estado de "muitos bugs pequenos mas críticos" para uma fundação estável pronta para o redesign visual da Fase 2.

</domain>

<decisions>
## Implementation Decisions

### Bloco A: Trial e Activação de Tenant
- **Isolamento e Trial:** Implementar campos `trialInicio`, `trialFim` e `trialNotificadoEm` no modelo `Tenant`.
- **Tenant Guard:** Criar `tenant-active.guard.ts` para bloquear tenants expirados ou suspensos (erro 402).
- **Automação:** Adicionar cron job diário para verificar expiração de trial e notificar/bloquear.
- **UI Superadmin:** Exibir badges de estado e contador de dias de trial.

### Bloco B: Upload de Imagens e Validação
- **Sharp Integration:** Utilizar `sharp` no backend para resize automático (Veículo: 800x600, Logo: 400x400, Banner: 1920x600).
- **Fluxo de Upload:** Separar upload (POST `/api/upload/...`) da criação de entidade (JSON com `imagemUrl`).
- **Frontend UX:** Preview imediato da imagem e validação de tamanho/tipo antes da submissão.

### Bloco C: Ciclo de Vida de Estados
- **Automação de Estados:** Estados de Veículo (`disponivel`, `em_manutencao`, `em_servico`) e Motorista (`disponivel`, `em_deslocamento`, `em_servico`, `inativo`) geridos pelo sistema durante o fluxo da mudança.
- **Segurança de Seleção:** Impedir seleção de veículos em manutenção ou ajudantes inativos.
- **Soft Delete:** Inativar motoristas em vez de remover para preservar histórico.

### Bloco D: Conflitos e Aprovações
- **Conflict Detector:** Criar serviço centralizado para detecção de sobreposição de horários (`inicioNovo < fimExistente AND inicioExistente < fimNovo`).
- **Unified UI:** Unificar o modal de aprovação entre a lista de aprovações e o detalhe da mudança.
- **Seleção de Ajudantes:** Migrar de checkboxes para modal de pesquisa (mesmo padrão do motorista).

### Bloco E: Gestão de Utilizadores
- **Auto-criação:** Ao criar motorista no admin, o sistema deve criar automaticamente um utilizador com perfil `motorista`.
- **First Login:** Forçar troca de senha no primeiro acesso ao PWA (`obrigarTrocaSenha: true`).
- **Isolamento de Perfil:** Ocultar perfil `motorista` da gestão manual de utilizadores gerais.

### Bloco F: Dashboard Confiável
- **KPI Queries:** Garantir que todos os KPIs do dashboard usem `tenantId` e filtros de data corretos.
- **Pendentes/Hoje:** Corrigir contagens e permitir navegação direta do card para a lista filtrada.
- **Setup Progress:** Garantir que o contador de configuração do tenant reflita o estado real da agenda.

### Bloco G: Disponibilidade Real
- **Availability Service:** Lógica centralizada para verificar se há recursos (motorista + veículo) livres para um slot de meia em meia hora.
- **Site Público:** Exibir apenas slots com disponibilidade real (meia em meia hora).
- **Urgência:** Aplicar acréscimo de preço configurado para mudanças urgentes no site.

### the agent's Discretion
- Escolha de ícones específicos para placeholders de imagem.
- Formatação exata das mensagens de erro (desde que em Português).
- Estrutura interna do cache de request para o Tenant Guard.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Core Docs
- `MOVEFY_CORRECOES_V2.md` — Fonte original dos requisitos.
- `packages/backend/prisma/schema.prisma` — Esquema de dados a ser alterado.
- `.planning/PROJECT.md` — Contexto global do sistema.

### Technical Patterns
- `packages/backend/src/common/guards/tenant-active.guard.ts` — A ser criado/refatorado.
- `packages/backend/src/mudancas/conflict-detector.service.ts` — Padrão de detecção de conflitos.
- `packages/backend/src/upload/upload.service.ts` — Lógica de manipulação de arquivos.

</canonical_refs>

<specifics>
## Specific Ideas

- Erro 402: Usado especificamente para "Trial Expirado" ou "Conta Suspensa" para facilitar interceptação no frontend.
- Resize Sharp: `fit: 'inside'` para logos (não cortar) e `fit: 'cover'` para banners.
- Horários: Slots de 30 min sem pausa de almoço automática (seguindo abertura/fecho do tenant).

</specifics>

<deferred>
## Deferred Ideas

- Integração Stripe: Mencionada no Bloco A, mas fica para fase futura.
- Blocos H a P do MOVEFY_CORRECOES_V2.md: Serão tratados na Fase 2 ou subsequentes.

</deferred>

---

*Phase: 01-estabilizacao-integridade*
*Context gathered: 2026-04-30 via PRD Express Path*

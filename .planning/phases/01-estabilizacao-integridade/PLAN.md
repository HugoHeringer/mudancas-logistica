# Plano de Execução: Fase 1 - Estabilização e Integridade de Dados

Este plano detalha as etapas para corrigir os bugs críticos de isolamento, uploads, estados operacionais e centralização de lógica de conflitos, conforme documentado em `01-CONTEXT.md` e `RESEARCH.md`.

## Onda 1: Infraestrutura e Segurança (Isolamento e Setup)
### Tarefas
- [x] **T1.1: Instalação de Dependências**
    - Instalar `sharp` no `packages/backend`.
    - Instalar `date-fns-tz` se necessário para normalização de fuso horário.
- [x] **T1.2: Implementação do Tenant Guard**
    - Criar `TenantActiveGuard` para validar se o tenant está ativo/não suspenso.
    - Registrar globalmente no `AppModule`.
- [x] **T1.3: Ajustes no Esquema de Tenant (Bloco A)**
    - Adicionar `validadeTrial` (DateTime) e `faseTrial` (Boolean) ao modelo `Tenant`.
    - Executar migração.
- [x] **T1.4: Cron Job de Expiração de Trial (Bloco A)**
    - Criar `trial.service.ts` com um cron job diário.
    - Implementar lógica que suspende tenants cuja `validadeTrial` expirou.
- [x] **T1.5: Ajuste de Autenticação (E1)**
    - Refatorar `RegisterDto` para tornar `tenantId` opcional no body (usando contexto se autenticado).
    - Atualizar `AuthService.register` para aceitar `tenantId` do usuário logado e remover restrições de perfil para administradores.

## Onda 2: Lógica de Negócio e Estados Operacionais
### Tarefas
- [x] **T2.1: Atualização de Esquema Prisma**
    - Adicionar estados `reservado` (Veículo) e `em_mudanca` (Motorista) ao `schema.prisma`.
    - Executar `npx prisma generate` e migração.
- [x] **T2.2: Serviço de Detecção de Conflitos (Bloco D)**
    - Criar `ConflictDetectorService` para unificar a verificação de agenda.
    - Implementar lógica que evita agendamentos duplicados para o mesmo motorista/veículo na mesma data.
- [x] **T2.3: Automação de Estados (Bloco C)**
    - Atualizar o fluxo de `aprovar` no `MudancaService` para automatizar a reserva de recursos.
    - Garantir que a conclusão de uma mudança libere os recursos (`disponivel`).

## Onda 3: Dashboards, KPIs e Processamento de Imagens
### Tarefas
- [x] **T3.1: Refatoração de Queries do Dashboard (Bloco G)**
    - Corrigir filtros de data no `MudancaService.getDashboard` (limites de mês e UTC).
    - Corrigir mapeamento de estados nas queries de KPI (excluindo `cancelada` e `recusada` da receita).
- [x] **T3.2: Redimensionamento Automático de Imagens (Bloco B)**
    - Implementar middleware ou helper usando `sharp` no `UploadService`.
    - Garantir redimensionamento automático e compressão (max 1200px largura).
- [ ] **T3.3: Ajuste no Fluxo de Upload (Bloco B)**
    - Criar endpoint `/upload/process` que processa a imagem ANTES de retornar o path para o frontend.
    - Ajustar `CreateMudancaDto` para aceitar apenas os caminhos das imagens já salvas.

## Onda 4: Verificação e Validação (UAT)
### Tarefas
- [ ] **V1: Teste de Isolamento** - Tentar acessar dados de Tenant A logado no Tenant B.
- [ ] **V2: Teste de Conflito** - Simular agendamento duplicado e validar bloqueio.
- [ ] **V3: Teste de Dashboard** - Validar se os totais batem com as mudanças do mês atual (UTC).
- [ ] **V4: Teste de Imagem** - Upload de foto 4K e verificação do tamanho final em disco.

## Critérios de Aceitação
- [ ] Tenant suspenso perde acesso imediato via Guard.
- [ ] Erro 400 no registro resolvido para admins.
- [ ] Dashboard exibe lucro/receita corretos (sem contar canceladas).
- [ ] Imagens redimensionadas automaticamente salvando espaço em disco.
- [ ] Conflitos de agenda bloqueados tanto no Admin quanto no Site Público.

# Pesquisa Técnica: Fase 1 - Estabilização e Integridade de Dados

## 1. Isolamento de Tenants (Multi-tenancy)
- **Estado Atual:** A segurança depende de verificações manuais de `tenantId` nos serviços. O `RegisterDto` permite que o cliente envie o `tenantId` via body, o que é inseguro para operações internas.
- **Solução:** 
    - Criar `tenant-active.guard.ts` em `packages/backend/src/auth/guards/`.
    - Integrar o guard no `AppModule` ou via `APP_GUARD` para garantir que o tenant esteja ativo em todas as rotas (exceto públicas).
    - Ajustar `AuthService.register` para extrair o `tenantId` do usuário autenticado se o perfil for administrativo.

## 2. Dashboard e KPIs
- **Problemas Identificados:**
    - Filtragem por data usa fuso horário local do servidor (`new Date()`), o que causa discrepâncias se o cliente estiver em outro fuso ou se o servidor resetar em horários diferentes.
    - Estados incorretos sendo consultados (ex: `ocupado` em mudanças).
    - Agregação de receita/custo não limita o fim do mês corretamente.
- **Ações:**
    - Utilizar `date-fns-tz` ou garantir que todas as datas de comparação no Prisma sejam UTC meia-noite (00:00:00 e 23:59:59).
    - Corrigir o mapeamento de estados no `getDashboard`.

## 3. Gestão de Estados (Drivers/Vehicles)
- **Problemas:** Atualmente apenas `disponivel` e `ocupado`. Falta um estado intermediário para quando a mudança está aprovada mas não iniciada.
- **Ações:** 
    - Adicionar `reservado` (veículo) e `em_mudanca` (motorista) aos Enums do Prisma.
    - Atualizar a lógica de `aprovar` para mudar o estado para `reservado`.

## 4. Detecção de Conflitos
- **Estado Atual:** Lógica espalhada ou inexistente no backend.
- **Ações:**
    - Criar `ConflictDetectorService`.
    - Método `checkConflict(tenantId, date, vehicleId, driverId, excludeMudancaId?)`.
    - Chamar no `create` (público) e `aprovar` (admin).

## 5. Upload de Imagens e Redimensionamento
- **Estado Atual:** Upload salva direto em disco. Não há redimensionamento.
- **Ações:**
    - Instalar `sharp` no backend.
    - Refatorar `UploadService` para processar a imagem antes de salvar.
    - Criar endpoint separado para upload que retorna o caminho, para que o registro da mudança/motorista use o caminho da imagem já processada.

## 6. Autenticação e Erros 400
- **Causa:** `AuthService.register` restringe perfis e exige `tenantId` no body.
- **Correção:** Ajustar DTO e lógica de serviço para suportar criação de usuários por admins via contexto JWT.

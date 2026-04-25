# MOVEFY — Plano de Execução para IA
> **Última actualização:** 2026-04-24
> **Versão:** 2.0 — Acções específicas para execução autónoma
> **Como usar:**
> - Marcar `[x]` ao concluir cada item
> - Marcar `[~]` se parcialmente implementado
> - Marcar `[!]` se encontrou bloqueio — descrever na linha abaixo
> - Commitar após cada BLOCO completo com mensagem: `feat(bloco-X): descrição`
> - **NUNCA marcar como feito sem ter testado a acção**

---

## PRIORIDADES
```
🔴 CRÍTICO  — Bloqueia o sistema, resolver primeiro
🟠 ALTO     — Core funcional, resolver a seguir
🟡 MÉDIO    — Qualidade e UX
🟢 BAIXO    — Melhorias futuras
```

---

## BLOCO 1 — BASE DE DADOS: CAMPOS EM FALTA 🔴
> **Commit:** `feat(schema): add missing fields to Prisma models`

### 1.1 Modelo Motorista
- [x] `packages/backend/prisma/schema.prisma` → modelo `Motorista` → adicionar campo: `valorHora Decimal @default(0) @db.Decimal(10,2)`
- [x] `packages/backend/prisma/schema.prisma` → modelo `Motorista` → adicionar campo: `horasTrabalhadasMes Decimal @default(0) @db.Decimal(10,2)`
- [x] `packages/backend/prisma/schema.prisma` → modelo `Motorista` → adicionar campo: `valorRecebidoMes Decimal @default(0) @db.Decimal(10,2)`

### 1.2 Modelo Ajudante
- [x] `packages/backend/prisma/schema.prisma` → modelo `Ajudante` → adicionar campo: `valorHora Decimal @default(0) @db.Decimal(10,2)`
- [x] `packages/backend/prisma/schema.prisma` → modelo `Ajudante` → adicionar campo: `horasTrabalhadasMes Decimal @default(0) @db.Decimal(10,2)`
- [x] `packages/backend/prisma/schema.prisma` → modelo `Ajudante` → adicionar campo: `valorRecebidoMes Decimal @default(0) @db.Decimal(10,2)`

### 1.3 Modelo Mudanca — campos de snapshot financeiro
- [x] `packages/backend/prisma/schema.prisma` → modelo `Mudanca` → campo `conclusao Json?` → **substituir** por campos explícitos:
  ```
  valorHoraMotoristaSnapshot Decimal? @db.Decimal(10,2)
  valorHoraAjudanteSnapshot  Decimal? @db.Decimal(10,2)
  totalPagoMotorista         Decimal? @db.Decimal(10,2)
  totalPagoAjudantes         Decimal? @db.Decimal(10,2)
  horasCobradas              Decimal? @db.Decimal(5,2)
  conclusaoDetalhes          Json?
  ```
  > Nota: manter `conclusaoDetalhes` para campos dinâmicos como combustível, alimentação, materiais, observações

### 1.4 Modelo ConfigPreco
- [x] `packages/backend/prisma/schema.prisma` → modelo `ConfigPreco` → adicionar: `acrescimo1Ajudante Decimal @default(0) @db.Decimal(10,2)`
- [x] `packages/backend/prisma/schema.prisma` → modelo `ConfigPreco` → adicionar: `acrescimo2Ajudantes Decimal @default(0) @db.Decimal(10,2)`
- [x] `packages/backend/prisma/schema.prisma` → modelo `ConfigPreco` → **remover** campo `acrescimoUrgencia` da tabela ConfigPreco (já existe em ConfigAgenda — verificar e manter apenas em ConfigAgenda)

### 1.5 Modelo ConfigAgenda
- [x] `packages/backend/prisma/schema.prisma` → modelo `ConfigAgenda` → adicionar: `capacidadeMaximaDiaria Int @default(3)`
- [x] `packages/backend/prisma/schema.prisma` → modelo `ConfigAgenda` → adicionar: `acrescimoUrgencia Decimal @default(0) @db.Decimal(5,2)` (se não existir)

### 1.6 Modelo Tenant
- [x] `packages/backend/prisma/schema.prisma` → modelo `Tenant` → verificar se campo `slug String @unique` existe. Se não existir, adicionar.
- [x] `packages/backend/prisma/schema.prisma` → modelo `Tenant` → adicionar: `plano String @default("trial")`
- [x] `packages/backend/prisma/schema.prisma` → modelo `Tenant` → adicionar: `trialExpiraEm DateTime?`
- [x] `packages/backend/prisma/schema.prisma` → modelo `Tenant` → adicionar: `eAtivo Boolean @default(true)`

### 1.7 Modelo User — permissões do gerente
- [x] `packages/backend/prisma/schema.prisma` → modelo `User` → verificar se campo `permissoes Json?` existe. Se existir mas não for usado, documentar estrutura esperada com comentário:
  ```
  // Estrutura: { motoristaIds: string[], verTodosMotoristas: boolean }
  permissoes Json?
  ```

### 1.8 Migração
- [x] Executar: `npx prisma migrate dev --name add-missing-fields`
- [x] Executar: `npx prisma generate`
- [x] Verificar que não existem erros de migração

---

## BLOCO 2 — CÁLCULO FINANCEIRO CORRECTO 🔴
> **Commit:** `feat(financeiro): fix revenue calculation with team and urgency`

### 2.1 Serviço de cálculo de preço (novo ficheiro)
- [x] Criar ficheiro: `packages/backend/src/mudanca/preco-calculator.service.ts`
- [x] Implementar função `calcularPrecoHora(veiculo, numAjudantes, configPreco)`
- [x] Implementar função `calcularReceitaPrevista(horasEstimadas, precoHora, acrescimoUrgencia, isUrgente)`
- [x] Implementar função `calcularReceitaRealizada(horasCobradas, precoHora, acrescimoUrgencia, isUrgente, totalMateriais)`
- [x] Implementar função `calcularCustoEquipa(horasTrabalhadas, valorHoraMotorista, ajudantes)`

### 2.2 Actualizar mudanca.service.ts — função `aprovar()`
- [x] Buscar `configPreco` e `configAgenda` do tenant (acrescimoUrgencia vem de ConfigAgenda)
- [x] Buscar veículo com `precoHora`
- [x] Contar número de ajudantes seleccionados
- [x] Calcular `precoHoraFinal` com `PrecoCalculatorService.calcularPrecoHora()`
- [x] Calcular `receitaPrevista` com `PrecoCalculatorService.calcularReceitaPrevista()`
- [x] **Gravar snapshot**: `valorHoraMotoristaSnapshot = motorista.valorHora`, `valorHoraAjudanteSnapshot = média dos ajudantes`
- [x] Gravar `receitaPrevista` no campo do modelo Mudanca

### 2.3 Actualizar mudanca.service.ts — função `concluir()`
- [x] Ler `valorHoraMotoristaSnapshot` e `valorHoraAjudanteSnapshot` **já gravados na aprovação** (não buscar valores actuais)
- [x] Calcular `receitaRealizada` com `PrecoCalculatorService.calcularReceitaRealizada()`
- [x] Calcular `totalPagoMotorista = horasCobradas * valorHoraMotoristaSnapshot`
- [x] Calcular `totalPagoAjudantes = numAjudantes * horasCobradas * valorHoraAjudanteSnapshot`
- [x] Gravar todos os campos explícitos no modelo Mudanca
- [x] Criar MovimentoFinanceiro com `categoria: 'receita_servico'`, `valor: receitaRealizada`
- [x] Criar MovimentoFinanceiro com `categoria: 'custo_equipa'`, `valor: totalPagoMotorista + totalPagoAjudantes`
- [x] Criar MovimentoFinanceiro com `categoria: 'custo_combustivel'` se `combustivel > 0`
- [x] Criar MovimentoFinanceiro com `categoria: 'custo_alimentacao'` se `alimentacao > 0`
- [x] Actualizar `motorista.horasTrabalhadasMes += horasCobradas`
- [x] Actualizar `motorista.valorRecebidoMes += totalPagoMotorista`

### 2.4 Actualizar financeiro.service.ts
- [x] `getResumo()`: somar `MovimentoFinanceiro` com categoria `receita_servico` para receita
- [x] `getResumo()`: somar categorias `custo_equipa`, `custo_combustivel`, `custo_alimentacao` para custos
- [x] `getResumo()`: `margem = totalReceita - totalCustos` (com breakdown detalhado)
- [x] `getBreakdownMotorista()`: `margem = receitaGerada - custoEquipa - combustivel - alimentacao`

---

## BLOCO 3 — AUTENTICAÇÃO E MULTI-TENANT 🔴
> **Commit:** `feat(auth): tenant resolution by slug + secure login`

### 3.1 Middleware de resolução por slug/subdomínio
- [ ] Criar ficheiro: `packages/backend/src/common/middleware/tenant.middleware.ts`
- [ ] Implementar lógica:
  ```typescript
  // 1. Ler header 'host' do request: ex. "silva-mudancas.movefy.pt"
  // 2. Extrair subdomínio: "silva-mudancas"
  // 3. Se subdomínio for "console" ou "www" ou "api" → skip (não é tenant)
  // 4. Buscar tenant: prisma.tenant.findUnique({ where: { slug: subdomain, eAtivo: true } })
  // 5. Se não encontrar → throw NotFoundException('Empresa não encontrada')
  // 6. Adicionar ao request: req['tenantId'] = tenant.id
  ```
- [ ] Registar o middleware em `app.module.ts` para todas as rotas excepto `/health` e `/super-admin/*`

### 3.2 Login PWA — campo de empresa (slug)
- [ ] `packages/pwa/src/pages/login.page.tsx`:
  - Adicionar campo `empresa` (type="text", placeholder="ID da sua empresa") **acima** do campo email
  - Campo deve ter texto de ajuda: "O seu gestor fornece este código"
  - Ao fazer login, enviar `{ slug, email, password }` no body
- [ ] `packages/backend/src/auth/auth.service.ts` → função `login()`:
  - Receber `slug` no DTO
  - Buscar tenant pelo slug: `prisma.tenant.findUnique({ where: { slug } })`
  - Se tenant não existir → `throw UnauthorizedException('Empresa não encontrada')`
  - Validar que `user.tenantId === tenant.id`
  - Retornar `accessToken` com `tenantId` e `slug` no payload JWT
- [ ] Alternativa (mais elegante, implementar se subdomínio já estiver configurado): se o request vier de `silva.movefy.pt/motorista`, o middleware já injectou o `tenantId` — o login não precisa de campo empresa, usa o `tenantId` do contexto

### 3.3 Segurança do JWT
- [ ] `packages/backend/src/auth/jwt.strategy.ts` → função `validate()`:
  - Verificar que `user.eAtivo === true` — se false, lançar `UnauthorizedException`
  - Verificar que `tenant.eAtivo === true` — se false, lançar `UnauthorizedException('Conta suspensa')`
- [ ] `packages/backend/src/auth/auth.service.ts` → função `login()`:
  - Verificar `user.eAtivo` antes de emitir token
  - Registar último login: `prisma.user.update({ data: { ultimoLogin: new Date() } })`
  - Adicionar campo `ultimoLogin DateTime?` ao modelo User no schema se não existir

### 3.4 Rate limiting no login
- [ ] `packages/backend/src/auth/auth.controller.ts` → endpoint `POST /auth/login`:
  - Adicionar decorator `@Throttle({ default: { limit: 5, ttl: 60000 } })` (5 tentativas por minuto)
- [ ] Verificar que `ThrottlerModule` está registado em `app.module.ts`. Se não estiver:
  ```typescript
  ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])
  ```
- [ ] Endpoint `POST /public/mudancas` (formulário público):
  - Adicionar `@Throttle({ default: { limit: 3, ttl: 60000 } })` (3 submissões por minuto por IP)

---

## BLOCO 4 — DASHBOARD CORRECTO E COMPLETO 🔴
> **Commit:** `feat(dashboard): fix inconsistent data + add clickable KPIs`

### 4.1 Corrigir query de pendentes
- [ ] `packages/backend/src/mudancas/mudancas.service.ts` → função `getDashboard()`:
  - Query de pendentes: `where: { tenantId, estado: 'pendente' }` — verificar que usa exactamente `'pendente'` e não outro valor
  - Confirmar que a página de Aprovações usa **exactamente o mesmo filtro**: `estado: 'pendente'`
  - Se divergirem, unificar para usar constante: `import { ESTADOS } from '@mudancas/shared'`

### 4.2 Corrigir query de mudanças de hoje
- [ ] `packages/backend/src/mudancas/mudancas.service.ts` → função `getDashboard()`:
  - Query "hoje":
    ```typescript
    const hoje = new Date();
    const inicioDia = new Date(hoje.setHours(0,0,0,0));
    const fimDia = new Date(hoje.setHours(23,59,59,999));
    where: { tenantId, dataPretendida: { gte: inicioDia, lte: fimDia } }
    ```
  - Substituir qualquer comparação por string (ex: `toDateString()`) por esta comparação com `DateTime`

### 4.3 Novos KPIs no dashboard
- [ ] `packages/backend/src/mudancas/mudancas.service.ts` → função `getDashboard()` → adicionar ao retorno:
  - `receitaMes`: soma de `receitaRealizada` de mudanças concluídas no mês actual
  - `margemMes`: receita - custos do mês actual
  - `mudancasEmCurso`: count de `estado IN ('a_caminho', 'em_servico')`
  - `motivosPendentes`: lista dos primeiros 5 pendentes com `{ id, cliente, dataPretendida }`
- [ ] `packages/admin/src/pages/dashboard.page.tsx`:
  - Tornar o card "Pendentes" clicável → `navigate('/aprovacoes')`
  - Tornar o card "Hoje" clicável → `navigate('/agenda?data=hoje')`
  - Tornar o card "Em Curso" clicável → `navigate('/mudancas?estado=em_servico,a_caminho')`
  - Adicionar card "Receita do Mês" com valor em €
  - Adicionar card "Margem do Mês" com percentagem e cor verde/vermelho
  - **Remover** qualquer dado mockado ou hardcoded

### 4.4 Dashboard — respeitar perfil do utilizador
- [ ] `packages/backend/src/mudancas/mudancas.service.ts` → função `getDashboard()`:
  - Receber `userId` e `perfil` do contexto JWT
  - Se perfil for `gerente`: ler `user.permissoes.motoristaIds` e adicionar filtro `motoristaId: { in: motoristaIds }` em todas as queries
  - Se `permissoes.verTodosMotoristas === true` ou `motoristaIds` estiver vazio: não aplicar filtro

---

## BLOCO 5 — AGENDA REFORMULADA 🔴
> **Commit:** `feat(agenda): replace slots with daily capacity model`

### 5.1 Remover sistema de slots manuais
- [ ] `packages/admin/src/pages/agenda.page.tsx`:
  - **Remover** completamente o dialog/botão "Criar Slot"
  - **Remover** qualquer componente `SlotForm` ou similar
  - Manter apenas: calendário mensal, lista de mudanças do dia, botão "Criar Bloqueio"

### 5.2 Mostrar mudanças aprovadas na agenda
- [ ] `packages/backend/src/agenda/agenda.service.ts` → função `getMensal(ano, mes, tenantId)`:
  - Buscar mudanças com `estado IN ('aprovada', 'a_caminho', 'em_servico', 'concluida')` e `dataPretendida` no mês
  - Retornar estrutura:
    ```typescript
    {
      dias: Array<{
        data: string, // 'YYYY-MM-DD'
        mudancas: Array<{ id, cliente, estado, horaInicio }>,
        capacidadeOcupada: number,
        capacidadeTotal: number, // vem de ConfigAgenda.capacidadeMaximaDiaria
        eDisponivel: boolean // capacidadeOcupada < capacidadeTotal
      }>
    }
    ```
- [ ] `packages/admin/src/pages/agenda.page.tsx`:
  - Calendário mensal: colorir dias conforme ocupação — verde (livre), amarelo (parcial), vermelho (cheio), cinzento (bloqueio)
  - Ao clicar num dia: mostrar lista de mudanças desse dia com estado visual
  - Badge de estado por cor: pendente=cinzento, aprovada=azul, a_caminho=laranja, em_servico=verde, concluída=verde claro

### 5.3 Disponibilidade no site público
- [ ] `packages/backend/src/public/public.service.ts` → função `getDisponibilidade(data, tenantId)`:
  - Verificar se existe bloqueio para essa data
  - Contar mudanças aprovadas para essa data
  - Retornar `{ disponivel: boolean, capacidadeRestante: number }`
- [ ] `packages/site/src/components/calendar-selector.tsx`:
  - **Remover** MOCK_SLOTS hardcoded
  - Chamar `publicApi.getDisponibilidade(data)` para cada dia do mês
  - Dias sem disponibilidade ficam disabled e com classe CSS `opacity-50 cursor-not-allowed`

---

## BLOCO 6 — FORMULÁRIO PÚBLICO DINÂMICO 🟠
> **Commit:** `feat(site): dynamic form fields from tenant config`

### 6.1 Endpoint público de configuração do formulário
- [ ] `packages/backend/src/public/public.controller.ts`:
  - Adicionar endpoint: `GET /public/tenant/:slug/formulario-config`
  - Retornar: lista de campos personalizados activos do tenant, ordenados por `ordem`
  - Campos retornados: `{ id, nome, tipo, obrigatorio, ordem, opcoes }`
  - **Não retornar** dados sensíveis do tenant (apenas configuração do formulário)

### 6.2 Renderização dinâmica no site
- [ ] `packages/site/src/components/agendamento-form.tsx`:
  - No `useEffect` inicial: chamar `publicApi.getFormularioConfig(slug)`
  - Após os campos base (dados pessoais, moradas, veículo, data), renderizar campos dinâmicos:
    ```tsx
    {camposDinamicos.map(campo => (
      campo.tipo === 'texto' ? <Input key={campo.id} label={campo.nome} required={campo.obrigatorio} /> :
      campo.tipo === 'checkbox' ? <Checkbox key={campo.id} label={campo.nome} /> :
      campo.tipo === 'selector' ? <Select key={campo.id} label={campo.nome} options={campo.opcoes} /> :
      null
    ))}
    ```
  - Incluir valores destes campos no payload de submissão: `{ ...dadosBase, camposDinamicos: { [campo.id]: valor } }`

### 6.3 Guardar campos dinâmicos na mudança
- [ ] `packages/backend/src/public/public.service.ts` → função `criarMudancaPublica()`:
  - Receber `camposDinamicos` no DTO
  - Guardar em `conclusaoDetalhes` (ou campo Json dedicado `dadosFormulario Json?`) na mudança

---

## BLOCO 7 — CLIENTES: GESTÃO COMPLETA 🟠
> **Commit:** `feat(clientes): add manual creation + client type progression`

### 7.1 Criar cliente manualmente
- [ ] `packages/backend/src/clientes/clientes.controller.ts`:
  - Verificar que existe `POST /clientes` com autenticação e guard de tenant
  - DTO deve incluir: `nome, email, telefone, nif?, morada?`
  - Antes de criar: verificar duplicado por email no mesmo tenant: `prisma.cliente.findFirst({ where: { email, tenantId } })`
  - Se duplicado: lançar `ConflictException('Cliente com este email já existe')`
- [ ] `packages/admin/src/pages/clientes.page.tsx`:
  - Adicionar botão "Novo Cliente" no topo direito da página
  - Ao clicar: abrir Dialog com formulário (nome, email, telefone, NIF, morada)
  - Ao submeter: chamar `clientesApi.create()` e recarregar lista

### 7.2 Progressão automática de tipo
- [ ] `packages/backend/src/clientes/clientes.service.ts`:
  - Criar função privada `recalcularTipoCliente(clienteId: string)`:
    ```typescript
    const mudancasConcluidas = await prisma.mudanca.count({
      where: { clienteId, estado: 'concluida', tenantId }
    });
    const tipo = mudancasConcluidas === 0 ? 'novo'
               : mudancasConcluidas < 5 ? 'recorrente'
               : 'vip';
    await prisma.cliente.update({ where: { id: clienteId }, data: { tipo } });
    ```
  - Chamar `recalcularTipoCliente()` no final da função `concluirMudanca()`

### 7.3 Histórico de mudanças no perfil do cliente
- [ ] `packages/backend/src/clientes/clientes.service.ts` → função `findOne()`:
  - Incluir `include: { mudancas: { orderBy: { createdAt: 'desc' }, take: 10, select: { id, estado, dataPretendida, receitaRealizada, createdAt } } }`
- [ ] `packages/admin/src/pages/clientes.page.tsx` ou componente de detalhe:
  - Mostrar tabela de histórico de mudanças do cliente
  - Total gasto (soma de `receitaRealizada` das mudanças concluídas)

---

## BLOCO 8 — MOTORISTAS E AJUDANTES 🟠
> **Commit:** `feat(equipa): add hourly rate fields + performance tracking`

### 8.1 Campos de valor/hora nos formulários
- [ ] `packages/admin/src/pages/motoristas.page.tsx`:
  - Formulário de criação/edição de motorista: adicionar campo `Valor/Hora (€)` (input number, step=0.5, min=0)
  - Mostrar na tabela: coluna "€/hora"
- [ ] `packages/admin/src/pages/ajudantes.page.tsx` (ou sub-secção):
  - Formulário de criação/edição de ajudante: adicionar campo `Valor/Hora (€)`
  - Mostrar na lista de ajudantes

### 8.2 Performance mensal automática
- [ ] `packages/backend/src/motoristas/motoristas.service.ts`:
  - Criar endpoint `GET /motoristas/:id/performance` com dados:
    ```typescript
    {
      horasTrabalhadasMes,
      valorRecebidoMes,
      mudancasConcluidasMes,
      mediaAvaliacaoCliente // para implementação futura, retornar null por agora
    }
    ```
  - Reset mensal: criar cron job `@Cron('0 0 1 * *')` que zera `horasTrabalhadasMes` e `valorRecebidoMes` de todos os motoristas/ajudantes

### 8.3 Actualizar detalhe da mudança — tab Equipa
- [ ] `packages/admin/src/pages/mudanca-detalhe.page.tsx` → tab "Motorista/Equipa":
  - Resolver IDs dos ajudantes para nomes: chamar `ajudantesApi.findMany({ ids: mudanca.ajudantesIds })`
  - Mostrar: nome do motorista, nome de cada ajudante, custo estimado da equipa
  - Mostrar custo real (após conclusão): `totalPagoMotorista` + `totalPagoAjudantes`

---

## BLOCO 9 — PERMISSÕES DO GERENTE 🟠
> **Commit:** `feat(users): manager motorist restriction`

### 9.1 UI de selecção de motoristas
- [ ] `packages/admin/src/pages/utilizadores.page.tsx` (dialog de criação/edição):
  - Se perfil seleccionado for `gerente`: mostrar secção "Motoristas visíveis"
  - Lista de checkboxes com todos os motoristas activos do tenant
  - Checkbox "Ver todos os motoristas" que desselecciona os individuais
  - Ao guardar: enviar `permissoes: { motoristaIds: [...ids], verTodosMotoristas: boolean }`
- [ ] `packages/backend/src/users/users.service.ts` → `update()`:
  - Guardar `permissoes` como JSON no campo `user.permissoes`

### 9.2 Aplicar restrição nas queries
- [ ] Criar helper: `packages/backend/src/common/helpers/get-motorista-filter.ts`:
  ```typescript
  export function getMotoristaFilter(user: UserContext): Prisma.MudancaWhereInput {
    if (user.perfil !== 'gerente') return {};
    const { motoristaIds, verTodosMotoristas } = user.permissoes ?? {};
    if (verTodosMotoristas || !motoristaIds?.length) return {};
    return { motoristaId: { in: motoristaIds } };
  }
  ```
- [ ] Aplicar este filter em:
  - `mudancas.service.ts` → `findAll()`, `getDashboard()`
  - `agenda.service.ts` → `getMensal()`, `getSemanal()`, `getDiario()`
  - `financeiro.service.ts` → `getResumo()`, `getBreakdownMotorista()`

---

## BLOCO 10 — DARK MODE FUNCIONAL 🟠
> **Commit:** `fix(theme): migrate hardcoded colors to semantic CSS vars`

### 10.1 Mapeamento de classes a substituir (global em todos os frontends)
- [ ] Substituições obrigatórias (busca global nos ficheiros `.tsx` e `.css`):
  | Antes (hardcoded) | Depois (semântica) |
  |---|---|
  | `bg-sand` | `bg-background` |
  | `bg-cream` | `bg-background` |
  | `bg-white` (em componentes) | `bg-card` |
  | `text-brown` | `text-foreground` |
  | `text-gray-500` | `text-muted-foreground` |
  | `bg-gray-50` | `bg-muted` |
  | `border-gray-200` | `border-border` |
  | `bg-gold` | `bg-primary` |
  | `text-gold` | `text-primary` |
  > **Excepção**: a sidebar usa `bg-night` intencionalmente (sempre escura)

### 10.2 TenantProvider — aplicar classe dark no HTML
- [ ] `packages/admin/src/providers/tenant-provider.tsx`:
  - Verificar que ao mudar `themePreference` → `document.documentElement.classList.toggle('dark', isDark)`
  - Onde `isDark = themePreference === 'dark' || (themePreference === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)`
  - Persistir preferência: `localStorage.setItem('movefy-theme', themePreference)`
  - No mount: ler `localStorage.getItem('movefy-theme')` e aplicar imediatamente para evitar flash

### 10.3 Componentes críticos a corrigir
- [ ] `packages/admin/src/components/glass-card.tsx` → substituir `text-brown`, `bg-gold/10`, `border-gold/15` por vars semânticas
- [ ] `packages/admin/src/components/top-bar.tsx` → substituir `bg-sand/80` por `bg-background/80`
- [ ] `packages/admin/src/pages/financeiro.page.tsx` → substituir `bg-white`, `bg-gray-50` por `bg-card`, `bg-muted`
- [ ] `packages/admin/src/pages/agenda.page.tsx` → mesmo processo
- [ ] `packages/admin/src/pages/aprovacoes.page.tsx` → mesmo processo
- [ ] `packages/admin/src/pages/configuracoes.page.tsx` → mesmo processo
- [ ] `packages/pwa/src/` → substituir `bg-night`, `text-cream` hardcoded por CSS vars do TenantProvider

---

## BLOCO 11 — CONFIGURAÇÕES: LIMPEZA E LÓGICA 🟠
> **Commit:** `feat(config): fix pricing model + remove duplicate fields`

### 11.1 Tab Preços — reestruturar
- [ ] `packages/admin/src/pages/configuracoes.page.tsx` → tab "Preços":
  - **Remover** campo `acrescimoUrgencia` desta tab (existe apenas na tab "Urgência")
  - **Adicionar** campo "Acréscimo com 1 Ajudante (€/hora)" — input number
  - **Adicionar** campo "Acréscimo com 2 Ajudantes (€/hora)" — input number
  - **Adicionar** preview em tempo real: "Preço com furgão + 1 ajudante = veículo.precoHora + acrescimo1 = X€/hora"
  - Ao guardar: `configPrecoApi.update({ acrescimo1Ajudante, acrescimo2Ajudantes })`

### 11.2 Tab Urgência
- [ ] `packages/admin/src/pages/configuracoes.page.tsx` → tab "Urgência":
  - Manter apenas aqui o campo `acrescimoUrgencia (%)`
  - **Adicionar** campo "Veículo de urgência" — select com veículos do tenant
  - **Adicionar** preview: "Mudança urgente de 3h com furgão = X€ × 1.30 = Y€"

### 11.3 Tab Formulário — corrigir preview
- [ ] `packages/admin/src/pages/configuracoes.page.tsx` → tab "Formulário":
  - Campo Select: o preview deve mostrar apenas "Seleccionar" (sem "+ Opção 1")
  - Campo Checkbox: ao marcar tipo "checkbox" com opções, mostrar área para inserir as opções (uma por linha ou array de inputs)
  - Campo "data pretendida": mostrar como date picker no preview, não como texto

### 11.4 Tab Marca — upload de logo funcional
- [ ] `packages/backend/src/upload/upload.service.ts`:
  - Criar endpoint `POST /upload/logo` com multer (aceitar jpg/png/svg/webp, max 2MB)
  - Guardar ficheiro em `./uploads/logos/{tenantId}/logo.{ext}` (local para dev)
  - Actualizar `configMarca.logoUrl` no tenant
  - Para produção: guardar em S3 (configurar via `STORAGE_PROVIDER=s3` em env)
- [ ] `packages/admin/src/pages/configuracoes.page.tsx` → tab "Marca":
  - Componente de upload com dropzone (arrastar ou clicar)
  - Preview do logo após upload
  - Botão "Remover logo"

---

## BLOCO 12 — EMAIL REAL 🟠
> **Commit:** `feat(email): integrate Resend for transactional emails`

### 12.1 Configuração do provedor (Resend)
- [ ] Instalar: `npm install resend --workspace=packages/backend`
- [ ] `packages/backend/.env.example`: adicionar `RESEND_API_KEY=re_xxxx`
- [ ] Criar `packages/backend/src/email/email.service.ts`:
  ```typescript
  async send(to: string, subject: string, html: string): Promise<void> {
    await resend.emails.send({ from: 'noreply@movefy.pt', to, subject, html });
  }
  ```
  - Wrapper com try/catch — falha de email não deve quebrar o fluxo principal

### 12.2 Gatilhos de email obrigatórios
- [ ] `packages/backend/src/public/public.service.ts` → `criarMudancaPublica()`:
  - Após criar mudança: `emailService.send(cliente.email, 'Recebemos o seu pedido', template('solicitacao_recebida', vars))`
- [ ] `packages/backend/src/mudancas/mudancas.service.ts` → `aprovar()`:
  - Após aprovar: enviar email ao cliente com data, hora, motorista
- [ ] `packages/backend/src/mudancas/mudancas.service.ts` → `recusar()`:
  - Após recusar: enviar email ao cliente com motivo
- [ ] `packages/backend/src/mudancas/mudancas.service.ts` → `iniciarDeslocamento()`:
  - Após actualizar estado: enviar email "O motorista está a caminho + previsão de chegada"
- [ ] `packages/backend/src/mudancas/mudancas.service.ts` → `concluir()`:
  - Após concluir: enviar email ao cliente com resumo e total cobrado

### 12.3 Templates HTML
- [ ] Criar `packages/backend/src/email/templates/`:
  - `solicitacao_recebida.html` — confirmação de recepção do pedido
  - `mudanca_aprovada.html` — data, hora, motorista, veículo
  - `mudanca_recusada.html` — motivo da recusa
  - `motorista_a_caminho.html` — nome do motorista + previsão
  - `mudanca_concluida.html` — resumo + total
- [ ] Todos os templates devem usar variáveis `{{nomeCliente}}`, `{{nomeEmpresa}}`, `{{logoUrl}}`, `{{corPrincipal}}`
- [ ] Função de renderização: `renderTemplate(templateName, vars)` → substituir `{{key}}` por `vars[key]`

---

## BLOCO 13 — SITE PÚBLICO: SEO E CONVERSÃO 🟠
> **Commit:** `feat(site): SEO meta tags + conversion optimisation`

### 13.1 Meta tags dinâmicas por tenant
- [ ] `packages/site/src/app/layout.tsx` (ou equivalente Next.js):
  - `<title>{brand.nome} — Mudanças em {brand.cidade} | Serviços de Transporte</title>`
  - `<meta name="description" content="Empresa de mudanças {brand.nome} em {brand.cidade}. Serviços locais, nacionais e internacionais. Peça orçamento grátis." />`
  - `<meta property="og:title" content="{brand.nome}" />`
  - `<meta property="og:image" content="{brand.logoUrl}" />`
  - `<meta name="robots" content="index, follow" />`

### 13.2 Schema.org LocalBusiness
- [ ] `packages/site/src/app/layout.tsx`:
  - Adicionar script JSON-LD:
    ```html
    <script type="application/ld+json">{
      "@context": "https://schema.org",
      "@type": "MovingCompany",
      "name": "{brand.nome}",
      "url": "https://{slug}.movefy.pt",
      "telephone": "{brand.telefone}",
      "address": { "@type": "PostalAddress", "addressLocality": "{brand.cidade}", "addressCountry": "PT" }
    }</script>
    ```

### 13.3 Validação por step no formulário
- [ ] `packages/site/src/components/agendamento-form.tsx`:
  - Antes de avançar para o próximo step, validar campos obrigatórios do step actual com Zod
  - Se inválido: mostrar erros inline, **não avançar**
  - Step 1 (dados pessoais): nome, apelido, email, telefone obrigatórios
  - Step 2 (moradas): rua, número, código postal, localidade obrigatórios em ambas moradas
  - Step 3 (data/hora): data e hora seleccionadas obrigatórias
  - Step 4 (veículo/equipa): veículo seleccionado obrigatório

### 13.4 Consentimento RGPD no formulário
- [ ] `packages/site/src/components/agendamento-form.tsx` → último step antes de submeter:
  - Adicionar checkbox obrigatório: "Aceito o tratamento dos meus dados pessoais para processamento deste pedido. [Política de Privacidade]"
  - Checkbox opcional: "Aceito receber comunicações futuras desta empresa"
  - Enviar no payload: `{ consentimentoDados: true, consentimentoMarketing: boolean, timestampConsentimento: Date.now() }`
- [ ] `packages/backend/src/public/public.service.ts`:
  - Se `consentimentoDados !== true`: lançar `BadRequestException('Consentimento obrigatório')`
  - Guardar `consentimentoDados`, `consentimentoMarketing`, `timestampConsentimento` na mudança

---

## BLOCO 14 — MOVEFY CONSOLE (SUPERADMIN) 🟡
> **Commit:** `feat(console): rebrand superadmin to Movefy Console`

### 14.1 Rebranding visual
- [ ] `packages/superadmin/src/` (ou onde estiver o superadmin):
  - Substituir todas as ocorrências de "Super-Admin", "superadmin", "SuperAdmin" nos textos visíveis por "Movefy Console"
  - Sidebar header: logo da Movefy (placeholder se não existir: texto "MOVEFY CONSOLE")
  - Tema: manter dark (night) — é intencional para distinguir do admin dos clientes

### 14.2 Rota e acesso
- [ ] URL de acesso: deve ser `console.movefy.pt` (configurar no middleware de tenant para não tratar "console" como slug de empresa)
- [ ] Login do console: credenciais separadas (tabela `SuperAdminUser` ou campo `isSuperAdmin` no User com `tenantId = null`)
- [ ] `packages/backend/src/super-admin/super-admin.guard.ts`:
  - Verificar `user.isSuperAdmin === true` (não apenas `tenantId === 'super-admin'` hardcoded)

### 14.3 Lista de empresas melhorada
- [ ] `packages/backend/src/super-admin/super-admin.service.ts` → `getTenants()`:
  - Retornar para cada tenant: `{ id, nome, slug, plano, eAtivo, totalMudancas, totalUtilizadores, createdAt, trialExpiraEm }`
- [ ] UI da lista de tenants:
  - Mostrar badge de plano (Starter/Pro/Enterprise/Trial)
  - Mostrar badge de estado (Activo/Suspenso/Trial a expirar)
  - Botão "Suspender" / "Reactivar"
  - Botão "Ver como admin" (acede ao painel do cliente em modo read-only)

---

## BLOCO 15 — NOTIFICAÇÕES IN-APP 🟡
> **Commit:** `feat(notificacoes): in-app notification center`

### 15.1 Backend
- [ ] Verificar que modelo `Notificacao` existe no Prisma: `{ id, tenantId, userId, tipo, mensagem, lida, link, createdAt }`
- [ ] `packages/backend/src/notificacoes/notificacoes.service.ts`:
  - `criarNotificacao(tenantId, userId, tipo, mensagem, link)` — chamado por outros services
  - `marcarLida(id, userId)` — só o próprio utilizador pode marcar como lida
  - `listar(userId, tenantId)` → retornar últimas 20 não lidas + 10 lidas

### 15.2 Criar notificações nos eventos principais
- [ ] `mudancas.service.ts` → `criarMudancaPublica()`: notificação para todos os utilizadores `operacional` e `admin`
- [ ] `mudancas.service.ts` → `iniciarDeslocamento()`: notificação para `admin` e `gerente`
- [ ] `mudancas.service.ts` → `concluir()`: notificação para `admin`, `gerente`, `financeiro`

### 15.3 UI do sino de notificações
- [ ] `packages/admin/src/components/top-bar.tsx`:
  - Sino com badge de contagem de não lidas
  - Dropdown com lista de notificações (ícone + mensagem + tempo relativo + link)
  - Polling a cada 30 segundos: `useInterval(() => refetch(), 30000)`
  - Ao clicar numa notificação: marcar como lida + navegar para `notificacao.link`

---

## BLOCO 16 — FUNCIONALIDADES A REMOVER (limpeza) 🟡
> **Commit:** `refactor: remove unused or polluting features`

### 16.1 Remover
- [ ] `packages/admin/src/pages/agenda.page.tsx` → **remover** botão e dialog "Criar Slot" (substituído pelo modelo de capacidade)
- [ ] `packages/admin/src/pages/configuracoes.page.tsx` → **remover** campo `acrescimoUrgencia` duplicado da tab "Preços"
- [ ] Qualquer referência a `plataforma.pt` no código → substituir por `movefy.pt`
- [ ] Qualquer texto "Mudanças e Logística" hardcoded → substituir por `brand.nome || 'Movefy'`
- [ ] `packages/backend/src/` → remover endpoints não utilizados (verificar com `grep -r "// TODO: remove"`)

### 16.2 Simplificar
- [ ] `packages/admin/src/pages/mudanca-detalhe.page.tsx` → botões "Aprovar" e "Recusar":
  - **Remover** redirect para `/aprovacoes`
  - **Substituir** por dialog inline directamente na página de detalhe

---

## BLOCO 17 — QUALIDADE E SEGURANÇA FINAL 🟢
> **Commit:** `chore: security hardening + code quality`

### 17.1 Segurança
- [ ] `packages/backend/src/main.ts`:
  - Verificar que `helmet()` está activo: `app.use(helmet())`
  - Verificar que `cors` está configurado com origens explícitas (não `*`):
    ```typescript
    app.enableCors({ origin: ['https://*.movefy.pt', 'http://localhost:3000', 'http://localhost:5173'] })
    ```
  - Verificar que `compression()` está activo para performance
- [ ] Todos os endpoints que recebem `tenantId` do body: **remover** — o `tenantId` deve vir APENAS do JWT/contexto, nunca do cliente
- [ ] `packages/backend/src/prisma/prisma.service.ts`: verificar que não existe logging de queries em produção (`NODE_ENV !== 'development'`)

### 17.2 Variáveis de ambiente
- [ ] `packages/backend/.env.example` — verificar que contém todas as vars necessárias:
  ```
  DATABASE_URL=
  JWT_SECRET=
  JWT_REFRESH_SECRET=
  RESEND_API_KEY=
  STORAGE_PROVIDER=local
  AWS_S3_BUCKET=
  AWS_ACCESS_KEY_ID=
  AWS_SECRET_ACCESS_KEY=
  FRONTEND_URLS=http://localhost:5173,http://localhost:3000
  ```
- [ ] Verificar que `.gitignore` inclui `.env`, `.env.local`, `.env.production`

### 17.3 Performance básica
- [ ] `packages/admin/src/` → verificar que `React.lazy()` está a ser usado nas rotas principais (code splitting)
- [ ] `packages/backend/src/mudancas/mudancas.service.ts` → `findAll()`:
  - Verificar que paginação existe: `take: limit, skip: offset`
  - Default: `limit = 20`
- [ ] Prisma: verificar índices nas colunas mais consultadas:
  ```prisma
  @@index([tenantId, estado])        // Mudanca
  @@index([tenantId, dataPretendida]) // Mudanca
  @@index([tenantId])                // todas as tabelas
  ```

---

## BLOCO 18 — SITE MOVEFY.PT (INSTITUCIONAL) 🟢
> **Commit:** `feat(movefy-site): landing page for B2B sales`
> **Nota:** Criar como package separado `packages/movefy-site` com Next.js

- [ ] Criar `packages/movefy-site/` com Next.js + Tailwind
- [ ] Secções obrigatórias:
  - Hero: "Gerencie toda a sua empresa de mudanças" + CTA "Começar grátis 30 dias"
  - Features: cards com as 4 funcionalidades principais (Admin, Site, PWA, Financeiro)
  - Preços: tabela Starter / Pro / Enterprise com toggle mensal/anual
  - Testemunhos: 3 empresas clientes (placeholder por agora)
  - FAQ: 5 perguntas mais comuns
  - Footer: links, redes sociais, política de privacidade
- [ ] Formulário de trial: `{ nomeEmpresa, email, telefone }` → chama `POST /super-admin/trial`
- [ ] SEO: title "Movefy — Software de Gestão para Empresas de Mudanças | Portugal"

---

## RESUMO DE PROGRESSO

| Bloco | Descrição | Prioridade | Estado |
|---|---|---|---|
| 1 | Base de dados: campos em falta | 🔴 CRÍTICO | [x] |
| 2 | Cálculo financeiro correcto | 🔴 CRÍTICO | [x] |
| 3 | Autenticação e multi-tenant | 🔴 CRÍTICO | [ ] |
| 4 | Dashboard correcto | 🔴 CRÍTICO | [ ] |
| 5 | Agenda reformulada | 🔴 CRÍTICO | [ ] |
| 6 | Formulário público dinâmico | 🟠 ALTO | [ ] |
| 7 | Clientes: gestão completa | 🟠 ALTO | [ ] |
| 8 | Motoristas e ajudantes | 🟠 ALTO | [ ] |
| 9 | Permissões do gerente | 🟠 ALTO | [ ] |
| 10 | Dark mode funcional | 🟠 ALTO | [ ] |
| 11 | Configurações: limpeza | 🟠 ALTO | [ ] |
| 12 | Email real (Resend) | 🟠 ALTO | [ ] |
| 13 | Site público: SEO + RGPD | 🟠 ALTO | [ ] |
| 14 | Movefy Console | 🟡 MÉDIO | [ ] |
| 15 | Notificações in-app | 🟡 MÉDIO | [ ] |
| 16 | Remoção de lixo | 🟡 MÉDIO | [ ] |
| 17 | Qualidade e segurança | 🟢 BAIXO | [ ] |
| 18 | Site movefy.pt | 🟢 BAIXO | [ ] |

---

## INSTRUÇÕES PARA A IA (ANTIGRAVITY)

1. **Resolver sempre um bloco completo** antes de commitar
2. **Nunca marcar `[x]` sem ter testado** a funcionalidade
3. **Ao encontrar código que contradiz estas instruções**, aplicar as instruções deste documento
4. **Mensagens de commit** seguir o padrão: `feat(modulo): descrição curta`
5. **Se um item for impossível de executar** como descrito, marcar com `[!]` e descrever o bloqueio na linha seguinte
6. **Ordem de execução**: Bloco 1 → Bloco 2 → Bloco 3 → Bloco 4 → Bloco 5 → depois pode paralelizar 6-13
7. **Após cada bloco**: actualizar a tabela de progresso no final deste ficheiro
8. **Campos financeiros**: NUNCA hardcodar valores de preço — sempre buscar de `ConfigPreco` ou snapshot gravado na mudança

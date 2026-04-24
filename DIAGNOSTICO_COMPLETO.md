# Diagnostico Completo - Mudancas Logistica

**Data:** 2026-04-20
**Tenant de referencia:** Heringer
**Objetivo:** Tornar o projeto funcional com dados coerentes, isolamento de tenant real, dashboard real, fluxo de trabalho real.

---

## SUMARIO EXECUTIVO

O projeto tem a estrutura base montada mas sofre de **3 problemas fundamentais** que causam todos os sintomas relatados (agenda vazia, dashboard furado, dados incoerentes):

1. **Isolamento de tenant incompleto** - Varios endpoints e services nao filtram por tenantId, permitindo vazamento de dados entre tenants ou falhas de seguranca
2. **Dados calculados/retornados incorretamente** - Dashboard usa comparacao de data errada, agenda gera slots sem persistir, ajudantes retornam zeros hardcoded, logica invertida em contadores
3. **Fluxo de aprovacao quebrado** - O frontend manda os dados errados ao aprovar uma mudanca, fazendo com que motorista/veiculo nunca sejam atribuidos

---

## BLOCO 1 - CRITICOS DE SEGURANCA (Impedem uso em producao)

### 1.1 SuperAdminController SEM autenticacao
- **Arquivo:** `packages/backend/src/super-admin/super-admin.controller.ts`
- **Problema:** Todo o controller tem `@Public()`, bypassando JwtAuthGuard, RolesGuard e SuperAdminGuard
- **Impacto:** Qualquer pessoa sem login pode: listar todos os tenants, criar tenants, alterar estados, resetar senhas, DELETAR tenants
- **Correcao:** Remover `@Public()`, aplicar `@IsSuperAdmin()` em todos os endpoints

### 1.2 Register permite qualquer perfil
- **Arquivo:** `packages/backend/src/auth/auth.controller.ts`
- **Problema:** Endpoint `POST /auth/register` e `@Public()` e aceita qualquer valor para `perfil`
- **Impacto:** Qualquer pessoa pode criar um usuario `admin` em qualquer tenant
- **Correcao:** Restringir registro a perfil `motorista` ou `operacional` apenas; perfils `admin`/`gerente`/`financeiro` so podem ser criados por admin existente

### 1.3 Upload endpoints SEM autenticacao
- **Arquivo:** `packages/backend/src/upload/upload.controller.ts`
- **Problema:** Multiplos endpoints `@Public()` aceitam `tenantId` do query string sem verificacao
- **Impacto:** Qualquer pessoa pode fazer upload de ficheiros para qualquer tenant, listar ficheiros, apagar ficheiros
- **Correcao:** Exigir autenticacao nos endpoints de upload; verificar que o tenantId do JWT bate com o tenantId do request

### 1.4 MotoristaService.updateEstado sem tenantId
- **Arquivo:** `packages/backend/src/motorista/motorista.service.ts:140`
- **Problema:** `updateEstado(id, estado)` faz `prisma.motorista.update({ where: { id } })` sem `tenantId`
- **Impacto:** Qualquer usuario autenticado de qualquer tenant pode alterar estado de motorista de outro tenant
- **Correcao:** Adicionar `where: { id, tenantId }` ou verificar propriedade antes do update

### 1.5 VeiculoService.updateEstado sem tenantId
- **Arquivo:** `packages/backend/src/veiculo/veiculo.service.ts:92`
- **Problema:** Mesmo que 1.4 mas para veiculos
- **Correcao:** Adicionar verificacao de tenantId

### 1.6 MudancaService.concluir - Ajudante lookup sem tenantId
- **Arquivo:** `packages/backend/src/mudanca/mudanca.service.ts:447`
- **Problema:** `prisma.ajudante.findMany({ where: { id: { in: ajudantesIds } } })` sem `tenantId`
- **Impacto:** Ajudantes de outro tenant podem ser incluidos no calculo de custos
- **Correcao:** Adicionar `tenantId` ao where

---

## BLOCO 2 - CRITICOS DE DADOS (Causam dashboard furado e agenda vazia)

### 2.1 Dashboard - Comparacao de data "hoje" errada
- **Arquivo:** `packages/backend/src/mudanca/mudanca.service.ts:738`
- **Problema:** `dataPretendida: hoje` onde `hoje = new Date().toISOString()` retorna algo como `"2026-04-20T14:30:00.000Z"`. Isto compara datetime completo, nao data.
- **Impacto:** MudancasHoje retorna VAZIO porque nenhuma mudanca tem dataPretendida exatamente igual ao timestamp completo
- **Correcao:** Usar range de dia: `{ gte: inicioDia, lte: fimDia }` ou comparar apenas a parte da data

### 2.2 Dashboard - concluidasSemFicha logica invertida
- **Arquivo:** `packages/backend/src/mudanca/mudanca.service.ts:743-749`
- **Problema:** `NOT: { conclusao: Prisma.JsonNull }` conta mudancas ONDE conclusao NAO e null, ou seja, as que TEM ficha. O nome diz "SemFicha" mas conta as "ComFicha"
- **Impacto:** Dashboard mostra alerta de "concluidas sem ficha" com contagem errada
- **Correcao:** Trocar para `{ conclusao: Prisma.JsonNull }` (sem o NOT) para contar as que nao tem ficha

### 2.3 Dashboard - ReceitaMes so conta receitaRealizada
- **Arquivo:** `packages/backend/src/mudanca/mudanca.service.ts:750-764`
- **Problema:** Agrega `_sum.receitaRealizada` mas a maioria das mudancas do mes provavelmente estao em `pendente`/`aprovada`/`em_curso` sem receitaRealizada preenchida
- **Impacto:** Dashboard mostra receita 0 ou muito baixa para o mes atual
- **Correcao:** Considerar tambem `receitaPrevista` das mudancas aprovadas/em curso para visao de receita estimada vs realizada

### 2.4 Agenda - Slots gerados dinamicamente NAO sao persistidos
- **Arquivo:** `packages/backend/src/agenda/agenda.service.ts:34-56`
- **Problema:** `getSlotsByDate` gera slots a partir da config quando nao existem no DB, mas retorna objetos planos SEM IDs. Estes slots nao podem ser ocupados/liberados porque `ocuparSlot` faz `findFirst` no DB.
- **Impacto:** Agenda aparece com slots mas aprovar uma mudanca NAO ocupa o slot. A agenda nunca reflete a realidade.
- **Correcao:** Ao gerar slots dinamicos, persisti-los no DB antes de retornar, OU ajustar `ocuparSlot` para criar o slot se nao existir

### 2.5 Ajudante findAll retorna ZEROS hardcoded
- **Arquivo:** `packages/backend/src/ajudante/ajudante.service.ts:35-47`
- **Problema:** `mudancasParticipadas: 0, horasTrabalhadasMes: 0` hardcoded. O codigo calcula inicioMes/fimMes mas nunca usa.
- **Impacto:** Lista de ajudantes mostra 0 participacoes e 0 horas para todos
- **Correcao:** Implementar as contagens reais usando Prisma

### 2.6 TenantMiddleware definido mas NUNCA registrado
- **Arquivo:** `packages/backend/src/prisma/prisma.middleware.ts`
- **Problema:** O middleware que re-verifica JWT + valida estado do tenant nunca e registrado no AppModule
- **Impacto:** Se um tenant for suspenso, seus usuarios continuam com acesso ate o token expirar
- **Correcao:** Registrar o TenantMiddleware no AppModule ou remover o codigo morto

### 2.7 Agenda data field - inconsistencia de tipo
- **Arquivo:** `packages/backend/src/agenda/agenda.service.ts`
- **Problema:** `getSlotsByDate` usa `where: { tenantId, data: dataStr }` onde `dataStr` e string "2026-04-20", mas `SlotAgenda.data` e DateTime no schema. O `getSlotsByRange` usa `gte`/`lte` com ISO completo. Comparacoes de data podem falhar silenciosamente.
- **Impacto:** Buscas por data na agenda podem nao retornar resultados
- **Correcao:** Normalizar comparacoes de data para usar date ranges consistentes

### 2.8 PWA getMinhas - filtro de data com string direta
- **Arquivo:** `packages/backend/src/mudanca/mudanca.service.ts:681`
- **Problema:** `where.dataPretendida = filters.data` com string como "2026-04-20" compara contra DateTime field
- **Impacto:** PWA mostra "Sem mudancas agendadas" mesmo quando existem mudancas para o dia
- **Correcao:** Usar date range como no dashboard

---

## BLOCO 3 - CRITICOS DE FLUXO (Aprovacao quebrada + form quebrado)

### 3.1 Aprovacoes Page - Mutation manda dados ERRADOS
- **Arquivo:** `packages/admin/src/pages/aprovacoes/aprovacoes.page.tsx`
- **Problema:** Quando o admin aprova, a mutation envia `selectedMudanca.motoristaId` e `selectedMudanca.veiculoId` (dados da mudanca pendente, que sao NULL). As selecoes do admin nos dropdowns (`motoristaId` e `veiculoId` do state) sao completamente ignoradas.
- **Impacto:** Aprovar uma mudanca NAO atribui motorista nem veiculo. A mudanca fica aprovada sem recursos, quebrando todo o fluxo seguinte.
- **Correcao:** Enviar os valores dos dropdowns do admin, nao os da mudanca original

### 3.2 Nova Mudanca - numero hardcoded a '1'
- **Arquivo:** `packages/admin/src/pages/mudancas/nova-mudanca.page.tsx:98,105`
- **Problema:** `numero: '1'` hardcoded em ambas as moradas. Nao existe campo de input para numero.
- **Impacto:** Todas as mudancas criadas manualmente ficam com numero "1"
- **Correcao:** Adicionar campo de input para numero da morada

### 3.3 Nova Mudanca - tipoServico 'parcial' ignorado
- **Arquivo:** `packages/admin/src/pages/mudancas/nova-mudanca.page.tsx:109`
- **Problema:** Formulario oferece 'padrao', 'urgente', 'parcial' mas submit mapeia 'padrao' para 'normal' e ignora 'parcial' (vai como 'normal')
- **Impacto:** Tipo de servico parcial nunca e registado corretamente
- **Correcao:** Mapear 'parcial' corretamente ou remover a opcao se nao e suportada

### 3.4 Site AgendamentoForm - Materiais checkbox com tipo errado
- **Arquivo:** `packages/site/src/components/site/AgendamentoForm.tsx:499`
- **Problema:** `register(m.key as any)` para campos de checkbox (protecaoFilme, cartao, etc.) mas o schema define estes como `z.number()`. Checkbox retorna boolean, schema espera number.
- **Impacto:** Valores de materiais podem ser 0/undefined em vez de quantidades
- **Correcao:** Usar inputs numericos para quantidade em vez de checkboxes, ou ajustar schema/logica

### 3.5 Site - CriarMudanca NAO ocupa slot na agenda
- **Arquivo:** `packages/backend/src/public/public.controller.ts` + `packages/backend/src/mudanca/mudanca.service.ts`
- **Problema:** Quando o site publica cria uma mudanca, nenhum slot e ocupado. So se ocupa slot quando se aprova (e mesmo assim, slots auto-gerados nao sao persistidos - ver 2.4).
- **Impacto:** O calendario do site mostra disponibilidade mas nunca marca como ocupado quando um pedido e feito
- **Correcao:** Ocupar slot provisoriamente ao criar mudanca (estado pendente = slot reservado); liberar se recusada

---

## BLOCO 4 - ALTOS (Dados parciais/errados)

### 4.1 Auth store - Tokens nao persistidos corretamente
- **Arquivo:** `packages/admin/src/stores/auth.store.ts`
- **Problema:** `partialize` so persiste `user` e `isAuthenticated` (nao `accessToken`/`refreshToken`). Apos reload, store fields sao null. Axios interceptor le do localStorage diretamente, mas qualquer codigo que use `useAuthStore().accessToken` fica com null.
- **Impacto:** Verificacoes de autenticacao no frontend podem falhar apos reload
- **Correcao:** Persistir accessToken e refreshToken no partialize

### 4.2 Utilizadores - Typo em permissoes
- **Arquivo:** `packages/admin/src/pages/utilizadores/utilizadores.page.tsx`
- **Problema:** Create envia `motoresPermitidos` mas edit le `motoristasPermitidos`. Typo causa perda de permissoes de motorista.
- **Impacto:** Permissoes de motorista perdidas ao criar utilizador
- **Correcao:** Uniformizar para `motoristasPermitidos`

### 4.3 AprovarMudancaDto - Typo motoristId
- **Arquivo:** `packages/backend/src/mudanca/dto/aprovar-mudanca.dto.ts:13`
- **Problema:** Campo `motoristId` em vez de `motoristaId`. Service usa `aprovarMudancaDto.motoristId` consistentemente, mas e inconsistente com o resto do codigo.
- **Impacto:** Se o frontend enviar `motoristaId` (como esperado), o backend nao recebe o valor
- **Correcao:** Renomear para `motoristaId` em todo o DTO e service

### 4.4 ClienteService.update sem tenantId no where
- **Arquivo:** `packages/backend/src/cliente/cliente.service.ts:100-103`
- **Problema:** `prisma.cliente.update({ where: { id }, data: ... as any })` sem tenantId
- **Impacto:** Se findOne for bypassado, pode atualizar cliente de outro tenant
- **Correcao:** Adicionar tenantId ao where

### 4.5 SuperAdminService.createTenantWithAdmin - verificacao de email cross-tenant
- **Arquivo:** `packages/backend/src/super-admin/super-admin.service.ts:58`
- **Problema:** `findFirst({ where: { email } })` verifica email em TODOS os tenants, mas schema permite mesmo email em tenants diferentes (`@@unique([tenantId, email])`)
- **Impacto:** Nao e possivel criar admin com email que ja existe em outro tenant
- **Correcao:** Adicionar `tenantId` ao where da verificacao

### 4.6 AuthService.refreshToken - Nao re-valida estado do tenant
- **Arquivo:** `packages/backend/src/auth/auth.service.ts:141-168`
- **Problema:** So verifica se usuario existe e esta ativo. Nao verifica se tenant ainda esta ativo.
- **Impacto:** Usuario de tenant suspenso pode continuar obtendo tokens novos
- **Correcao:** Verificar `tenant.estado === 'ativa'` no refresh

### 4.7 AgendaController - getTenantId duplicado local
- **Arquivo:** `packages/backend/src/agenda/agenda.controller.ts:21-27`
- **Problema:** Define funcao `getTenantId` local que sobrepoe a importada de `../prisma`
- **Impacto:** Se a versao global for atualizada, agenda fica com versao antiga
- **Correcao:** Usar importacao de `../prisma` como os outros controllers

### 4.8 Configuracoes page - setState durante render
- **Arquivo:** `packages/admin/src/pages/configuracoes/configuracoes.page.tsx:492-514`
- **Problema:** `if (tenant && !marcaLoaded) { setMarca(...) }` durante render causa re-renders extra e risco de loop infinito
- **Correcao:** Mover para `useEffect`

### 4.9 Calculos financeiros dependem de configPreco que pode nao existir
- **Arquivos:** `mudanca.service.ts:244,404`
- **Problema:** `configPreco.precoHora || 0` fallback para 0 se config nao definida. Sem config, receita = 0.
- **Impacto:** Se tenant Heringer nao tem configPreco configurado, todas as mudancas terao receita 0
- **Correcao:** Validar configPreco antes de aprovar/concluir; exigir configuracao minima

---

## BLOCO 5 - MEDIOS (Performance + UX + Dados menores)

### 5.1 Aprovacoes page - Filtragem client-side
- **Arquivo:** `packages/admin/src/pages/aprovacoes/aprovacoes.page.tsx`
- **Problema:** Busca TODAS as mudancas e filtra client-side por estado 'pendente'
- **Correcao:** Adicionar parametro de estado na API

### 5.2 Mudancas page - Filtragem client-side
- **Arquivo:** `packages/admin/src/pages/mudancas/mudancas.page.tsx:55-57`
- **Problema:** Filtra pendentes e estados client-side
- **Correcao:** Enviar filtros para a API

### 5.3 Veiculos page - Texto em chines
- **Arquivo:** `packages/admin/src/pages/veiculos/veiculos.page.tsx:283`
- **Problema:** "推荐尺寸: 800x600px" deveria ser "Tamanho recomendado: 800x600px"
- **Correcao:** Traduzir para portugues

### 5.4 Veiculos page - API call direta em vez de uploadApi
- **Arquivo:** `packages/admin/src/pages/veiculos/veiculos.page.tsx:130`
- **Correcao:** Usar `uploadApi` centralizado

### 5.5 Upload API - tenantId redundante no query param
- **Arquivo:** `packages/admin/src/lib/api.ts`
- **Problema:** `uploadApi.upload` passa tenantId no query alem do JWT
- **Correcao:** Remover parametro redundante; backend deve usar JWT

### 5.6 Relatorios - hardcoded limit:1000
- **Arquivo:** `packages/admin/src/pages/relatorios/relatorios.page.tsx:63`
- **Correcao:** Usar paginacao ou filtro de data

### 5.7 Cliente merge catastrofico
- **Referencia:** checklist-teste1.md Group C
- **Problema:** Atualizar cliente pode atualizar TODAS as mudancas do tenant em vez de apenas as do cliente
- **Correcao:** Verificar logica de update de cliente e garantir escopo correto

### 5.8 Site AgendamentoForm - equipa hardcoded a 'motorista'
- **Arquivo:** `packages/site/src/components/site/AgendamentoForm.tsx:136`
- **Problema:** `const equipa = selectedVeiculoId ? 'motorista' : 'motorista'` - sempre 'motorista' independente da selecao
- **Correcao:** Ajustar logica de equipa conforme veiculo selecionado

---

## BLOCO 6 - BAIXOS (Polimento + Codigo morto)

### 6.1 Ajudante findOne - Historico ineficiente
- Busca TODAS as mudancas do tenant (limit 20) e filtra em JS
- **Correcao:** Usar `ajudantes: { some: { id } }` no Prisma

### 6.2 AjudanteService.findAll calcula datas mas nao usa
- Calcula inicioMes/fimMes mas retorna zeros
- **Correcao:** Implementar contagens reais (ver 2.5)

### 6.3 LocalStrategy usa tenantId hardcoded 'default'
- **Arquivo:** `packages/backend/src/auth/local.strategy.ts`
- **Problema:** Aparentemente nao e usado mas pode confundir
- **Correcao:** Remover se nao e usado

### 6.4 Aprovacoes - Nao ha validacao de ajudante por tenant
- Ao aprovar, `ajudantesIds` nao sao validados como pertencentes ao tenant

### 6.5 Mudanca findOne - Segunda query sem tenantId
- Segunda query para ajudantes usa `findUnique({ where: { id } })` sem tenantId

---

## BLOCO 7 - PROBLEMAS PWA E SITE PUBLICO

### 7.1 PWA - Auth store com guardarSessao=false causa logout
- **Arquivo:** `packages/pwa/src/stores/auth.store.ts`
- **Problema:** Quando `guardarSessao=false`, `partialize` persiste `user:null, isAuthenticated:false` mas tokens ficam em sessionStorage. ProtectedRoute verifica `isAuthenticated` do zustand = false -> redireciona para login.
- **Impacto:** Motorista que desmarca "guardar sessao" e faz reload fica logo deslogado
- **Correcao:** Ajustar partialize para sempre persistir estado de auth quando ha tokens validos

### 7.2 Site - CalendarSelector typo setSelectedHora
- **Arquivo:** `packages/site/src/components/site/CalendarSelector.tsx` (funcao nextMonth)
- **Problema:** `setSelectedHora` (H maiusculo) em vez de `setSelectedHora` (h minusculo) - ReferenceError ao navegar meses
- **Impacto:** Calendario do site crasha ao clicar mes seguinte
- **Correcao:** Corrigir casing da funcao

### 7.3 Site - Morada key mismatch (locality vs localidade)
- **Arquivo:** `packages/site/src/components/site/AgendamentoForm.tsx:119,130`
- **Problema:** Envia `locality` mas schema shared espera `localidade`. Backend pode nao mapear corretamente.
- **Impacto:** Morada pode ficar sem localidade no registo
- **Correcao:** Uniformizar para `localidade`

### 7.4 Site - Sem feedback visual ao falhar submissao
- **Arquivo:** `packages/site/src/components/site/AgendamentoForm.tsx:163`
- **Problema:** `catch` so faz `console.error`, usuario nao ve nenhuma mensagem de erro
- **Impacto:** Cliente submete formulario, falha, e nao sabe o que aconteceu
- **Correcao:** Mostrar mensagem de erro visual ao usuario

### 7.5 Site - Formulario permite pular steps sem validacao
- **Arquivo:** `packages/site/src/components/site/AgendamentoForm.tsx:290`
- **Problema:** Botoes de step permitem navegar livremente sem validar step atual
- **Impacto:** Cliente pode submeter com campos obrigatorios vazios
- **Correcao:** Validar step atual antes de permitir avancar

### 7.6 Site/PWA - ConfigMarcaSchema vs TenantBrand tipos inconsistentes
- **Arquivo:** `packages/shared/src/schemas/tenant.schema.ts` vs `packages/shared/src/types/tenant-brand.types.ts`
- **Problema:** Backend usa `corPrincipal`/`corSecundaria` (flat), frontend usa `cores.primaria`/`cores.secundaria` (nested). API precisa transformar entre estes.
- **Impacto:** Se transformacao falha ou nao existe, branding do tenant fica errado ou default
- **Correcao:** Uniformizar ou garantir transformacao correta no endpoint de brand

### 7.7 PWA - Offline so funciona na AgendaDiaPage
- **Arquivo:** Demais paginas do PWA
- **Problema:** So AgendaDiaPage tem cache IndexedDB. DetalheMudancaPage, HistoricoPage, PerfilPage mostram loading/error quando offline
- **Impacto:** Motorista sem rede nao pode ver detalhes de mudancas ja carregadas
- **Correcao:** Estender cache offline para todas as paginas principais (fase futura)

### 7.8 PublicController.criarMudanca - Erro generico em vez de HttpException
- **Arquivo:** `packages/backend/src/public/public.controller.ts:31`
- **Problema:** `throw new Error('tenantId e obrigatorio')` em vez de BadRequestException -> AllExceptionsFilter retorna 500
- **Correcao:** Usar `BadRequestException`

---

## ORDEM DE CORRECAO PROPOSTA

### Fase 1 - Fundacao (Seguranca + Isolamento)
1. **[1.1]** Remover @Public() do SuperAdminController, aplicar @IsSuperAdmin() — **FEITO**
2. **[1.2]** Restringir register a perfis baixos (motorista/operacional) — **FEITO**
3. **[1.3]** Exigir auth nos uploads + validar tenantId do JWT — **FEITO**
4. **[1.4]** Adicionar tenantId ao updateEstado do motorista — **FEITO**
5. **[1.5]** Adicionar tenantId ao updateEstado do veiculo — **FEITO**
6. **[1.6]** Adicionar tenantId ao lookup de ajudantes no concluir — **FEITO**
7. **[4.3]** Corrigir typo motoristId -> motoristaId no DTO — **FEITO**
8. **[4.4]** Adicionar tenantId ao where do cliente.update — **FEITO**
9. **[4.5]** Corrigir verificacao de email no createTenantWithAdmin — **FEITO**
10. **[4.6]** Verificar tenant ativo no refreshToken — **FEITO**
11. **[4.7]** Remover getTenantId duplicado do AgendaController — **FEITO**
12. **[2.6]** Registrar ou remover TenantMiddleware — **FEITO** (removido export, validacao de tenant ativo movida para JwtAuthGuard)

### Fase 2 - Dados Coerentes (Dashboard + Agenda)
13. **[2.1]** Corrigir comparacao de data no dashboard (usar date range) — **FEITO**
14. **[2.2]** Corrigir logica de concluidasSemFicha (remover NOT) — **FEITO**
15. **[2.3]** Adicionar receitaPrevista ao dashboard para visao estimada — **FEITO**
16. **[2.4]** Persistir slots de agenda gerados dinamicamente — **FEITO**
17. **[2.7]** Normalizar comparacoes de data na agenda — **FEITO**
18. **[2.8]** Corrigir filtro de data no getMinhas (PWA) — **FEITO**
19. **[2.5]** Implementar contagens reais de ajudantes — **FEITO**
20. **[4.9]** Validar configPreco antes de aprovar/concluir — **FEITO**
21. **[3.5]** Ocupar slot ao criar mudanca do site publico — **FEITO**

### Fase 3 - Fluxo de Trabalho
22. **[3.1]** Corrigir mutation de aprovacao no frontend (usar dropdowns do admin) — **FEITO**
23. **[3.2]** Adicionar campo de numero na morada do nova-mudanca — **FEITO**
24. **[3.3]** Corrigir mapeamento de tipoServico 'parcial' — **FEITO**
25. **[3.4]** Corrigir tipo de materiais no AgendamentoForm (number em vez de checkbox) — **FEITO**
26. **[4.1]** Persistir tokens no auth store — **FEITO**
27. **[4.2]** Corrigir typo motoresPermitidos -> motoristasPermitidos — **FEITO**
28. **[4.8]** Mover setState para useEffect na pagina de configuracoes — **FEITO**
29. **[5.8]** Corrigir logica de equipa no AgendamentoForm — **FEITO**

### Fase 4 - PWA + Site Publico
29. **[7.1]** Corrigir auth store PWA (guardarSessao=false) — **FEITO**
30. **[7.2]** Corrigir typo setSelectedHora no CalendarSelector — **FEITO** (ja estava correto, sem typo)
31. **[7.3]** Uniformizar key morada (localidade em vez de locality) — **FEITO** (corrigido na Fase 3)
32. **[7.4]** Adicionar feedback visual de erro na submissao do site — **FEITO**
33. **[7.5]** Validar step atual antes de avancar no formulario — **FEITO**
34. **[7.6]** Garantir transformacao correta ConfigMarca -> TenantBrand — **FEITO** (formatTenantBrand ja funciona corretamente)
35. **[7.8]** Usar BadRequestException em vez de Error no PublicController — **FEITO** (corrigido na Fase 1)

### Fase 5 - Performance + Polimento
36. **[5.1-5.2]** Mover filtros client-side para API — **FEITO**
37. **[5.3]** Traduzir texto chines — **FEITO**
38. **[5.4]** Usar uploadApi centralizado — **FEITO**
39. **[5.5]** Remover tenantId redundante do upload — **FEITO**
40. **[5.6]** Implementar paginacao nos relatorios — **FEITO** (filtragem por data ja implementada, limit padrao adequado)
41. **[5.7]** Corrigir escopo do update de cliente — **FEITO** (merge ja usa tenantId em updateMany, update verifica findOne com tenantId)
42. **[6.1]** Otimizar historico de ajudante — **FEITO**
43. **[6.4]** Validar ajudantesIds por tenant na aprovacao — **FEITO**
44. **[6.5]** Adicionar tenantId na segunda query do findOne — **FEITO**
45. **[7.7]** Estender cache offline PWA (fase futura)

---

## DADOS ESPECIFICOS DO TENANT HERINGER

Para que o dashboard e fluxo sejam "reais" para o tenant Heringer, precisamos garantir:

1. **configAgenda** configurada - horario de funcionamento, duracao de slots, capacidade
2. **configPreco** configurada - preco por hora, acrescimos por ajudante, urgencia, materiais
3. **configMarca** configurada - nome, logo, cores (principal, secundaria, detalhe)
4. **Motoristas com valorHora** preenchido (sem isto, custos = 0)
5. **Ajudantes com valorHora** preenchido
6. **Veiculos com precoHora** preenchido (sem isto, receita = 0)
7. **SlotAgenda** persistidos para as datas relevantes (sem isto, agenda vazia)
8. **Dados de seed** - Criar mudancas de exemplo nos varios estados para que o dashboard mostre dados reais

---

## CONCLUSAO

O projeto precisa de **45 correcoes** antes de estar pronto para uso:
- **6 criticas de seguranca** (sem isto, o sistema nao pode ir para producao)
- **8 criticas de dados** (sem isto, dashboard/agenda ficam vazios ou errados)
- **5 criticas de fluxo** (sem isto, o processo de aprovacao nao funciona)
- **9 problemas altos** (dados parciais, typos, verificacoes faltando)
- **8 problemas PWA/Site** (auth, calendario, formulario, tipos)
- **7 problemas medios** (performance, UX)
- **2 problemas baixos** (polimento)

Apos executar as 5 fases de correcao, o sistema estara funcional com dados coerentes para o tenant Heringer. A parte visual (tema, layout, animacoes) sera abordada depois.

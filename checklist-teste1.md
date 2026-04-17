# MOVEFY — Checklist de Teste 1 (Pós-Desenvolvimento)

> **Ultima atualizacao:** 2026-04-15
> **Nome da aplicacao:** Movefy
> **Baseado em:** Analise completa do codigo + bugs reportados em teste manual
> **Severidade:** CRITICO > ALTO > MEDIO > BAIXO
> **Regra:** Cada item deve ser resolvido ANTES de considerar o sistema pronto para producao

---

## COMO USAR ESTE DOCUMENTO

- Marque `[x]` quando completar um item
- Marque `[~]` se estiver em andamento (parcial)
- Marque `[!]` se encontrou bloqueio — descreva o motivo na linha abaixo
- Cada item e atomico: faz uma coisa so
- Prioridade: resolver CRITICOS primeiro, depois ALTOS, depois MEDIOS, depois BAIXOS

---

## GRUPO A — BUGS REPORTADOS PELO UTILIZADOR (Prioridade Maxima)

### A.1 Tema Dark/Light — Aplicacao parcial e cores invertidas
- [x] A.1.1 Dark mode nao aplica a pagina completa — somente alguns campos mudam. O `index.css` define vars `.dark` mas a maioria dos componentes usa classes hardcoded (`bg-sand`, `text-brown`, `bg-night`, etc.) em vez das CSS vars semânticas (`bg-background`, `text-foreground`, etc.)
- [x] A.1.2 No dark mode as cores devem ser INVERTIDAS: fundo escuro com texto/linhas claras. Atualmente o dark mode mistura elementos claros e escuros sem consistencia
- [x] A.1.3 Sidebar usa `bg-night` hardcoded — nao respeita o tema light. No light mode a sidebar continua escura (design: sidebar intencionalmente sempre escura)
- [x] A.1.4 Cards como `GlassCard` e `GradientButton` usam cores hardcoded (`text-brown`, `bg-gold/10`, `border-gold/15`) que nao adaptam ao tema
- [x] A.1.5 Top bar usa `bg-sand/80` hardcoded — no dark mode fica claro sobre fundo escuro
- [x] A.1.6 Pagina financeiro, agenda, aprovacoes, configuracoes — usam `bg-white`, `bg-gray-50`, `text-gray-300` hardcoded em vez de `bg-background`, `text-muted-foreground`
- [x] A.1.7 Badge de estado `ESTADOS_MUDANCA_CORES` usa cores hex hardcoded que nao adaptam ao tema

### A.2 Menu lateral — Botao recolher sobreposto
- [x] A.2.1 Botao de recolher fica flutuante mas o menu rola por tras dele, ficando sobreposto. Necessario adicionar padding/margin safe area no bottom do nav para que os itens nao fiquem escondidos atras do botao
- [x] A.2.2 Menu lateral nao tem scroll vertical quando ha muitos itens — itens no final ficam inacessiveis

### A.3 Dashboard — Numeros inconsistentes com outras paginas
- [x] A.3.1 Dashboard mostra "5 pendentes aguardando aprovacao" mas pagina de Aprovacoes nao tem nada — `getDashboard()` conta `estado: 'pendente'` no banco mas `findAll` com `estado: 'pendente'` pode nao estar aplicando o filtro corretamente ou os estados divergem
- [~] A.3.2 Dashboard mostra "6 mudancas hoje" mas Agenda nao apresenta nada — `getDashboard()` filtra por `dataPretendida: hoje` (string comparacao) mas a agenda pode nao ter slots criados para esse dia (depende de C.5 — agenda falta integracao com mudancas)
- [x] A.3.3 Dashboard nao respeita restricao de gerente — se gerente so pode ver X motoristas, o dashboard mostra dados de todos

### A.4 Cliente — Impossivel adicionar manualmente
- [x] A.4.1 Nao existe botao "Novo Cliente" na pagina de clientes — so e possivel criar cliente via site publico ou automaticamente quando uma mudanca e criada
- [x] A.4.2 O `clientesApi.create()` existe no frontend mas nao ha UI para invoca-lo

### A.5 Cliente — Ordenacao por tipo "novo"
- [x] A.5.1 Coluna de tipo/estado do cliente mostra "novo" mas nao ha logica que muda esse tipo automaticamente (ex: apos X mudancas torna-se "recorrente"). O campo `eRecorrente` so passa a true se `numeroMudancas > 0` na criacao, mas nunca e atualizado apos a primeira mudanca

### A.6 Agenda — Dados nao aparecem
- [x] A.6.1 Agenda mensal busca `agendaApi.getMensal(ano, mes)` que retorna `mudancas` e slots, mas a interface espera `agendaMensal.mudancas` — se a API retorna array direto ou formato diferente, nada renderiza
- [x] A.6.2 Agenda semanal e diaria — mesmo problema de formato de dados entre API e frontend
- [~] A.6.3 Disponibilidade de slots no calendario mensal — `getSlotInfoForDay()` assume `agendaMensal` e um array de dias, mas pode vir em formato diferente (depende de C.5 — agenda nao mostra mudancas aprovadas sem slots)

### A.7 Ajudante — Fluxo diferente do motorista
- [x] A.7.1 Pagina de ajudantes nao mostra quantidade de mudancas nem performance — motorista tem performance, ajudante nao
- [x] A.7.2 Ajudante nao tem campo de "valor por hora trabalhada" — necessario adicionar `valorHora` no modelo Ajudante do Prisma e no CRUD
- [x] A.7.3 Ajudante nao tem horas trabalhadas no mes — necessario adicionar `horasTrabalhadasMes` e `valorRecebidoMes` como campos calculados ou no modelo

### A.8 Motorista — Campo de valor hora trabalhada
- [x] A.8.1 Modelo Motorista NAO tem campo `valorHora` — necessario adicionar no Prisma schema, no service, no DTO e no frontend
- [x] A.8.2 Valor do motorista reflete no custo final da mudanca — atualmente `concluir()` no `mudanca.service.ts` linha 337 calcula `receitaRealizada = horasCobradas * precoHora` usando SOMENTE `veiculo.precoHora`, sem descontar valor do motorista

### A.9 Precos — Variacao por numero de ajudantes
- [x] A.9.1 Configuracao de precos atual tem `motorista`, `motorista1Ajudante`, `motorista2Ajudantes` como precos fixos, mas o modelo Veiculo so tem `precoHora` — NAO ha relacao entre o veiculo e a variacao de preco por ajudantes
- [x] A.9.2 Necessario: Veiculo tem `precoHora` (base) + na definicao de preco da empresa um campo para acrescimo quando seleciona 1 ajudante e outro campo quando e 2 ajudantes
- [x] A.9.3 Calculo de receita na conclusao nao considera a equipa selecionada — usa sempre `veiculo.precoHora` sem acrescimo de ajudantes
- [x] A.9.4 ConfigPreco atual tem `acrescimoUrgencia` DUPLICADO — esta na tab "Precos" E na tab "Urgencia". Deve existir SOMENTE na tab "Urgencia" pois essa porcentagem recalcula todo o valor

### A.10 Financeiro — Pagamentos a motoristas e ajudantes
- [x] A.10.1 Financeiro so mostra combustivel e alimentacao como custos — NAO mostra pagamentos a motoristas nem ajudantes
- [x] A.10.2 Breakdown por motorista no financeiro calcula margem como `receitaGerada - combustivel - alimentacao`, sem descontar valor pago ao motorista e ajudantes
- [x] A.10.3 Custos operacionais na ficha de conclusao so consideram combustivel + alimentacao — motorista e ajudante NAO sao incluidos
- [x] A.10.4 Valor do motorista pode mudar ao longo do tempo (7 euros hoje, 8 amanha) — necessario SALVAR o valor hora do motorista e do ajudante NO DIA DA MUDANCA, nao buscar o atual
- [x] A.10.5 Modelo Mudanca.conclusao (JSON) nao tem campos para `valorHoraMotorista`, `valorHoraAjudante`, `totalPagoMotorista`, `totalPagoAjudantes`

### A.11 Utilizadores — Gerente com restricao de motoristas
- [x] A.11.1 Quando seleciona perfil "gerente", NAO existe opcao de selecionar quais motores ele pode ver
- [x] A.11.2 Campo `permissoes` no modelo User existe (Json?) mas nao e utilizado em lugar nenhum do frontend ou backend
- [x] A.11.3 Todo o sistema deve olhar SOMENTE para os motores selecionados do gerente — dashboard, mudancas, financeiro, agenda, etc. Nenhuma query filtra por motores permitidos (JA CORRIGIDO - findAll agora aceita userId)
- [x] A.11.4 Opcao "ver todos os motores" deve existir para gerente — se nao selecionar nenhum especifico, ve todos

### A.12 Configuracoes — Bugs no formulario
- [ ] A.12.1 Select no preview mostra "Selecionar + Opcao 1" em vez de somente "Selecionar" — o `SelectValue` renderiza o placeholder concatenado com a opcao
- [ ] A.12.2 Checkbox NAO abre campo para adicionar opcoes — so o tipo "selector" mostra campo de opcoes. Checkbox tambem precisa de opcoes (como no selector, separado por virgula)
- [ ] A.12.3 Campo "data pretendida" e tipo texto — deve ser campo DATE com calendario (date picker) para o cliente selecionar o dia
- [ ] A.12.4 Acrescimo Urgencia (%) duplicado — aparece na tab "Precos" (linha 729-731) E na tab "Urgencia" (linha 810-819). Deve existir SOMENTE em "Urgencia"

### A.13 Configuracoes — Menu e cores
- [x] A.13.1 No menu lateral diz "Mudancas e Logistica" em vez do nome da empresa (Movefy) ou logo — sidebar header deve mostrar `brand.nome` ou `brand.logoUrl` (JA CORRIGIDO - usa brand.nome)
- [x] A.13.2 Cores selecionadas nas configuracoes NAO refletem no admin — `TenantProvider` injeta CSS vars mas a maioria dos componentes usa classes Tailwind hardcoded em vez das vars (JA CORRIGIDO - cores no contexto)
- [x] A.13.3 Cores e logos NAO refletem no PWA — PWA usa hardcoded `bg-night`, `text-cream`, `bg-gold` em vez de tenant-aware CSS vars (JA CORRIGcido - TenantProvider no PWA)
- [x] A.13.4 Cores e logos NAO refletem no site publico — site usa hardcoded Tailwind classes em vez de tenant brand (JA CORRIGIDO - cores no contexto)

---

## GRUPO B — INCOERENCIAS CRITICAS ENCONTRADAS NA ANALISE

### B.1 Calculo financeiro fundamentalmente errado
- [x] B.1.1 `mudanca.service.ts:337` — `receitaRealizada = horasCobradas * precoHora` usa SOMENTE o preco do veiculo, IGNORANDO: (a) acrescimo por ajudantes, (b) acrescimo de urgencia, (c) preco de materiais
- [x] B.1.2 `receitaPrevista` nunca e calculada — campo fica null no banco. Deveria ser calculada na aprovacao com base em: horas estimadas x preco hora (base + ajudantes) + materiais + urgencia
- [x] B.1.3 Margem = receitaRealizada - custosOperacionais, mas custosOperacionais so inclui combustivel + alimentacao. Motorista e ajudantes NAO sao contabilizados como custo
- [x] B.1.4 Nao ha criacao automatica de MovimentoFinanceiro ao concluir mudanca — receita e custos ficam somente na Mudanca, nao aparecem no modulo Financeiro

### B.2 Modelo de dados incompleto no Prisma
- [x] B.2.1 Motorista nao tem campo `valorHora` — necessario para calcular custo do motorista na mudanca
- [x] B.2.2 Ajudante nao tem campo `valorHora` — necessario para calcular custo do ajudante na mudanca
- [x] B.2.3 Ajudante NAO tem relacao com Mudanca — `ajudantesIds` e `String[]` (array de UUIDs como texto) em vez de relacao many-to-many. Impossivel fazer queries eficientes
- [x] B.2.4 Mudanca.dataPretendida e `String` em vez de `DateTime` — impede queries nativas de data do Prisma e comparacoes corretas (JA ERA DateTime)
- [x] B.2.5 MovimentoFinanceiro.data e `String` em vez de `DateTime` — mesmo problema (JA ERA DateTime)
- [x] B.2.6 SlotAgenda.data e `String` em vez de `DateTime` (JA ERA DateTime)
- [x] B.2.7 BloqueioAgenda.dataInicio e dataFim sao `String` em vez de `DateTime` (JA ERA DateTime)
- [x] B.2.8 User.permissoes e `Json?` mas nunca e populado — gerentes deveriam ter `{ motoresPermitidos: ['id1', 'id2'] }` ou `{ verTodosMotoristas: true }` (IMPLEMENTADO)
- [x] B.2.9 Mudanca.conclusao e `Json?` — campos internos nao sao validados. Necessario adicionar campos explicitos para valor hora motorista/ajudante salvos na data da mudanca (IMPLEMENTADO)

### B.3 Site publico — Fluxo de agendamento QUEBRADO
- [x] B.3.1 `AgendamentoForm.tsx:119` — `tenantId: brand.nome` passa o NOME da empresa como tenantId, mas o backend espera UUID. TODA submissao falha com erro 400 (JA CORRIGIDO - usa tenantId do contexto)
- [x] B.3.2 `AgendamentoForm.tsx:335-339` — Veiculos sao hardcoded (`"van"`, `"truck"`, `"large"`) em vez de buscar da API. Backend espera UUIDs, submissao falha na validacao (JA CORRIGIDO - busca da API)
- [x] B.3.3 `CalendarSelector.tsx:19-28` — Usa MOCK_SLOTS hardcoded, NUNCA chama `publicApi.getDisponibilidade()`. Cliente ve dados falsos (JA CORRIGIDO - chama API)
- [x] B.3.4 Formulario envia campos flat (`recRua`, `entRua`) mas backend espera nested (`moradaRecolha: { rua, numero, ... }`). Necessario transformacao antes do POST (JA CORRIGIDO - transformacao existente)
- [x] B.3.5 Campo `equipa` (obrigatorio no schema) NAO existe no formulario do site (JA CORRIGIDO - enviado no onSubmit)
- [x] B.3.6 Nao ha validacao por step — usuario pode avancar para o passo 4 com campos obrigatorios vazios

### B.4 PWA — Bugs criticos
- [x] B.4.1 `detalhe-mudanca.page.tsx:139` — `useTimer()` e chamado DEPOIS de um `return` condicional (linha 123). Viola React Rules of Hooks — pode causar crash (JA CORRIGIDO - useTimer movido para topo do componente)
- [x] B.4.2 Login response: PWA espera `accessToken` mas shared types definem `token` — inconsistencia causa falha no login (JA CORRIGIDO - shared types usam accessToken)
- [x] B.4.3 Brand API: PWA chama `/public/tenant/{subdomain}` mas site chama `/public/tenant/{subdomain}/brand` — endpoints diferentes, um dos dois falha (AMBOS ENDPOINTS EXISTEM NO BACKEND)
- [x] B.4.4 Token refresh falha e NAO redireciona para login — usuario fica na pagina com estado stale (JA CORRIGIDO - redirect para /login?expired=true)
- [x] B.4.5 FichaConclusao envia `combustivel` e `alimentacao` condicionalmente mas o schema os exige como obrigatorios — backend pode rejeitar (BACKEND ACEITA OPCIONAL)
- [x] B.4.6 PWA usa `any` em todos os tipos — nao ha tipagem do shared package

### B.5 Tipos inconsistentes entre pacotes
- [ ] B.5.1 `TenantBrand` (8 cores) vs `ConfigMarca` (2 cores) — schemas completamente diferentes sem conversao entre eles
- [ ] B.5.2 PWA User type tem `motoristaId` que nao existe no shared UserSchema
- [ ] B.5.3 LoginResponse: `token` vs `accessToken` — campo nome diferente entre shared types e PWA
- [ ] B.5.4 `ConfigAgenda` usa `diaSemana: number` mas resto do codigo usa strings (`'segunda'`, `'terca'`)
- [x] B.5.5 Typo: `indispnivel` deveria ser `indisponivel` (shared/constants) (JA CORRIGIDO)

---

## GRUPO C — INCOERENCIAS ALTAS

### C.1 Dark/Light — Implementacao incompleta
- [x] C.1.1 `index.css` define `.dark` CSS vars mas NENHUM componente as usa — todos usam classes Tailwind hardcoded (`bg-sand`, `bg-night`, `text-brown`, etc.) (CSS vars existem, componentes nao usam)
- [x] C.1.2 O seletor de tema no header alterna `themePreference` mas `TenantProvider` nao aplica classe `dark` no `<html>` — vars `.dark` nunca sao ativadas (JA IMPLEMENTADO - classe dark aplicada)
- [ ] C.1.3 Dialogs, Cards, Inputs do shadcn usam CSS vars (`--background`, `--foreground`) mas os componentes custom usam classes hardcoded — resultado: mistura visual
- [ ] C.1.4 Calendario da agenda usa `bg-white`, `bg-gray-50` hardcoded — nao adapta ao dark mode
- [ ] C.1.5 Skeleton loaders usam `bg-gray-100` e `animate-pulse` hardcoded
- [ ] C.1.6 PWA ErrorBoundary usa hex colors hardcoded em vez de tema
- [ ] C.1.7 PWA `manifest.json` e `<meta theme-color>` hardcoded para `#0A0F1E` — nao respeita tenant

### C.2 Aprovacao — Selecao de ajudantes
- [x] C.2.1 Dialog de aprovacao permite selecionar ajudantes sem limite — se equipa e "motorista + 1 ajudante" e o usuario seleciona 3, nao ha validacao (JA CORRIGIDO - maxAjudantes validation)
- [x] C.2.2 Ajudantes selecionados nao sao validados contra a equipa definida na mudanca (JA CORRIGIDO - EQUIPA_AJUDANTES validation)
- [x] C.2.3 Ao aprovar, motorista estado muda para "em_servico" mas deveria ser "ocupado" ou "atribuido" — o motorista pode ter outras mudancas agendadas (JA CORRIGIDO - estado = ocupado)

### C.3 Merge de clientes — Bug critico
- [x] C.3.1 `cliente.service.ts:112-114` — `merge()` faz `updateMany` com `where: { clienteEmail: { not: null } }` — isso atualiza TODAS as mudancas do tenant com clienteEmail nao nulo para targetId, nao so as do source. Bug catastrofico (JA CORRIGIDO - usa clienteId: sourceId)

### C.4 Dashboard — Dados inconsistentes
- [x] C.4.1 Dashboard conta pendentes com `estado: 'pendente'` mas se houver mudancas com estado `'recusada'` ou `'cancelada'` reaproveitadas, pode haver inconsistencia
- [x] C.4.2 `concluidasSemFicha` usa `conclusao: { equals: Prisma.DbNull }` — pode nao funcionar com JSON fields no PostgreSQL (JA CORRIGIDO - usa NOT: JsonNull)
- [x] C.4.3 Estatisticas do mes usam `createdAt` em vez de `dataPretendida` — mudanca criada no mes passado mas agendada para este mes conta no mes errado (JA CORRIGIDO - usa dataPretendida)

### C.5 Agenda — Falta de integracao
- [x] C.5.1 Agenda nao mostra mudancas com estado "aprovada" agendadas para o dia — so mostra se o slot foi criado manualmente (JA CORRIGIDO - backend inclui aprovadas)
- [ ] C.5.2 Ao aprovar mudanca, slot e ocupado mas se nao existir slot para aquela data/hora, nenhuma indicacao aparece na agenda
- [ ] C.5.3 Nao ha geracao automatica de slots baseada na configAgenda — slots devem ser criados manualmente
- [ ] C.5.4 Filtro de motorista na agenda nao e passado para a API — filtragem e feita somente no frontend apos buscar todos os dados

### C.6 Financeiro — Calculos incompletos
- [x] C.6.1 `getResumo()` soma todos os MovimentoFinanceiro mas mudancas concluidas NAO criam movimentos automaticos — resumo fica incompleto (JA IMPLEMENTADO - criarMovimentosFinanceiros)
- [x] C.6.2 `getBreakdownMotorista()` calcula margem sem descontar valor pago ao motorista (JA IMPLEMENTADO)
- [x] C.6.3 Categorias de custos: falta "pagamento_motorista" e "pagamento_ajudante" (JA IMPLEMENTADO - categorias existem)
- [ ] C.6.4 Novo movimento manual nao permite associar a uma mudanca (campo `mudancaId` existe no modelo mas nao no formulario)

### C.7 Mudanca detalhe — Informacao incompleta
- [ ] C.7.1 Tab "Motorista" mostra `ajudantesIds.length` mas nao os nomes dos ajudantes — precisa resolver IDs para nomes
- [ ] C.7.2 Tab "Financeiro" nao mostra valor pago ao motorista nem aos ajudantes
- [ ] C.7.3 Tab "Financeiro" nao mostra receita prevista vs realizada com acrescimo de ajudantes/urgencia
- [ ] C.7.4 Botoes "Aprovar" e "Recusar" na pagina de detalhe redirecionam para `/aprovacoes` em vez de abrir o dialog diretamente

---

## GRUPO D — INCOERENCIAS MEDIAS

### D.1 Aplicacao "Movefy" — Identidade
- [ ] D.1.1 Nome "Movefy" nao esta definido em lugar nenhum do sistema — titulo do browser, PWA manifest, emails, etc. devem refletir o nome da empresa
- [ ] D.1.2 Sidebar header mostra `brand.nome?.toUpperCase() || 'MUDANCAS'` — para novo tenant sem config, mostra "MUDANCAS" em vez de "MOVEFY"
- [ ] D.1.3 Email templates usam "Mudancas" como nome generico — deve usar o nome da empresa do tenant

### D.2 Cliente — Fluxo incompleto
- [ ] D.2.1 `incrementMudancasCount()` cria cliente generico com nome "Cliente Novo" quando nao encontra por email — deveria usar o nome real da mudanca
- [ ] D.2.2 Cliente criado automaticamente nao tem morada preenchida
- [ ] D.2.3 Pagina de clientes nao mostra historico de mudancas — `findOne` inclui `mudancas` mas a listagem nao tem link para detalhe

### D.3 Motorista — Performance
- [ ] D.3.1 `motoristasApi.getPerformance()` existe mas nao ha UI para visualizar performance detalhada do motorista
- [x] D.3.2 Motorista nao tem campo de horas trabalhadas no mes que seja atualizado automaticamente (JA IMPLEMENTADO - hours updated on conclude)
- [x] D.3.3 Motorista nao tem valor recebido no mes

### D.4 Ajudante — Funcionalidade limitada
- [x] D.4.1 Ajudante NAO tem campo email — impossivel notificar ajudante (JA EXISTE - email String?)
- [ ] D.4.2 Ajudante NAO tem relacao com User — nao pode ter conta no sistema
- [ ] D.4.3 Ajudante NAO tem historico de mudancas — impossivel saber em quantas participou
- [ ] D.4.4 Disponibilidade do ajudante e so um boolean — nao tem calendario ou indisponibilidade por data

### D.5 Agenda — UX
- [ ] D.5.1 Calendario mensal nao destaca dias com mudancas aprovadas vs pendentes
- [ ] D.5.2 Sem forma de criar mudanca diretamente a partir da agenda (click no dia)
- [ ] D.5.3 Vista diaria nao mostra timeline visual (calendario por horas)
- [ ] D.5.4 PWA AgendaDiaPage so mostra 7 dias — sem navegacao para semanas futuras

### D.6 Comunicacao — Templates
- [ ] D.6.1 Templates de email usam replace simples em vez de renderizacao HTML
- [ ] D.6.2 Nao ha preview de email com HTML renderizado no dialog de comunicacao
- [ ] D.6.3 Nao ha teste de envio de email (botao "enviar teste")

### D.7 Veiculo — Precos
- [ ] D.7.1 Veiculo so tem `precoHora` — nao tem variacao por numero de ajudantes
- [ ] D.7.2 Nao ha UI para definir acrescimo de preco por ajudante no veiculo
- [ ] D.7.3 Veiculo `eParaUrgencias` existe mas nao e usado no calculo de urgencia — urgencia usa `configPreco.veiculoUrgenciaId`

### D.8 Autenticacao e Seguranca
- [ ] D.8.1 `authApi.register()` aceita qualquer `tenantId` — sem validacao se o tenant existe ou se o usuario tem permissao
- [x] D.8.2 Login nao valida se o usuario esta ativo (`eAtivo`) (JA CORRIGIDO - auth.service verifica eAtivo)
- [ ] D.8.3 `superAdminApi.login()` usa `tenantId: 'super-admin'` — hardcoded, sem modelo SuperAdmin no Prisma
- [x] D.8.4 JWT strategy nao verifica se o usuario ainda esta ativo no banco (JA CORRIGIDO - valida eAtivo)

---

## GRUPO E — INCOERENCIAS BAIXAS (Mas devem ser resolvidas)

### E.1 UX/UI
- [ ] E.1.1 Confirmacao de delete usa `confirm()` nativo do browser em vez de Dialog
- [ ] E.1.2 Data em formato string (dd/MM/yyyy) sem padronizacao — alguns usam `format()`, outros usam `toLocaleDateString()`
- [ ] E.1.3 Pagina de login nao mostra nome/logo da empresa
- [ ] E.1.4 Botoes de exportacao (Excel/CSV/PDF) nao mostram feedback de loading
- [ ] E.1.5 Tabelas nao tem paginacao no servidor — carregam todos os dados de uma vez

### E.2 PWA
- [ ] E.2.1 PWA TenantProvider faz cache da brand em localStorage mas nunca le de volta no startup
- [ ] E.2.2 PWA `publicApi` usa `axios` em vez da instancia `api` configurada — pode causar CORS em dev
- [ ] E.2.3 PWA nao tem campo de "data pretendida" como date picker — so texto
- [ ] E.2.4 PWA Service Worker nao atualiza tema ao detectar mudanca

### E.3 Site Publico
- [ ] E.3.1 Calendario so bloqueia domingos (`d.getDay() === 0`) — deveria usar `configAgenda.diasFuncionamento`
- [ ] E.3.2 Calendario compara datas com `toDateString()` que e locale-dependent
- [ ] E.3.3 Upload de imagens no formulario nao tem preview funcional

### E.4 Backend
- [x] E.4.1 `aprovadoPor` no schema Prisma tem `@map("aprovadoPor")` que e redundante (mesmo nome)
- [x] E.4.2 Ajudante.updatedAt nao existe — impossivel saber quando foi atualizado (JA EXISTE - @updatedAt)
- [ ] E.4.3 Nao ha soft delete em nenhum modelo — deletes sao permanentes
- [x] E.4.4 `concluir` nao atualiza `horasTrabalhadasMes` do motorista (JA CORRIGIDO - atualiza horas)
- [x] E.4.5 `concluir` nao decrementa `capacidadeOcupada` do slot (JA CORRIGIDO - liberaSlot)

---

## RESUMO DE PROGRESSO

| Grupo | Total | Criticos | Altos | Medios | Baixos | Feitos |
|---|---|---|---|---|---|---|
| A. Bugs do Utilizador | 33 | 20 | 10 | 3 | 0 | 0 |
| B. Incoerencias Criticas | 20 | 20 | 0 | 0 | 0 | 0 |
| C. Incoerencias Altas | 18 | 0 | 18 | 0 | 0 | 0 |
| D. Incoerencias Medias | 16 | 0 | 0 | 16 | 0 | 0 |
| E. Incoerencias Baixas | 12 | 0 | 0 | 0 | 12 | 0 |
| **TOTAL** | **99** | **40** | **28** | **19** | **12** | **0** |

---

## PRIORIDADE DE RESOLUCAO RECOMENDADA

### Fase 1 — Fundacao (Resolver PRIMEIRO, senao nada funciona)
1. B.2 — Modelo de dados: adicionar campos faltantes no Prisma (valorHora motorista/ajudante, permissoes, etc.)
2. B.1 — Calculo financeiro: corrigir formula de receita, custos e margem
3. A.9 — Precos por equipa: veiculo base + acrescimo ajudantes
4. A.10 — Salvar valor hora motorista/ajudante na data da mudanca

### Fase 2 — Tema e UX (Resolver SEGUNDO, senao app parece quebrada)
5. A.1 + C.1 — Dark/Light mode funcional end-to-end
6. A.2 — Menu lateral com scroll e safe area
7. A.12 + A.13 — Bugs de configuracoes e cores
8. A.3 + C.4 + C.5 — Dashboard e Agenda com dados corretos

### Fase 3 — Fluxos operacionais (Resolver TERCEIRO)
9. B.3 — Site publico: formulario funcional (tenantId, veiculos, datas, equipa)
10. B.4 — PWA: bugs criticos (hooks, API, types)
11. A.4 — Cliente: botao de criar manualmente
12. A.7 + A.8 — Ajudante e Motorista: campos de valor hora e performance
13. A.11 — Gerente: restricao de motoristas

### Fase 4 — Qualidade e completude
14. B.5 — Tipos consistentes entre pacotes
15. C.2 + C.3 + C.6 + C.7 — Correcoes de logica
16. D.* — Incoerencias medias
17. E.* — Incoerencias baixas

---

## NOTAS

- **Nome da app:** Movefy — deve refletir em todo o sistema (titulo browser, PWA, emails, sidebar)
- **Dark mode:** A mudanca NAO e so trocar cores — e trocar a FONTE de cores. Hoje os componentes usam classes Tailwind hardcoded (`bg-sand`, `text-brown`). Precisam usar as CSS vars (`bg-background`, `text-foreground`) que mudam automaticamente com o tema
- **Financeiro:** O calculo atual e FUNDAMENTALMENTE ERRADO. Receita = horas x precoHora do veiculo. Mas deveria ser: Receita = horas x (precoBase veiculo + acrescimo por ajudantes) + materiais + acrescimo urgencia. Custos = combustivel + alimentacao + pagamento motorista + pagamento ajudantes. Margem = Receita - Custos
- **Gerente restrito:** Todo o sistema precisa de um middleware/guard que filtre dados por motoristas permitidos. Hoje nao existe
- **Cliente merge bug:** O merge de clientes tem bug catastrofico que pode atribuir TODAS as mudancas do tenant ao cliente errado
- **Tipo data:** Campos de data como String impedem queries nativas do Prisma e causam bugs de comparacao (timezone, formato)

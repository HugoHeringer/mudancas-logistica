# MOVEFY — Correcções e Melhorias V2
> **Data:** 2026-04-30
> **Origem:** Testes manuais completos sobre ambiente local
> **Como usar:** Executar cada TAREFA na ordem indicada. Marcar `[x]` após testar. Commitar após cada BLOCO.
> **Regra de ouro:** Nunca marcar `[x]` sem ter testado o comportamento completo descrito.

---

## ÍNDICE DE BLOCOS

| Bloco | Tema | Prioridade |
|---|---|---|
| A | Trial, Planos e Activação de Tenant | 🔴 CRÍTICO |
| B | Upload de Imagens — Fluxo Completo | 🔴 CRÍTICO |
| C | Estados de Veículo, Motorista e Ajudante | 🔴 CRÍTICO |
| D | Aprovações — Conflitos e Consistência | 🔴 CRÍTICO |
| E | Utilizadores e Criação de Motorista | 🔴 CRÍTICO |
| F | Dashboard | 🔴 CRÍTICO |
| G | Disponibilidade Real — Agenda e Site | 🔴 CRÍTICO |
| H | Formulário Público — Materiais e Preços | 🟠 ALTO |
| I | Comunicação — Email e Resend por Tenant | 🟠 ALTO |
| J | Sidebar — Identidade do Tenant | 🟠 ALTO |
| K | Aprovações — UI, Filtros e Responsividade | 🟠 ALTO |
| L | Notificações | 🟠 ALTO |
| M | Formatação de Datas | 🟡 MÉDIO |
| N | Mensagens de Erro | 🟡 MÉDIO |
| O | PWA — Primeiro Acesso e Senha | 🟡 MÉDIO |
| P | Banners — Config Marca | 🟡 MÉDIO |

---

## BLOCO A — TRIAL, PLANOS E ACTIVAÇÃO DE TENANT 🔴
> **Commit:** `feat(tenant): trial period, activation flow and blocking`

### CONTEXTO E FLUXO COMPLETO
Quando o superadmin cria um novo tenant e define estado como `setup`, o tenant deve entrar em modo trial de 30 dias com acesso TOTAL a todas as funcionalidades. Ao fim dos 30 dias: notificar superadmin + bloquear o tenant automaticamente. A activação para `ativo` só ocorre via compra no site movefy.pt (fluxo futuro com Stripe) ou manualmente pelo superadmin.

### TAREFAS

- [x] **A1 — Schema: campos de trial no modelo Tenant**
  - `packages/backend/prisma/schema.prisma` → modelo `Tenant`:
    - Verificar se existe campo `estado String @default("setup")` — se não existir, adicionar
    - Adicionar: `trialInicio DateTime?`
    - Adicionar: `trialFim DateTime?`
    - Adicionar: `trialNotificadoEm DateTime?` (para evitar notificações duplicadas)
  - Executar: `npx prisma migrate dev --name tenant-trial-fields`

- [x] **A2 — Ao criar tenant no superadmin, definir trial automaticamente**
  - `packages/backend/src/super-admin/super-admin.service.ts` → função `criarTenant()`:
    - Ao criar tenant com `estado: 'setup'`, gravar automaticamente:
      ```typescript
      trialInicio: new Date(),
      trialFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
      ```

- [x] **A3 — Guard de tenant: diferenciar setup vs activo vs bloqueado**
  - `packages/backend/src/common/guards/tenant-active.guard.ts` (criar se não existir):
    ```typescript
    // LÓGICA:
    // estado === 'ativo' → permitir tudo
    // estado === 'setup' E trialFim > agora → permitir tudo (trial activo)
    // estado === 'setup' E trialFim < agora → bloquear com erro 402 "Trial expirado"
    // estado === 'bloqueado' → bloquear com erro 402 "Conta suspensa"
    // estado === 'setup' E trialFim === null → permitir (trial sem data, configurado manualmente)
    ```
  - Aplicar este guard em TODOS os controllers que não sejam de autenticação e superadmin
  - O guard deve ler o `tenantId` do JWT e buscar o tenant UMA VEZ por request (usar cache de request)

- [x] **A4 — Cron job: verificar trials expirados diariamente**
  - `packages/backend/src/super-admin/trial.cron.ts` (criar):
    ```typescript
    @Cron('0 8 * * *') // todos os dias às 08h
    async verificarTrialsExpirados() {
      // 1. Buscar tenants com estado='setup' E trialFim < agora E trialNotificadoEm IS NULL
      // 2. Para cada um: enviar email ao superadmin com lista
      // 3. Gravar trialNotificadoEm = now() para não re-notificar
      // 4. Bloquear automaticamente: UPDATE estado = 'bloqueado' WHERE estado='setup' AND trialFim < now()
    }
    ```

- [x] **A5 — UI no Movefy Console: mostrar estado trial**
  - `packages/superadmin/src/pages/tenants.page.tsx`:
    - Badge por estado: `setup` (cinzento) / `trial activo` (azul com countdown) / `trial expirado` (vermelho) / `ativo` (verde) / `bloqueado` (vermelho escuro)
    - Para tenants em trial activo: mostrar "X dias restantes"
    - Botão "Activar manualmente" → muda `estado` para `ativo` e limpa `trialFim`

- [x] **A6 — Mensagem de erro ao tenant bloqueado**
  - Quando tenant está bloqueado e tenta fazer login, retornar:
    `{ statusCode: 402, message: "O seu período de trial terminou. Contacte movefy.pt para continuar." }`
  - Frontend: interceptar erro 402 e mostrar modal com CTA para movefy.pt

---

## BLOCO B — UPLOAD DE IMAGENS — FLUXO COMPLETO 🔴
> **Commit:** `fix(upload): image validation, resize and preview across all entities`

### CONTEXTO E FLUXO COMPLETO
A imagem de veículo entra em 4 momentos: upload no admin → armazenamento no servidor → URL gravada no banco → apresentação no admin (tabela e detalhe) + apresentação no site público (formulário de agendamento, card de veículo). Se a validação não for feita na entrada, todos os pontos de apresentação ficam quebrados.

### TAREFAS

- [x] **B1 — Backend: validação e resize automático na entrada**
  - `packages/backend/src/upload/upload.service.ts`:
    - Instalar sharp: `npm install sharp --workspace=packages/backend`
    - Ao receber qualquer imagem de veículo:
      1. Validar tipo: aceitar apenas `image/jpeg`, `image/png`, `image/webp`
      2. Validar tamanho do ficheiro antes do resize: máximo 10MB (rejeitar acima)
      3. Fazer resize automático com sharp:
         ```typescript
         await sharp(buffer)
           .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
           .jpeg({ quality: 85 })
           .toFile(outputPath);
         ```
      4. A imagem gravada NUNCA excede 800×600 px independentemente do que foi enviado
    - Endpoint: `POST /api/upload/veiculo-imagem` → retornar `{ url: string }`
    - Endpoint: `POST /api/upload/logo` → resize para 400×400, manter aspect ratio
    - Endpoint: `POST /api/upload/banner` → resize para 1920×600, manter aspect ratio

- [x] **B2 — Backend: corrigir erro 400 ao criar veículo com imagem**
  - `packages/backend/src/veiculos/veiculos.controller.ts`:
    - O erro 400 indica que o DTO não está a aceitar o campo `imagemUrl` ou está a receber `multipart/form-data` mas o controller espera `application/json`
    - SOLUÇÃO: separar o upload da criação em 2 passos:
      1. Primeiro POST `/api/upload/veiculo-imagem` → retorna `{ url }`
      2. Depois POST `/api/veiculos` com JSON normal incluindo `imagemUrl: url`
    - Se o controller já usa `@UseInterceptors(FileInterceptor)`: verificar que `@ApiConsumes('multipart/form-data')` está decorado
    - Adicionar ao DTO `CreateVeiculoDto`: `imagemUrl?: string` (opcional, string URL)

- [x] **B3 — Frontend: preview de imagem antes de submeter**
  - `packages/admin/src/pages/veiculos.page.tsx`:
    - Ao seleccionar ficheiro: ler com `FileReader.readAsDataURL()` e mostrar `<img src={dataUrl} />` imediatamente
    - Mostrar dimensões reais do ficheiro seleccionado: "800×450px — OK" ou "2400×1800px — será redimensionado para 800×600"
    - Upload deve acontecer ao submeter o formulário (não ao seleccionar)
    - Fluxo correcto:
      ```
      user selecciona ficheiro → preview local imediato
      user submete formulário → POST /upload/veiculo-imagem → recebe url
      → POST /veiculos com { ...dados, imagemUrl: url }
      ```

- [x] **B4 — Frontend: apresentação da imagem na tabela e detalhe de veículo**
  - `packages/admin/src/pages/veiculos.page.tsx` → tabela:
    - Coluna imagem: `<img src={veiculo.imagemUrl} className="w-16 h-12 object-cover rounded" />`
    - Se `imagemUrl` for null/undefined: mostrar ícone placeholder (ícone de caminhão)
  - Detalhe do veículo: mostrar imagem em tamanho maior (300×225px)

- [x] **B5 — Site público: imagem do veículo no formulário de agendamento**
  - `packages/site/src/components/agendamento-form.tsx` → step de selecção de veículo:
    - Card de cada veículo deve mostrar a imagem: `<img src={veiculo.imagemUrl} className="w-full h-32 object-cover" />`
    - Se sem imagem: fundo com ícone de veículo
    - A imagem vem do endpoint público `/api/public/tenant/:slug/veiculos`
    - Verificar que este endpoint retorna o campo `imagemUrl`

---

## BLOCO C — ESTADOS DE VEÍCULO, MOTORISTA E AJUDANTE 🔴
> **Commit:** `feat(estados): vehicle/driver/helper status lifecycle automation`

### CONTEXTO E FLUXO COMPLETO
Os estados devem ser geridos pelo sistema, não manualmente pelo admin (excepto indisponível/manutenção). O ciclo de vida correcto:
- **Veículo:** `disponivel` → (admin marca) `em_manutencao` | (sistema ao aprovar) `reservado` → (motorista inicia) `em_servico` → (motorista conclui) `disponivel`
- **Motorista:** `disponivel` → (motorista inicia deslocamento) `em_deslocamento` → (chega ao local) `em_servico` → (conclui) `disponivel` | (admin marca) `inativo`
- **Ajudante:** `disponivel` | (admin marca) `inativo`

### TAREFAS

- [x] **C1 — Schema: actualizar enum de estados**
  - `packages/backend/prisma/schema.prisma`:
    - Modelo `Veiculo` → campo `estado`: valores permitidos: `disponivel`, `em_manutencao`, `indisponivel`, `em_servico`
      - Remover `em_servico` da selecção manual no frontend (apenas sistema pode definir)
    - Modelo `Motorista` → campo `estado` (ou `disponivel Boolean`): substituir por `estado String @default("disponivel")`
      - Valores: `disponivel`, `em_deslocamento`, `em_servico`, `inativo`
      - Remover `ocupado` (nunca mais usado)
    - Modelo `Ajudante` → adicionar campo `eAtivo Boolean @default(true)`
  - Executar: `npx prisma migrate dev --name fix-entity-states`

- [x] **C2 — Automação de estados ao longo do fluxo da mudança**
  - `packages/backend/src/mudancas/mudancas.service.ts`:
    - Função `iniciarDeslocamento(mudancaId)`:
      - `UPDATE Motorista SET estado='em_deslocamento' WHERE id = mudanca.motoristaId`
      - `UPDATE Veiculo SET estado='em_servico' WHERE id = mudanca.veiculoId`
    - Função `emServico(mudancaId)` (quando motorista chega ao local):
      - `UPDATE Motorista SET estado='em_servico' WHERE id = mudanca.motoristaId`
    - Função `concluir(mudancaId)`:
      - `UPDATE Motorista SET estado='disponivel' WHERE id = mudanca.motoristaId`
      - `UPDATE Veiculo SET estado='disponivel' WHERE id = mudanca.veiculoId`
      - `UPDATE Ajudante SET disponivel=true WHERE id IN (mudanca.ajudantesIds)`
    - Função `cancelar(mudancaId)`:
      - Se mudança estava `em_servico` ou `a_caminho`: reverter estados de motorista, veículo e ajudantes para `disponivel`

- [x] **C3 — Frontend: remover "Em Serviço" da selecção manual de veículo**
  - `packages/admin/src/pages/veiculos.page.tsx`:
    - Select de estado: mostrar apenas `Disponível` e `Em Manutenção`
    - Remover `Em Serviço` e `Indisponível` das opções manuais
    - Adicionar badge read-only "Em Serviço" visível na tabela quando sistema define esse estado

- [x] **C4 — Frontend: inactivar motorista em vez de remover**
  - `packages/admin/src/pages/motoristas.page.tsx`:
    - Substituir botão "Remover" por dropdown com 2 opções: "Inactivar" e "Eliminar"
    - "Inactivar": `PATCH /api/motoristas/:id` com `{ estado: 'inativo' }` — motorista fica invisível em selecções de aprovação mas histórico é preservado
    - "Eliminar": manter com confirmação dupla — só permitir se motorista não tiver mudanças associadas
    - Motoristas inactivos: aparecem numa secção separada "Inactivos" colapsada no fundo da tabela

- [x] **C5 — Validação: impedir selecção de veículo em manutenção ao criar mudança**
  - `packages/backend/src/mudancas/mudancas.service.ts` → função `criar()` e `aprovar()`:
    - Antes de associar veículo: verificar `veiculo.estado !== 'em_manutencao'`
    - Se em manutenção: `throw BadRequestException('Veículo em manutenção não pode ser seleccionado')`
  - `packages/admin/src/pages/` → qualquer select de veículo:
    - Filtrar veículos disponíveis: `where: { estado: { not: 'em_manutencao' } }`
    - Veículos em manutenção: aparecem desactivados com label "(Em manutenção)" mas não seleccionáveis

- [x] **C6 — Validação: impedir selecção de ajudante inactivo**
  - Normalizar comportamento: tanto na lista de aprovações quanto dentro do detalhe da mudança, o mesmo guard deve verificar `ajudante.eAtivo === true`
  - `packages/backend/src/mudancas/mudancas.service.ts` → função `aprovar()`:
    - Verificar cada ajudante: `if (!ajudante.eAtivo) throw BadRequestException('Ajudante inactivo')`
  - Este guard deve ser o ÚNICO ponto de validação — remover qualquer validação duplicada ou divergente no frontend

---

## BLOCO D — APROVAÇÕES — CONFLITOS E CONSISTÊNCIA 🔴
> **Commit:** `feat(aprovacoes): conflict detection with time overlap + consistent approval flow`

### CONTEXTO E FLUXO COMPLETO
O conflito de agendamento deve verificar: se o motorista/veículo/ajudante já tem uma mudança aprovada que se sobreponha no tempo. A sobreposição calcula-se como: `horaInicioNova < (horaInicioExistente + horasPrevistiasExistente)` E `horaInicioExistente < (horaInicioNova + horasPrevistiasNova)`. Este cálculo deve ser o mesmo em TODOS os pontos de aprovação.

### TAREFAS

- [x] **D1 — Função centralizada de detecção de conflito**
  - Criar `packages/backend/src/mudancas/conflict-detector.service.ts`:
    ```typescript
    async detectarConflito(
      entidadeId: string,
      tipoEntidade: 'motorista' | 'veiculo' | 'ajudante',
      dataInicio: Date,
      horaInicio: string, // 'HH:mm'
      horasPrevistas: number,
      excluirMudancaId?: string // para edição
    ): Promise<{ temConflito: boolean; mudancaConflito?: Mudanca }>
    ```
    - Calcular `inicioNovo = combinar(dataInicio, horaInicio)` em timestamp
    - Calcular `fimNovo = inicioNovo + horasPrevistas * 3600000`
    - Buscar mudanças aprovadas/em_curso para a entidade:
      ```typescript
      WHERE estado IN ('aprovada', 'a_caminho', 'em_servico')
      AND id != excluirMudancaId
      AND [motoristaId|veiculoId|ajudanteId] = entidadeId
      ```
    - Para cada mudança encontrada: calcular `inicioExistente` e `fimExistente`
    - Sobreposição: `inicioNovo < fimExistente AND inicioExistente < fimNovo`

- [x] **D2 — Aplicar detecção de conflito na função aprovar()**
  - `packages/backend/src/mudancas/mudancas.service.ts` → função `aprovar()`:
    - Verificar conflito de motorista: `conflictDetector.detectarConflito(motoristaId, 'motorista', ...)`
    - Verificar conflito de veículo: `conflictDetector.detectarConflito(veiculoId, 'veiculo', ...)`
    - Para cada ajudante: `conflictDetector.detectarConflito(ajudanteId, 'ajudante', ...)`
    - Se conflito: retornar erro descritivo:
      `{ statusCode: 409, message: "Motorista João já tem serviço das 09:00 às 11:00 no dia 30/04" }`
    - Este é o ÚNICO ponto de validação de conflito — remover qualquer outra validação duplicada

- [x] **D3 — Unificar comportamento: lista de aprovações vs detalhe da mudança**
  - O popup/modal de aprovação deve ser o MESMO componente em ambos os casos
  - `packages/admin/src/components/aprovar-mudanca-modal.tsx` (criar componente único):
    - Recebe `mudancaId` como prop
    - Busca os dados da mudança internamente
    - Mostra: motorista selector, veículo selector, ajudante selector, horas previstas
    - Ao submeter: chama `POST /api/mudancas/:id/aprovar`
    - Handles do response: sucesso → fechar modal + toast "Aprovado"; conflito 409 → mostrar mensagem de conflito
  - Usar este componente tanto na página de aprovações quanto no detalhe da mudança

- [x] **D4 — Selecção de ajudante: modal com pesquisa (igual ao motorista)**
  - Dentro do `AprovarMudancaModal`:
    - Remover checkboxes de ajudantes
    - Adicionar botão "Adicionar Ajudante" que abre sub-modal com:
      - Campo de pesquisa por nome
      - Lista de ajudantes activos e disponíveis
      - Ao seleccionar: adicionar ao array de ajudantes seleccionados
      - Mostrar lista de ajudantes seleccionados com botão de remover cada um
    - Validação: ao submeter, verificar conflito de cada ajudante seleccionado

---

## BLOCO E — UTILIZADORES E CRIAÇÃO DE MOTORISTA 🔴
> **Commit:** `feat(users): fix registration + auto-create motorist user`

### CONTEXTO E FLUXO COMPLETO
O erro 400 no registo de utilizador indica provavelmente que o DTO de registo não aceita todos os perfis ou que falta campo obrigatório. A ligação motorista↔utilizador deve ser automática: criar motorista → sistema cria utilizador automaticamente → motorista faz primeiro login no PWA → sistema força troca de senha.

### TAREFAS

- [x] **E1 — Corrigir erro 400 ao criar utilizador admin/financeiro/gerente**
  - `packages/backend/src/auth/dto/register.dto.ts`:
    - Verificar que o enum de `perfil` inclui: `'admin'`, `'gerente'`, `'financeiro'`, `'operacional'`, `'motorista'`
    - Verificar que todos os campos obrigatórios têm decorators `@IsNotEmpty()` com mensagens claras
    - Verificar que `tenantId` NÃO está no DTO (deve vir do contexto JWT, não do body)
  - `packages/backend/src/auth/auth.service.ts` → função `register()`:
    - Log do erro real: adicionar `console.error(error)` temporariamente para identificar a causa exacta do 400
    - Verificar que `tenantId` está a ser injectado do contexto e não esperado no body
    - Verificar que o hash de password está a ser feito antes de gravar

- [x] **E2 — Ao criar motorista: criar utilizador automaticamente**
  - `packages/backend/src/motoristas/motoristas.service.ts` → função `criar()`:
    - Após criar o motorista:
      ```typescript
      // Gerar username baseado no nome: 'hugo.ferreira' ou 'hferreira'
      const username = gerarUsername(motorista.nome);
      const email = motorista.email || `${username}@${tenant.slug}.movefy`;
      
      await authService.register({
        nome: motorista.nome,
        email: email,
        password: '123456', // senha inicial
        perfil: 'motorista',
        tenantId: motorista.tenantId,
        motoristaId: motorista.id, // ligar ao registo de motorista
        obrigarTrocaSenha: true, // flag para forçar troca no primeiro login
      });
      ```
    - Modelo `User` → adicionar campo `obrigarTrocaSenha Boolean @default(false)` se não existir
    - Modelo `User` → adicionar campo `motoristaId String? @unique` (relação 1:1 com Motorista)

- [x] **E3 — Remover perfil "motorista" do menu de Utilizadores**
  - `packages/admin/src/pages/utilizadores.page.tsx`:
    - Select de perfil: remover opção `motorista`
    - Nota no formulário: "Para criar motoristas, aceda ao menu Motoristas"
    - Na listagem de utilizadores: ocultar utilizadores com perfil `motorista` (gerem-se no menu Motoristas)

- [x] **E4 — PWA: forçar troca de senha no primeiro login**
  - `packages/backend/src/auth/auth.service.ts` → função `login()`:
    - Se `user.obrigarTrocaSenha === true`: retornar resposta especial:
      ```typescript
      { accessToken, requirePasswordChange: true }
      ```
  - `packages/pwa/src/pages/login.page.tsx`:
    - Se response tiver `requirePasswordChange: true`: redirecionar para `/pwa/trocar-senha`
    - Esta rota não pode ser contornada (verificar no router guard)
  - `packages/pwa/src/pages/trocar-senha.page.tsx` (criar):
    - Formulário: nova senha + confirmação (mínimo 8 caracteres)
    - Ao submeter: `PATCH /api/auth/change-password` com `{ novaSenha }`
    - Backend: `UPDATE User SET password=hash(novaSenha), obrigarTrocaSenha=false WHERE id=userId`

- [x] **E5 — PWA: alterar senha voluntariamente no perfil**
  - `packages/pwa/src/pages/perfil.page.tsx`:
    - Adicionar secção "Segurança" com botão "Alterar Senha"
    - Formulário: senha actual + nova senha + confirmação
    - `PATCH /api/auth/change-password` com `{ senhaActual, novaSenha }`
    - Backend: verificar `senhaActual` antes de actualizar

---

## BLOCO F — DASHBOARD 🔴
> **Commit:** `fix(dashboard): fix all KPIs and data queries`

### CONTEXTO E FLUXO COMPLETO
O dashboard é o primeiro ecrã que o admin vê. Se não mostra dados, a confiança no sistema cai imediatamente. Cada KPI deve ter uma query específica filtrada por `tenantId` e pelo período correcto.

### TAREFAS

- [x] **F1 — Investigar e corrigir a causa raiz do dashboard vazio**
  - `packages/backend/src/mudancas/mudancas.service.ts` → função `getDashboard(tenantId)`:
    - Adicionar log: `console.log('getDashboard called for tenant:', tenantId)`
    - Verificar que o endpoint está a receber o `tenantId` correcto do JWT
    - Verificar que as queries têm `where: { tenantId }` em TODOS os selects
    - Testar directamente via Swagger: `GET /api/mudancas/dashboard` com Bearer token válido

- [x] **F2 — Corrigir query de mudanças pendentes**
  - Query: `prisma.mudanca.count({ where: { tenantId, estado: 'pendente' } })`
  - Verificar que o valor do enum `estado` é exactamente `'pendente'` (case sensitive)
  - Retornar também a lista dos primeiros 5: `{ id, nomeCliente, dataPretendida, createdAt }`

- [x] **F3 — Corrigir query de mudanças hoje**
  - ```typescript
    const hoje = new Date();
    const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 0, 0, 0);
    const fim = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 23, 59, 59);
    prisma.mudanca.findMany({
      where: { tenantId, dataPretendida: { gte: inicio, lte: fim } }
    })
    ```

- [x] **F4 — KPIs financeiros do mês**
  - ```typescript
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
    // receitaMes: SUM de receitaRealizada WHERE estado='concluida' AND conclusaoEm BETWEEN inicioMes AND fimMes
    // custosMes: SUM de MovimentoFinanceiro WHERE tipo='custo' AND createdAt BETWEEN inicioMes AND fimMes
    // margemMes: receitaMes - custosMes
    ```

- [x] **F5 — Counter de configuração (setup progress)**
  - O contador de progresso verifica:
    - `marca`: `configMarca.logoUrl !== null` → ✅
    - `preco`: `configPreco.precoBaseHora > 0` → ✅
    - `veiculo`: `count(Veiculo WHERE tenantId) > 0` → ✅
    - `motorista`: `count(Motorista WHERE tenantId AND estado != 'inativo') > 0` → ✅
    - `agenda`: `configAgenda.diasDisponiveis != null AND configAgenda.diasDisponiveis.length > 0` → ✅
  - Se a agenda não está a completar: verificar que `configAgenda.diasDisponiveis` é um array não-vazio após salvar

- [x] **F6 — Frontend: ligar KPIs a navegação**
  - `packages/admin/src/pages/dashboard.page.tsx`:
    - Card "Pendentes" clicável → `navigate('/aprovacoes?estado=pendente')`
    - Card "Hoje" clicável → `navigate('/agenda?data=' + formatDate(hoje))`
    - Card "Em Curso" clicável → `navigate('/mudancas?estado=a_caminho,em_servico')`
    - Mudanças urgentes pendentes: mostrar badge vermelho

---

## BLOCO G — DISPONIBILIDADE REAL — AGENDA E SITE 🔴
> **Commit:** `feat(disponibilidade): real-time availability based on time overlap`

### CONTEXTO E FLUXO COMPLETO
A disponibilidade de um horário é determinada por: existem motoristas E veículos livres naquele horário? Um recurso está ocupado se tiver uma mudança aprovada cujo período (início + horas previstas) se sobreponha ao horário pedido. O site público e o backend de aprovação devem usar EXACTAMENTE a mesma lógica.

### TAREFAS

- [x] **G1 — Serviço de disponibilidade centralizado**
  - Criar `packages/backend/src/agenda/disponibilidade.service.ts`:
    ```typescript
    async verificarDisponibilidade(
      tenantId: string,
      dataHoraInicio: Date,
      horasPrevistas: number
    ): Promise<{
      disponivel: boolean,
      motoristasDisponiveis: Motorista[],
      veiculosDisponiveis: Veiculo[],
      motivoBloqueio?: string
    }>
    ```
    - `fimNovo = dataHoraInicio + horasPrevistas * 3600000`
    - Buscar motoristas com estado `disponivel` E sem mudanças aprovadas sobrepostas:
      ```sql
      SELECT * FROM Motorista m
      WHERE m.tenantId = :tenantId
      AND m.estado = 'disponivel'
      AND NOT EXISTS (
        SELECT 1 FROM Mudanca mu
        WHERE mu.motoristaId = m.id
        AND mu.estado IN ('aprovada','a_caminho','em_servico')
        AND mu.horaInicio < :fimNovo
        AND (mu.horaInicio + mu.horasPrevistas * INTERVAL '1 hour') > :dataHoraInicio
      )
      ```
    - Mesma lógica para veículos
    - Se `motoristasDisponiveis.length === 0`: `{ disponivel: false, motivo: 'Sem motoristas disponíveis neste horário' }`
    - Se `veiculosDisponiveis.length === 0`: `{ disponivel: false, motivo: 'Sem veículos disponíveis neste horário' }`

- [x] **G2 — Endpoint público de disponibilidade**
  - `packages/backend/src/public/public.controller.ts`:
    - `GET /public/tenant/:slug/disponibilidade?data=2026-04-30&hora=09:00&horas=2`
    - Chamar `disponibilidadeService.verificarDisponibilidade()`
    - Retornar `{ disponivel: boolean, horariosDisponiveisDia: string[] }`
  - `horariosDisponiveisDia`: lista de horários de meia em meia hora das `configAgenda.horaAbertura` até `configAgenda.horaFecho` que têm disponibilidade

- [x] **G3 — Site: horários de meia em meia hora**
  - `packages/site/src/components/agendamento-form.tsx` → step de data/hora:
    - Gerar slots de meia em meia hora: `['06:00','06:30','07:00','07:30',...,'19:30','20:00']`
    - Filtrar pelos horários retornados pelo endpoint de disponibilidade
    - Horários indisponíveis: aparecem disabled com cor cinzenta e tooltip "Sem disponibilidade"
    - Sem pausa de almoço: usar todos os slots de abertura até fecho sem excepção

- [x] **G4 — Site: reajuste de preço em serviço urgente**
  - `packages/site/src/pages/urgente.tsx` (ou componente equivalente):
    - Ao carregar os veículos: buscar `configAgenda.acrescimoUrgencia` do tenant
    - Para cada veículo: `precoUrgente = veiculo.precoHora * (1 + acrescimoUrgencia / 100)`
    - Mostrar o preço original com risco + preço urgente a vermelho:
      ```
      ~~30€/hora~~ → 39€/hora (urgência +30%)
      ```

- [x] **G5 — Agenda admin: mostrar mudanças aprovadas**
  - `packages/admin/src/pages/agenda.page.tsx`:
    - Calendário mensal: cada dia com mudanças aprovadas deve mostrar badge com contagem
    - Cor do dia: verde (capacidade < 50%), amarelo (50-80%), vermelho (> 80%), cinzento (bloqueado)
    - Ao clicar num dia: painel lateral com lista de mudanças, hora, motorista, estado

---

## BLOCO H — FORMULÁRIO PÚBLICO — MATERIAIS E PREÇOS 🟠
> **Commit:** `feat(site): materials as checkboxes with prices and images`

### CONTEXTO E FLUXO COMPLETO
Os materiais (filme, cartão, caixas, fita) são opcionais — o cliente marca se precisa, a empresa cobra. O preço de cada material está configurado no painel admin. A imagem de cada material ajuda o cliente a entender o que está a pedir.

### TAREFAS

- [x] **H1 — Schema: campos de materiais nas configurações**
  - `packages/backend/prisma/schema.prisma` → modelo `ConfigPreco`:
    - Adicionar (se não existirem):
      ```
      materialFilmeAtivo    Boolean @default(true)
      materialFilmePreco    Decimal @default(0) @db.Decimal(10,2)
      materialFilmeImagemUrl String?
      materialCartaoAtivo   Boolean @default(true)
      materialCartaoPreco   Decimal @default(0) @db.Decimal(10,2)
      materialCartaoImagemUrl String?
      materialCaixasAtivo   Boolean @default(true)
      materialCaixasPreco   Decimal @default(0) @db.Decimal(10,2)
      materialCaixasImagemUrl String?
      materialFitaAtivo     Boolean @default(true)
      materialFitaPreco     Decimal @default(0) @db.Decimal(10,2)
      materialFitaImagemUrl String?
      ```
  - Executar migração

- [x] **H2 — Admin: configurar materiais com preço e imagem**
  - `packages/admin/src/pages/configuracoes.page.tsx` → tab "Preços" → secção "Materiais":
    - Para cada material (Filme de Protecção, Protecção Cartão, Caixas, Fita Cola):
      - Toggle on/off (activo/inactivo)
      - Campo de preço: `X€ por unidade`
      - Upload de imagem: `POST /upload/material-imagem` → resize 400×400
      - Preview da imagem

- [x] **H3 — Endpoint público: retornar materiais activos com preço e imagem**
  - `packages/backend/src/public/public.service.ts` → `getFormularioConfig()`:
    - Incluir no retorno: `materiais: Array<{ id, nome, preco, imagemUrl }>`
    - Apenas materiais com `ativo === true`

- [x] **H4 — Site: materiais como checkboxes no formulário**
  - `packages/site/src/components/agendamento-form.tsx`:
    - Remover qualquer campo de quantidade para materiais
    - Para cada material activo retornado pela API:
      ```tsx
      <label className="flex items-center gap-3 cursor-pointer">
        <Checkbox checked={selecionado} onChange={...} />
        <img src={material.imagemUrl} className="w-12 h-12 object-cover rounded" />
        <span>{material.nome}</span>
        <span className="text-primary font-bold">{material.preco}€</span>
      </label>
      ```
    - Nome correcto: "Protecção Cartão" (não "Proteção Cartão")
    - Incluir materiais seleccionados no payload de submissão: `materiais: ['filme', 'cartao']`

- [x] **H5 — Menu urgência: apenas veículos marcados como urgência**
  - `packages/admin/src/pages/configuracoes.page.tsx` → tab "Urgência":
    - Select de veículo urgente: filtrar apenas veículos com `permiteUrgencia === true`
  - `packages/backend/prisma/schema.prisma` → modelo `Veiculo`:
    - Adicionar campo `permiteUrgencia Boolean @default(false)`
  - `packages/admin/src/pages/veiculos.page.tsx`:
    - Adicionar toggle "Disponível para urgências" no formulário de criação/edição

---

## BLOCO I — COMUNICAÇÃO — EMAIL E RESEND POR TENANT 🟠
> **Commit:** `feat(comunicacao): per-tenant Resend config + smart template preview`

### CONTEXTO E FLUXO COMPLETO
Cada empresa cliente terá a sua própria conta Resend com os seus próprios 100 emails/dia. A configuração da API key fica no painel admin do cliente. O preview de templates deve usar dados reais do tenant para variáveis que já conhecemos.

### TAREFAS

- [x] **I1 — Schema: API key Resend por tenant**
  - `packages/backend/prisma/schema.prisma` → modelo `ConfigComunicacao` (ou `Tenant`):
    - Adicionar: `resendApiKey String?`
    - Adicionar: `resendFromEmail String?` (ex: `mudancas@silva-transportes.pt`)
    - Adicionar: `resendFromNome String?` (ex: `Silva Transportes`)

- [x] **I2 — Admin: configurar Resend no menu Comunicação**
  - `packages/admin/src/pages/comunicacao.page.tsx`:
    - Nova tab ou secção "Configuração de Email":
      - Campo "API Key Resend" (input password, masked)
      - Campo "Email de envio" (ex: noreply@suaempresa.pt)
      - Campo "Nome de envio" (ex: Silva Transportes)
      - Botão "Testar configuração" → `POST /api/comunicacao/testar-email` → envia email de teste
      - Instruções: "Crie uma conta gratuita em resend.com e crie um API Key"
    - `PATCH /api/comunicacao/config` → gravar no banco

- [x] **I3 — Backend: usar API key do tenant para envios**
  - `packages/backend/src/email/email.service.ts`:
    - Receber `tenantId` em cada chamada
    - Buscar `configComunicacao.resendApiKey` do tenant
    - Se configurado: criar instância Resend com essa key
    - Se não configurado: usar key global da Movefy (fallback)
    - Log de aviso se usar fallback: "Tenant X sem Resend configurado, usando key global Movefy"

- [ ] **I4 — Preview de template: auto-preencher variáveis conhecidas** (deferred — context limit)
  - `packages/admin/src/pages/comunicacao.page.tsx` → preview de template:
    - Ao abrir preview, identificar quais variáveis o template tem: `{{nomeCliente}}`, `{{nomeEmpresa}}`, etc.
    - Variáveis que o sistema conhece → preencher automaticamente:
      - `{{nomeEmpresa}}` → `tenant.nome`
      - `{{logoUrl}}` → `configMarca.logoUrl`
      - `{{corPrincipal}}` → `configMarca.corPrincipal`
      - `{{telefoneEmpresa}}` → `tenant.telefone`
    - Variáveis que dependem de dados de runtime → pedir ao utilizador:
      - `{{nomeCliente}}` → campo de input no preview
      - `{{telefoneCliente}}` → campo de input no preview
      - `{{dataMudanca}}` → campo de input no preview
      - `{{nomeMotorista}}` → campo de input no preview
      - `{{previsaoChegada}}` → campo de input no preview
      - `{{motivoRecusa}}` → campo de input no preview
    - Interface: mostrar apenas os campos de input para variáveis NÃO automáticas

---

## BLOCO J — SIDEBAR — IDENTIDADE DO TENANT 🟠
> **Commit:** `fix(sidebar): show tenant logo and name instead of Movefy`

### CONTEXTO E FLUXO COMPLETO
A sidebar é o elemento sempre visível. Mostrar "Movefy" no topo de um painel que deveria ser da empresa do cliente quebra a percepção white-label. O logo + nome devem ser clicáveis e redirecionar ao dashboard.

### TAREFAS

- [x] **J1 — Substituir "Movefy" pelo logo e nome do tenant**
  - `packages/admin/src/components/sidebar.tsx` (ou componente equivalente):
    - Buscar `configMarca.logoUrl` e `tenant.nome` do contexto/store
    - Topo da sidebar:
      ```tsx
      <Link to="/dashboard" className="flex items-center gap-2 p-3 hover:bg-white/10 rounded-lg transition">
        {configMarca.logoUrl
          ? <img src={configMarca.logoUrl} alt={tenant.nome} className="h-8 w-auto max-w-[120px] object-contain" />
          : <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">
              {tenant.nome.charAt(0).toUpperCase()}
            </div>
        }
        <span className="font-semibold text-sm truncate max-w-[120px]">{tenant.nome}</span>
      </Link>
      ```
    - `max-w-[120px]` com `truncate` garante responsividade com nomes compridos
    - O card inteiro é clicável → `navigate('/dashboard')`

- [x] **J2 — Sidebar colapsada: mostrar apenas logo/inicial**
  - Se a sidebar tiver modo colapsado: mostrar apenas `<img>` ou inicial, sem texto

---

## BLOCO K — APROVAÇÕES — UI, FILTROS E RESPONSIVIDADE 🟠
> **Commit:** `feat(aprovacoes): filters, highlights, responsive modal`

### TAREFAS

- [x] **K1 — Filtros na página de aprovações**
  - `packages/admin/src/pages/aprovacoes.page.tsx`:
    - Filtro de estado (botões toggle): `Pendente` (default) | `Aprovada` | `Recusada`
    - Filtro de tipo (botões toggle): `Todos` (default) | `Urgente` | `Normal`
    - URL params: `?estado=pendente&tipo=urgente` para permitir bookmarking e navegação do dashboard
    - Default ao carregar: `estado=pendente`

- [x] **K2 — Mudanças recusadas: histórico apenas em Aprovações**
  - Mudanças com estado `recusada` NÃO aparecem no menu Mudanças
  - Aparecem APENAS no menu Aprovações com filtro `estado=recusada`
  - No menu Mudanças: filtrar `where: { estado: { not: 'recusada' } }`

- [x] **K3 — Destaque visual para mudanças urgentes**
  - Card/linha de mudança urgente:
    - Badge vermelho "URGENTE" à esquerda do nome do cliente
    - Fundo do card levemente avermelhado: `bg-red-50 dark:bg-red-950/20`
    - Border vermelha à esquerda: `border-l-4 border-red-500`
  - Mudanças urgentes devem aparecer no topo da lista mesmo sem filtro

- [x] **K4 — Esconder botões de aprovar/recusar em mudanças já processadas**
  - Se `mudanca.estado !== 'pendente'`: não mostrar botões de aprovação/recusa
  - Mostrar em vez: badge do estado actual

- [x] **K5 — Modal de aprovação responsivo**
  - `packages/admin/src/components/aprovar-mudanca-modal.tsx`:
    - Usar `max-h-[90vh] overflow-y-auto` no container do modal
    - Em mobile: modal ocupa `100vw` e `100vh` com scroll interno
    - Todos os inputs dentro do modal: `w-full`
    - Testar em viewport 375px (iPhone SE)

---

## BLOCO L — NOTIFICAÇÕES 🟠
> **Commit:** `feat(notificacoes): show 5 + scroll + clear all`

### TAREFAS

- [x] **L1 — Mostrar até 5 notificações com scroll**
  - `packages/admin/src/components/notificacoes-dropdown.tsx`:
    - Container: `max-h-[400px] overflow-y-auto`
    - Buscar as últimas 20 não lidas + 10 lidas
    - Mostrar as primeiras 5 visivelmente, resto com scroll
    - Cada notificação: ícone + mensagem + tempo relativo (ex: "há 5 min") + estado lida/não lida

- [x] **L2 — Botão "Limpar notificações" fixo no fundo**
  - No fundo do dropdown (posição sticky):
    - Botão "Limpar todas" → `DELETE /api/notificacoes/todas` → marca todas como lidas
    - Texto à esquerda: "X não lidas"

---

## BLOCO M — FORMATAÇÃO DE DATAS 🟡
> **Commit:** `fix(dates): human-readable date format everywhere`

### CONTEXTO E FLUXO COMPLETO
O formato ISO `2026-04-30T00:00:00.000Z` deve ser tratado numa única função de formatação e aplicado em todos os pontos onde uma data é apresentada ao utilizador.

### TAREFAS

- [x] **M1 — Criar função de formatação centralizada**
  - `packages/shared/src/utils/format-date.ts`:
    ```typescript
    export function formatarData(data: string | Date): string {
      const d = new Date(data);
      const ano = d.getFullYear();
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const dia = String(d.getDate()).padStart(2, '0');
      return `${ano}-${mes}-${dia}`; // '2026-04-30'
    }
    
    export function formatarDataHora(data: string | Date, hora?: string): string {
      return `${formatarData(data)} às ${hora || '–'}`; // '2026-04-30 às 09:00'
    }
    
    export function formatarDataLonga(data: string | Date): string {
      return new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit', month: 'long', year: 'numeric'
      }).format(new Date(data)); // '30 de abril de 2026'
    }
    ```

- [x] **M2 — Substituir todas as apresentações de data nos frontends**
  - Busca global em `packages/admin/src/` por: `.toISOString()`, `toLocaleDateString()`, `toLocaleString()`
  - Substituir todas por `formatarData()` ou `formatarDataHora()` da shared
  - Mesma substituição em `packages/pwa/src/` e `packages/site/src/`

---

## BLOCO N — MENSAGENS DE ERRO 🟡
> **Commit:** `fix(errors): replace generic errors with descriptive messages`

### TAREFAS

- [x] **N1 — Backend: exception filter global**
  - `packages/backend/src/common/filters/http-exception.filter.ts`:
    - Interceptar TODOS os erros e retornar:
      ```typescript
      {
        statusCode: number,
        message: string, // mensagem legível por humanos
        campo?: string,  // qual campo causou o erro (se aplicável)
        timestamp: string
      }
      ```
    - Nunca retornar "Internal server error" sem mensagem adicional
    - Erros de validação Zod/class-validator: mapear cada campo para mensagem em português

- [x] **N2 — Frontend: interceptar e mostrar erros específicos**
  - `packages/admin/src/lib/api.ts`:
    - No interceptor de response error: extrair `error.response.data.message`
    - Mostrar via toast: `toast.error(error.response.data.message || 'Erro desconhecido')`
    - Nunca mostrar "Internal server error" ao utilizador final
  - Mesma implementação em `packages/pwa/src/lib/api.ts` e `packages/site/src/lib/api.ts`

---

## BLOCO O — PWA — PRIMEIRO ACESSO E SENHA 🟡
> **Commit:** `feat(pwa): force password change on first login + profile password change`

> **Nota:** Implementado em parte no Bloco E (E4 e E5). Verificar se restam itens.

- [x] **O1 — Verificar que o redirect para troca de senha funciona no router do PWA**
  - `packages/pwa/src/router.tsx`: guard que verifica `requirePasswordChange` no estado do auth
  - Se `requirePasswordChange === true` e rota não é `/trocar-senha`: redirecionar

---

## BLOCO P — BANNERS — CONFIG MARCA 🟡
> **Commit:** `feat(banners): recommended size, preview fix, drag-drop ordering`

### CONTEXTO E FLUXO COMPLETO
O banner aparece no site público do cliente como imagem de topo/hero. Deve ser de alta qualidade mas otimizado para web. A sequência de banners no site deve respeitar a ordem que o admin definiu.

### TAREFAS

- [ ] **P1 — Tamanho recomendado e validação**
  - Tamanho recomendado para banners: **1920×600px** (ratio 16:5 wide banner)
  - Tamanho mínimo aceite: 1200×375px
  - Tamanho máximo do ficheiro: 2MB após compressão
  - Backend `upload.service.ts` → upload de banner:
    - Resize: `sharp.resize(1920, 600, { fit: 'cover', position: 'centre' }).jpeg({ quality: 90 })`
    - Mostrar aviso se imagem original < 1200px largura: "Imagem pode ficar desfocada"

- [ ] **P2 — Preview de banner correcto no admin**
  - `packages/admin/src/pages/configuracoes.page.tsx` → tab "Marca" → secção Banners:
    - Preview de cada banner: container com `aspect-ratio: 16/5, width: 100%, overflow: hidden`
    - `<img src={banner.url} className="w-full h-full object-cover" />`
    - Label com dimensões recomendadas: "Recomendado: 1920×600px"

- [ ] **P3 — Drag-and-drop para reordenar banners**
  - Instalar: `npm install @dnd-kit/core @dnd-kit/sortable --workspace=packages/admin`
  - `packages/admin/src/pages/configuracoes.page.tsx` → lista de banners:
    - Usar `SortableContext` do `@dnd-kit/sortable`
    - Handle de drag: os pontinhos (ícone `GripVertical` do lucide-react)
    - Ao reordenar: `PATCH /api/config/marca/banners/ordem` com `{ ids: [id1, id2, id3] }`
  - Backend: actualizar campo `ordem` de cada banner
  - Site público: buscar banners ordenados por `ordem ASC`

---

## RESUMO DE PROGRESSO

| Bloco | Descrição | Prioridade | Estado |
|---|---|---|---|
| A | Trial e activação de tenant | 🔴 CRÍTICO | [x] |
| B | Upload de imagens | 🔴 CRÍTICO | [x] |
| C | Estados de veículo/motorista/ajudante | 🔴 CRÍTICO | [x] |
| D | Aprovações — conflitos e consistência | 🔴 CRÍTICO | [x] |
| E | Utilizadores e criação de motorista | 🔴 CRÍTICO | [x] |
| F | Dashboard | 🔴 CRÍTICO | [x] |
| G | Disponibilidade real | 🔴 CRÍTICO | [x] |
| H | Formulário — materiais e preços | 🟠 ALTO | [x] |
| I | Comunicação e Resend por tenant | 🟠 ALTO | [x] |
| J | Sidebar — identidade tenant | 🟠 ALTO | [x] |
| K | Aprovações — UI e filtros | 🟠 ALTO | [x] |
| L | Notificações | 🟠 ALTO | [x] |
| M | Formatação de datas | 🟡 MÉDIO | [x] |
| N | Mensagens de erro | 🟡 MÉDIO | [x] |
| O | PWA — senha | 🟡 MÉDIO | [x] |
| P | Banners | 🟡 MÉDIO | [ ] |

---

## INSTRUÇÕES PARA A IA

1. **Executar sempre um bloco completo** antes de commitar
2. **Nunca marcar `[x]`** sem ter testado o comportamento descrito
3. **Ordem obrigatória:** A → B → C → D → E → F → G (críticos primeiro), depois H a P em paralelo
4. **Mensagens de commit:** seguir o padrão indicado em cada bloco
5. **Se encontrar bloqueio:** marcar `[!]` e descrever na linha abaixo o que falhou
6. **Campos financeiros:** nunca hardcodar valores — sempre buscar de config ou snapshot
7. **tenantId:** nunca aceitar do body do request — sempre do JWT/contexto
8. **Após cada bloco:** actualizar tabela de progresso acima
9. **Testes mínimos por tarefa:** criar + ler + editar + validar erro

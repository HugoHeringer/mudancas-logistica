# MUDANCAS & LOGISTICA — Checklist de Desenvolvimento

> **Ultima atualizacao:** 2026-04-15
> **Tema visual:** Sirocco / Desert Luxury — INSPIRACAO de layout, efeitos e composicao visual (nao de cores)
>   - O que copiamos: layouts de seccao, parallax, glassmorphism, scroll reveal, stagger animations, noise overlay, hero com overlay, galeria com hover, lightbox, contadores animados, tipografia serif+sans
>   - O que NAO copiamos: paleta de cores — cada empresa define a sua (60/30/10)
> **Regra de ouro:** Qualquer mudanca de marca (cor, logo, font) no site reflete instantaneamente no Admin, PWA e Super-Admin via TenantProvider.
> **Esquema de cores:** Regra 60/30/10 — Cada empresa escolhe 3 cores:
>   - **Cor Principal (60%)** — botoes, headers, acentos dominantes, sidebar, CTAs
>   - **Cor Secundaria (30%)** — cards, seccoes alternadas, bordas, badges
>   - **Cor de Detalhe (10%)** — alerts, badges de estado, micro-acentos, hover states
>   - **Fundo:** NAO entra na regra — segue o tema do sistema (light / dark / sistema) com cores neutras (sand/cream no light, night no dark)
>   - **Texto:** Automaticamente calculado (claro sobre fundo escuro, escuro sobre fundo claro)

---

## COMO USAR ESTE DOCUMENTO

- Marque `[x]` quando completar um item
- Marque `[~]` se estiver em andamento (parcial)
- Marque `[!]` se encontrou bloqueio — descreva o motivo na linha abaixo
- Cada item e atomico: faz uma coisa so
- Itens estao ordenados do mais critico ao mais tranquilo
- Se travar, o ultimo `[~]` ou `[!]` indica onde parou

---

## BLOCO 1 — SEGURANCA E FUNDACAO (Sem isso, nada e producao)

### 1.1 Roles Guard — Permissoes reais no backend
- [x] 1.1.1 Implementar `RolesGuard` no backend que verifica `user.perfil` contra decorator `@Roles()` nos controllers
- [x] 1.1.2 Adicionar `@Roles('admin')` nos endpoints de gestao (utilizadores, configuracoes)
- [x] 1.1.3 Adicionar `@Roles('admin', 'gerente')` nos endpoints de aprovacoes, motoristas, veiculos
- [x] 1.1.4 Adicionar `@Roles('admin', 'gerente', 'financeiro')` nos endpoints financeiro
- [x] 1.1.5 Adicionar `@Roles('motorista')` nos endpoints do PWA (`/mudancas/minhas`, `iniciar`, `emServico`, `concluir`)
- [x] 1.1.6 Proteger super-admin com decorator dedicado `@IsSuperAdmin()` + middleware de verificacao

### 1.2 Gating por role no frontend
- [x] 1.2.1 Criar hook `usePermissao()` que retorna `{ podeVer, podeEditar }` baseado no perfil do utilizador
- [x] 1.2.2 Esconder itens do sidebar conforme perfil (motorista: so agenda; financeiro: so financeiro/relatorios; gerente: tudo menos config)
- [x] 1.2.3 Desabilitar botoes de acao conforme perfil (ex: financeiro nao pode aprovar/recusar)
- [x] 1.2.4 Redirect automatico se utilizador tentar aceder rota sem permissao

### 1.3 Endpoint de listagem de utilizadores (backend)
- [x] 1.3.1 Criar `GET /users` no backend com filtro por tenantId (so admin do tenant pode listar)
- [x] 1.3.2 Criar `PATCH /users/:id/estado` para ativar/desativar utilizador
- [x] 1.3.3 Criar `PATCH /users/:id/perfil` para alterar perfil de um utilizador
- [x] 1.3.4 Criar `PATCH /users/:id` para editar nome/email

### 1.4 Pagina de utilizadores funcional (frontend)
- [x] 1.4.1 Conectar DataTable de utilizadores ao novo endpoint `GET /users`
- [x] 1.4.2 Implementar dialog de edicao de utilizador (nome, email, perfil)
- [x] 1.4.3 Implementar toggle ativo/bloqueado com confirmacao
- [x] 1.4.4 Implementar alteracao de perfil com `Select`

---

## BLOCO 2 — FLUXO OPERACIONAL COMPLETO (Sem isso, o sistema nao funciona end-to-end)

### 2.1 Ajudantes — CRUD completo
- [x] 2.1.1 Criar `AjudanteModule` no backend (controller + service + DTOs)
- [x] 2.1.2 Implementar `GET /ajudantes`, `POST /ajudantes`, `PATCH /ajudantes/:id`, `DELETE /ajudantes/:id`
- [x] 2.1.3 Adicionar filtro de disponibilidade `GET /ajudantes/disponiveis?data=`
- [x] 2.1.4 Criar pagina de ajudantes no frontend (pode ser sub-seccao de Motoristas)

### 2.2 Aprovacao — selecao de ajudantes
- [x] 2.2.1 Adicionar selector de ajudantes no dialog de aprovacao (atualmente so tem motorista)
- [x] 2.2.2 Enviar `ajudantesIds` no payload de aprovacao

### 2.3 Mudancas — transicoes de estado no painel admin
- [x] 2.3.1 Adicionar botoes de acao na pagina de detalhe da mudanca conforme estado atual:
  - `pendente`: Aprovar / Recusar
  - `aprovada`: Cancelar
  - `a_caminho`: (so visualizacao)
  - `em_servico`: (so visualizacao)
  - `concluida`: Ver ficha de conclusao
- [x] 2.3.2 Dialog de cancelamento com campo de motivo

### 2.4 Agenda — gestao interativa
- [x] 2.4.1 Implementar dialog para criar slots manualmente (data, hora, capacidade)
- [x] 2.4.2 Implementar dialog para criar bloqueio (data inicio, data fim, motivo)
- [x] 2.4.3 Botao de remover bloqueio com confirmacao
- [x] 2.4.4 Indicador visual de disponibilidade nos slots (livre/parcial/completo)

### 2.5 Tela financeira por mudanca (frontend)
- [x] 2.5.1 Refinar tab Financeiro na pagina de detalhe da mudanca com cards visuais:
  - Receita Prevista vs Realizada (barra comparativa)
  - Custos Operacionais (breakdown combustivel + alimentacao)
  - Margem (destaque verde/vermelho)
- [x] 2.5.2 Exibir materiais utilizados com valores unitarios x quantidade

---

## BLOCO 3 — SITE PUBLICO (Sem isso, nao ha entrada de clientes)

### 3.1 Pacote do site publico
- [x] 3.1.1 Criar pacote `packages/site` com Vite + React + React Router + TanStack Query
- [x] 3.1.2 Configurar Tailwind com paleta Sirocco (mesma do admin: sand, gold, terracotta, night)
- [x] 3.1.3 Configurar TenantProvider para injetar marca da empresa dinamicamente
- [x] 3.1.4 Configurar deteccao de subdominio para resolver tenantId

### 3.2 SP-01 — Pagina Inicial (Home)
- [x] 3.2.1 Header fixo com logo (tenant), navegacao (Servicos, Sobre, Contacto), botao "Pedir Orcamento"
- [x] 3.2.2 Hero section — imagem de fundo, titulo, subtitulo, dois CTAs: "Agendar Mudanca" + "Mudanca Urgente"
  - Efeito parallax suave na imagem de fundo
  - Animacao reveal ao scroll (classe .reveal existente)
- [x] 3.2.3 Secao de servicos — cards com glassmorphism (GlassCard) para local/nacional/internacional/armazenagem
- [x] 3.2.4 Secao de confianca — numeros da empresa (mudancas, anos, cobertura) com contador animado
- [x] 3.2.5 Galeria de fotos — grid com hover zoom + lightbox
- [x] 3.2.6 Secao de testemunhos — carousel com cards de feedback
- [x] 3.2.7 Secao de contacto — morada, telefone, email, mapa embed
- [x] 3.2.8 Footer — info legal, redes sociais, links uteis
- [x] 3.2.9 NoiseOverlay (componente existente) em seccoes night
- [x] 3.2.10 Animacoes de scroll reveal em todas as seccoes

### 3.3 SP-02 — Calendario de Disponibilidade
- [x] 3.3.1 Componente de calendario mensal com dias disponiveis/indisponiveis
- [x] 3.3.2 Ao selecionar dia → mostrar slots de hora disponiveis
- [x] 3.3.3 Botao "Confirmar data e hora" → avanca para formulario com data/hora pre-preenchidos
- [x] 3.3.4 Badge visual: "Data pendente de confirmacao pelo admin"

### 3.4 SP-03 — Formulario de Agendamento
- [x] 3.4.1 Bloco de dados pessoais: nome, apelido, email, telefone
- [x] 3.4.2 Bloco de morada de recolha: rua, numero, cod postal, localidade, andar, elevador (sim/nao)
- [x] 3.4.3 Bloco de morada de entrega: mesmos campos
- [x] 3.4.4 Toggle internacional → ativa campo de pais e documentacao em ambas moradas
- [x] 3.4.5 Bloco de veiculo e equipa: selector de veiculo com m3 + preco/hora visivel; selector de equipa com valor/hora
- [x] 3.4.6 Bloco de materiais: checkboxes com protecao filme, cartao, caixas, fita cola (valores unitarios)
- [x] 3.4.7 Campo livre — informacoes adicionais
- [x] 3.4.8 Upload de imagens — multiplos ficheiros com preview antes de submeter
- [x] 3.4.9 Banner "Urgente" no topo com indicacao de tarifas diferenciadas (quando fluxo urgente)
- [x] 3.4.10 Botao Submeter → POST para `/public/mudancas` → mensagem de confirmacao de rececao

### 3.5 Upload de ficheiros (infraestrutura)
- [x] 3.5.1 Configurar storage (local com multer para dev, S3 para producao)
- [x] 3.5.2 Criar endpoint `POST /upload` no backend (autenticado e publico)
- [x] 3.5.3 Criar modelo `Ficheiro` no Prisma (url, tipo, tamanho, entidade, entidadeId, tenantId)
- [x] 3.5.4 Associar ficheiros a mudanca (campo `imagensIds` ou relacao many-to-many)

---

## BLOCO 4 — PWA DO MOTORISTA (Sem isso, o motorista nao tem interface)

### 4.1 Pacote PWA
- [x] 4.1.1 Criar pacote `packages/pwa` com Vite + React + PWA plugin (vite-plugin-pwa)
- [x] 4.1.2 Configurar manifest.json com icone da empresa, tema dinamico via TenantProvider
- [x] 4.1.3 Configurar Service Worker para offline-first (cache de agenda do dia)
- [x] 4.1.4 Configurar Tailwind com mesma paleta Sirocco adaptada para mobile
- [x] 4.1.5 Layout mobile-first: bottom navigation, header minimal, sem sidebar

### 4.2 MT-01 — Login PWA
- [x] 4.2.1 Tela de login simplificada: email + password + toggle "Guardar sessao"
- [x] 4.2.2 Logo e nome da empresa (dinamico via TenantProvider)
- [x] 4.2.3 Se "Guardar sessao" ativo, persistir refresh token com expiracao longa

### 4.3 MT-02 — Agenda do Dia
- [x] 4.3.1 Header com data atual e nome do motorista
- [x] 4.3.2 Lista de mudancas do dia (hora, cliente, morada recolha, estado)
- [x] 4.3.3 Indicador visual de estado por mudanca (por iniciar / a caminho / em servico / concluido)
- [x] 4.3.4 Indicador de proxima mudanca (destaque visual)

### 4.4 MT-03 — Detalhe da Mudanca
- [x] 4.4.1 Dados do cliente: nome e telefone (clickable para ligar)
- [x] 4.4.2 Morada de recolha completa (com link para maps)
- [x] 4.4.3 Morada de entrega completa (com link para maps)
- [x] 4.4.4 Equipa confirmada e veiculo
- [x] 4.4.5 Observacoes do admin
- [x] 4.4.6 Botao "Iniciar Deslocamento"

### 4.5 MT-04 — Iniciar Deslocamento
- [x] 4.5.1 Selector de previsao de chegada: 5min ate 30min (incrementos 5), 30min ate 2h (15min), 30min ate 8h (30min)
- [x] 4.5.2 Resumo: destino + previsao selecionada
- [x] 4.5.3 Botao "Confirmar e Notificar" → POST `/mudancas/:id/iniciar` com previsao
- [x] 4.5.4 Backend: adicionar campo `previsaoChegadaMinutos` ao iniciarDeslocamento
- [x] 4.5.5 Backend: disparar notificacao (webhook/evento) ao admin quando motorista inicia

### 4.6 MT-05 — Em Servico
- [x] 4.6.1 Indicacao de hora de inicio
- [x] 4.6.2 Contador de tempo em curso (cronometro visual)
- [x] 4.6.3 Resumo da mudanca
- [x] 4.6.4 Botao "Concluir Mudanca"

### 4.7 MT-06 — Ficha de Conclusao
- [x] 4.7.1 Horas registadas pelo sistema (campo de referencia, nao editavel)
- [x] 4.7.2 Horas cobradas ao cliente (campo numerico obrigatorio)
- [x] 4.7.3 Confirmacao de ajudantes (lista dos atribuidos com checkbox)
- [x] 4.7.4 Materiais utilizados: protecao filme (qtd), cartao (qtd), caixas (qtd), fita cola (qtd)
- [x] 4.7.5 Combustivel: campo valor + campo litros
- [x] 4.7.6 Alimentacao: toggle sim/nao + campo valor (se sim)
- [x] 4.7.7 Observacoes: texto livre
- [x] 4.7.8 Botao "Concluir e Submeter" → POST `/mudancas/:id/concluir`

---

## BLOCO 5 — COMUNICACAO REAL E NOTIFICACOES

### 5.1 Envio de email real
- [x] 5.1.1 Configurar provedor de email (Resend / SendGrid / AWS SES)
- [x] 5.1.2 Criar `EmailService` no backend com metodo `send(to, template, variaveis)`
- [x] 5.1.3 Integrar com ComunicacaoService: ao aprovar mudanca → enviar email usando template "aprovada"
- [x] 5.1.4 Ao recusar → enviar email usando template "recusada"
- [x] 5.1.5 Ao criar mudanca publica → enviar email "solicitacao_recebida" ao cliente
- [x] 5.1.6 Ao motorista iniciar deslocamento → enviar email "motorista_a_caminho" ao cliente
- [x] 5.1.7 Ao concluir mudanca → enviar email "mudanca_concluida" ao cliente
- [x] 5.1.8 Ao admin alterar detalhes → enviar email "alterada" ao cliente
- [x] 5.1.9 Historico de emails enviados por mudanca/cliente

### 5.2 Notificacoes in-app (admin)
- [x] 5.2.1 Criar modelo `Notificacao` no Prisma (tenantId, userId, tipo, mensagem, lida, link)
- [x] 5.2.2 Endpoint `GET /notificacoes` e `PATCH /notificacoes/:id/lida`
- [x] 5.2.3 Badges de notificacoes nao lidas no header do admin
- [x] 5.2.4 Push de novas notificacoes via polling ou WebSocket (fase inicial: polling a cada 30s)

### 5.3 Preview de template real
- [x] 5.3.1 Substituir replace simples por chamada a `/comunicacao/templates/:nome/render`
- [x] 5.3.2 Exibir preview em modal com HTML renderizado

---

## BLOCO 6 — EXPORTACAO E RELATORIOS

### 6.1 Exportacao CSV/Excel
- [x] 6.1.1 Instalar dependencias: `xlsx` (SheetJS) no backend
- [x] 6.1.2 Criar servico de exportacao generico: `ExportService.gerarExcel(dados, colunas, nomeFicheiro)`
- [x] 6.1.3 Endpoint `GET /mudancas/export` com filtros (estado, data, motorista) → retorna xlsx
- [x] 6.1.4 Endpoint `GET /financeiro/export` com filtros de periodo → retorna xlsx
- [x] 6.1.5 Endpoint `GET /clientes/export` → retorna csv/xlsx
- [x] 6.1.6 Exportacao PDF (usar `puppeteer` ou `pdfkit` para relatorios financeiros)

### 6.2 Modulo de Relatorios (AD-10)
- [x] 6.2.1 Criar pagina de relatorios no frontend com filtros: periodo, motorista, veiculo, tipo servico, cliente
- [x] 6.2.2 Relatorio operacional: mudancas e agendamentos por periodo
- [x] 6.2.3 Relatorio financeiro: receitas e custos por periodo
- [x] 6.2.4 Relatorio de equipa: performance de motoristas
- [x] 6.2.5 Relatorio de materiais: consumo por periodo
- [x] 6.2.6 Pre-visualizacao antes de exportar
- [x] 6.2.7 Botoes de exportacao: PDF, Excel, CSV

### 6.3 Movimentos financeiros manuais
- [x] 6.3.1 UI para criar movimentos financeiros manuais no painel financeiro
- [x] 6.3.2 UI para listar e remover movimentos manuais
- [x] 6.3.3 Categorias: servico, materiais, combustivel, alimentacao, manutencao, outros

---

## BLOCO 7 — CONFIGURACOES AVANCADAS

### 7.1 Upload de logo e banners
- [x] 7.1.1 Endpoint `POST /upload/logo` no backend (salva URL no configMarca)
- [x] 7.1.2 Componente de upload com preview na tab Marca das Configuracoes
- [x] 7.1.3 Configuracao de cores com esquema 60/30/10: 3 color pickers (Principal 60%, Secundaria 30%, Detalhe 10%) + preview em tempo real mostrando um mini-site com as proporcoes aplicadas
- [x] 7.1.4 Gestao de banners do site: upload, ordem (drag-and-drop), ativar/desativar
- [x] 7.1.5 Favicon automatico a partir do logo (geracao server-side ou crop no frontend)

### 7.2 Builder de formulario (AD-16)
- [x] 7.2.1 Modelo `CampoFormulario` no Prisma (tenantId, nome, tipo, obrigatorio, ordem, opcoes)
- [x] 7.2.2 Backend CRUD para campos do formulario
- [x] 7.2.3 Frontend: lista de campos ativos com ordem arrastavel (dnd-kit)
- [x] 7.2.4 Tipos de campo: texto livre, checkbox, selector, numero
- [x] 7.2.5 Campos base do sistema (nao removiveis, ordem configuravel)
- [x] 7.2.6 Definicao de obrigatoriedade por campo
- [x] 7.2.7 Pre-visualizacao do formulario em tempo real

### 7.3 Configuracoes de urgencia
- [x] 7.3.1 Campo "Veiculo de urgencia" nas configuracoes de agenda
- [x] 7.3.2 Configuracao de preco de urgencia (percentagem de acrescimo ou valor fixo diferenciado)
- [x] 7.3.3 Indicacao no site publico de que urgencia tem tarifas diferenciadas

### 7.4 Alteracao de password
- [x] 7.4.1 Secao "Alterar Password" na pagina de configuracoes ou perfil
- [x] 7.4.2 Formulario: senha atual + nova senha + confirmacao
- [x] 7.4.3 Chamada a `authApi.updatePassword()`

---

## BLOCO 8 — SUPER-ADMIN FRONTEND

### 8.1 Painel do Super-Admin
- [x] 8.1.1 Criar pacote `packages/super-admin` OU adicionar rotas com layout dedicado no admin
- [x] 8.1.2 Layout dedicado com tema night (dark) diferenciado mas mesma paleta Sirocco
- [x] 8.1.3 SA-01 Dashboard: lista de empresas, indicadores globais, alertas de setup incompleto
- [x] 8.1.4 SA-02 Criar Empresa: formulario com nome, subdominio (validacao em tempo real), dados do admin, config base (pais, moeda, fuso)
- [x] 8.1.5 SA-03 Detalhe da Empresa: dados, estado da conta, acesso em modo visualizacao, historico, acoes (suspender, reset password, alterar subdominio)
- [x] 8.1.6 Autenticacao separada para super-admin (email global, nao vinculado a tenant)

---

## BLOCO 9 — COERENCIA DE MARCA ENTRE PLATAFORMAS

### 9.1 Tema dinamico end-to-end
- [x] 9.1.1 Garantir que TenantProvider injeta as mesmas CSS vars em Site, Admin, PWA e Super-Admin
- [x] 9.1.2 Ao alterar cor no Admin → Site publico reflete sem reload (CSS vars reativas)
- [x] 9.1.3 Ao alterar logo no Admin → Site publico, PWA e Super-Admin atualizam
- [x] 9.1.4 PWA: Service Worker cachea tema mas atualiza ao detectar mudanca
- [x] 9.1.5 Super-Admin: ao visualizar empresa, carrega a marca daquela empresa especifica
- [x] 9.1.6 Implementar esquema 60/30/10 no TenantProvider: mapear corPrincipal (60%), corSecundaria (30%), corDetalhe (10%) para CSS vars semanticas (--c-principal, --c-secundaria, --c-detalhe) + variacoes de opacidade (90%, 70%, 50%, 20%, 10%)
- [x] 9.1.7 Implementar seletor de tema light/dark/sistema no layout (persistir preferencia no localStorage)
- [x] 9.1.8 Calculo automatico de contraste: texto claro sobre fundo escuro e vice-versa (usar luminancia relativa W3C)

### 9.2 Design tokens compartilhados
- [x] 9.2.1 Criar pacote `@mudancas/shared` com todos os tokens de design (cores, fonts, espacamentos, border-radius)
- [x] 9.2.2 Garantir que todos os 4 frontends importam do mesmo pacote
- [x] 9.2.3 Documentar as variacoes permitidas (cores customizaveis vs fixas)
- [x] 9.2.4 Atualizar modelo Tenant no Prisma: configMarca deve ter `corPrincipal`, `corSecundaria`, `corDetalhe` (3 cores) + `tema` (light/dark/system)
- [x] 9.2.5 Migracao do schema: converter configMarca existente de `corPrincipal`/`corSecundaria`/`corFundo` para novo formato 60/30/10

---

## BLOCO 10 — TESTES E QUALIDADE

### 10.1 Testes de isolamento multi-tenant
- [x] 10.1.1 Test-runner: suite que cria 2 tenants, cria dados em cada um, verifica que tenant A nao ve dados do B
- [x] 10.1.2 Teste de que alteracao de configMarca do tenant A nao afeta tenant B
- [x] 10.1.3 Teste de que subdominio A so resolve dados do tenant A

### 10.2 Testes de fluxo end-to-end
- [x] 10.2.1 Cliente submete formulario → aparece em aprovacoes → admin aprova → motorista ve na agenda
- [x] 10.2.2 Motorista inicia deslocamento → estado muda → admin ve no dashboard
- [x] 10.2.3 Motorista conclui com ficha → financeiro calculado → aparece no financeiro

### 10.3 Testes de roles
- [x] 10.3.1 Motorista tenta aceder endpoint admin → 403
- [x] 10.3.2 Financeiro tenta aprovar mudanca → 403
- [x] 10.3.3 Gerente tenta aceder configuracoes → 403

---

## BLOCO 11 — MELHORIAS FUTURAS (Baixa criticidade)

### 11.1 SMS / WhatsApp Business API
- [x] 11.1.1 Pesquisar provedores (Twilio, MessageBird)
- [x] 11.1.2 Criar servico de SMS abstrato (interface + implementacao placeholder)
- [x] 11.1.3 Integrar com notificacoes de "motorista a caminho"

### 11.2 Setup guiado por empresa
- [x] 11.2.1 Wizard de onboarding apos criacao do tenant (marca → precos → agenda → veiculos)
- [x] 11.2.2 Indicador de progresso do setup no dashboard do admin
- [x] 11.2.3 Super-admin ve quais empresas tem setup incompleto

### 11.3 Performance e UX
- [x] 11.3.1 Lazy loading de paginas no admin (React.lazy + Suspense)
- [x] 11.3.2 Otimistic updates nas mutacoes (TanStack Query)
- [x] 11.3.3 Skeleton loaders em todas as paginas
- [x] 11.3.4 Debounce nos campos de busca

---

## PROGRESSO

| Bloco | Total | Feitos | % |
|---|---|---|---|
| 1. Seguranca e Fundacao | 14 | 14 | 100% |
| 2. Fluxo Operacional | 14 | 14 | 100% |
| 3. Site Publico | 17 | 17 | 100% |
| 4. PWA Motorista | 17 | 17 | 100% |
| 5. Comunicacao | 12 | 12 | 100% |
| 6. Exportacao e Relatorios | 10 | 10 | 100% |
| 7. Configuracoes Avancadas | 12 | 12 | 100% |
| 8. Super-Admin Frontend | 6 | 6 | 100% |
| 9. Coerencia de Marca | 8 | 8 | 100% |
| 10. Testes e Qualidade | 8 | 8 | 100% |
| 11. Melhorias Futuras | 7 | 7 | 100% |
| **TOTAL** | **121** | **121** | **100%** |

---

## NOTAS

- **Esquema 60/30/10 por empresa:** Cada tenant define 3 cores (principal, secundaria, detalhe). O sistema calcula automaticamente onde cada uma aplica:
  - **60% Principal:** sidebar ativa, botoes primarios, headers de seccao, CTAs, links, foco em inputs
  - **30% Secundaria:** cards, bordas, seccoes alternadas, badges de status neutros, backgrounds de dialogos
  - **10% Detalhe:** alerts, badges urgentes, micro-interaccoes, hover states, icones de destaque, pendencias
- **Fundo (light/dark/sistema):** Fora da regra 60/30/10. Light = tons sand/cream (#F5EDE0, #F0E6D6). Dark = tons night (#0A0F1E, #141B2D). O utilizador escolhe o tema, as 3 cores adaptam-se.
- **Contraste automatico:** Texto claro sobre fundo escuro, texto escuro sobre fundo claro. Calculado via luminancia relativa.
- **Temas Sirocco (defaults):** Principal = gold (#D4A853), Secundaria = terracotta (#C4572A), Detalhe = night-medium (#1E2640) — sao os defaults quando a empresa nao customiza
- **Layout e efeitos do Desert Luxury:** hero full-screen com overlay + parallax, seccoes com scroll reveal, galeria com hover zoom + lightbox, glassmorphism em cards, noise overlay, contadores animados, stagger em listas, transicoes suaves (cubic-bezier). TUDO independente de cor.
- **Fontes:** Display = Cormorant Garamond (serif, weight 300), Body = Inter (sans-serif)
- **Efeitos:** Glassmorphism (GlassCard), scroll reveal (.reveal), stagger animations, noise overlay, parallax suave
- **Regra:** Nenhuma cor, logo ou fonte e hardcoded — tudo vem do TenantProvider via CSS custom properties

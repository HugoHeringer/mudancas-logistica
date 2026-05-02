# Requirements: Mudanças Logística

**Defined:** 2026-04-30
**Core Value:** Entregar um sistema robusto, sem bugs de isolamento de dados, que forneça análises potentes para decisões de negócio enquanto mantém uma experiência visual premium e intuitiva (Curated Transit).

## v1 Requirements (Stabilization & Premium Redesign)

### Data Integrity & Security
- [ ] **DATA-01**: Garantir isolamento de 100% dos tenants via middleware/guards e filtros explícitos em todas as queries Prisma.
- [ ] **DATA-02**: Implementar validação de `configPreco` antes de permitir aprovação/conclusão de mudanças para evitar receitas zeradas.
- [ ] **DATA-03**: Corrigir cálculo de `receitaRealizada` e `receitaPrevista` no dashboard para refletir a realidade financeira do mês.
- [ ] **DATA-04**: Normalizar comparadores de data (Range de Dia) em todos os filtros de Dashboard, Agenda e PWA.

### Core Workflow (Agenda & Approvals)
- [ ] **FLOW-01**: Persistir slots de agenda gerados dinamicamente no DB para garantir que ocupações sejam reais e visíveis.
- [ ] **FLOW-02**: Corrigir mutation de aprovação no Admin para usar os recursos (Motorista/Veículo) selecionados nos dropdowns.
- [ ] **FLOW-03**: Garantir que a criação de mudanças pelo site público reserve provisoriamente um slot na agenda.
- [ ] **FLOW-04**: Corrigir tipos de dados no formulário de agendamento (ex: materiais como Number em vez de Boolean).

### Visual Excellence (Curated Transit)
- [ ] **UI-01**: Implementar o Design System "Curated Transit" (glassmorphism, tipografia editorial, cores vibrantes) no painel Admin.
- [ ] **UI-02**: Redesenhar o Dashboard Admin para ser visualmente "uau" com gráficos Recharts estilizados e dados potentes.
- [ ] **UI-03**: Atualizar o PWA com a nova identidade visual, focando em usabilidade extrema para field workers.
- [ ] **UI-04**: Traduzir e polir todos os textos da interface (remover termos em chinês ou inglês técnico para o usuário final).

### Performance & Offline
- [ ] **PERF-01**: Migrar filtros de listagem (Mudanças, Aprovações) do client-side para a API (Server-side filtering).
- [ ] **OFFL-01**: Garantir persistência de tokens de autenticação no PWA para evitar logouts inesperados em recargas ou instabilidade de rede.

## v2 Requirements (Future Expansion)
- **EXP-01**: Módulo de expansão para outros tipos de logística.
- **PAY-01**: Integração com gateways de pagamento (Stripe/IfthenPay).
- **IA-01**: Sugestões de otimização de rotas via IA.

## Out of Scope
| Feature | Reason |
|---------|--------|
| App Mobile Nativo | PWA é suficiente e mais ágil para a fase atual. |
| Chat em Tempo Real | Notificações push/email são prioridade sobre chat interno. |

## Traceability (Initial Mapping)
| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| FLOW-01 | Phase 1 | Pending |
| FLOW-02 | Phase 1 | Pending |
| FLOW-03 | Phase 1 | Pending |
| FLOW-04 | Phase 1 | Pending |
| UI-01 | Phase 2 | Pending |
| UI-02 | Phase 2 | Pending |
| UI-03 | Phase 2 | Pending |
| UI-04 | Phase 2 | Pending |
| PERF-01 | Phase 2 | Pending |
| OFFL-01 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 14 total
- Mapped to phases: 14
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-30*
*Last updated: 2026-04-30 after initial definition*

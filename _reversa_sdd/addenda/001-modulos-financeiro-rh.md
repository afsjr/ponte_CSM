# Adendo SDD: Módulos Financeiro e RH

> Feature ID: `001-modulos-financeiro-rh`
> Data de Entrega: `2026-07-20`
> Status: 🟢 ENTREGUE E CONVERGIDO

## Vigência
Vigente a partir de 2026-07-20.

## Resumo da Entrega
Implementação completa dos Módulos Financeiro e de RH no Sistema de Gestão Escolar (Secretaria CSM - Educação Básica).

### Componentes Adicionados:
1. **Schema de Banco de Dados (`src/db/schema.ts`)**:
   - Novas tabelas: `plano_contas`, `centro_custo`, `titulo_financeiro`, `rh_dossie_colaborador`, `rh_documento_colaborador`, `rh_ferias`, `rh_ocorrencia_funcional`.
   - Enums: `tipo_plano_conta`, `status_titulo`, `tipo_ocorrencia_rh`, `status_ferias`.
2. **Segurança & RLS (`scripts/setup_rls.ts`)**:
   - Habilitação de RLS em todas as 7 novas tabelas no Supabase PostgreSQL.
3. **Server Actions (`src/actions/financeiro.ts` e `src/actions/rh.ts`)**:
   - Operações protegidas por `checkAuth()` e auditadas via `auditLog`.
   - Suíte de testes Vitest com 100% de aprovação (72/72 testes passando).
4. **Interfaces de Usuário (Next.js 15 App Router)**:
   - `/financeiro`: Gestão de Contas a Pagar/Receber, Calendário com Alertas de Vencimento em $\le 7$ dias e Relatório DRE/Margens.
   - `/rh`: Dossiê dos Colaboradores, Programação de Férias, Histórico de Ocorrências e Conferência da Folha de Pagamento.
   - `/page.tsx`: Cards de acesso rápido atualizados no Dashboard principal.

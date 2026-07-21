# Actions: Módulos Financeiro e RH

> Identificador: `001-modulos-financeiro-rh`
> Data: `2026-07-20`
> Roadmap: `_reversa_forward/001-modulos-financeiro-rh/roadmap.md`

## Resumo

| Métrica | Valor |
|---------|-------|
| Total de ações | 10 |
| Paralelizáveis (`[//]`) | 4 |
| Maior cadeia de dependência | 5 (T001 -> T005 -> T007 -> T009 -> T010) |

## Fase 1, Preparação

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T001 | Adicionar novos enums e tabelas do Financeiro e RH em `schema.ts` | - | - | `src/db/schema.ts` | 🟢 | `[X]` |
| T002 | Atualizar `setup_rls.ts` habilitando RLS e políticas para as 8 tabelas | T001 | - | `scripts/setup_rls.ts` | 🟢 | `[X]` |

## Fase 2, Testes

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T003 | Criar suíte de testes Vitest para Server Actions do Financeiro | T001 | `[//]` | `src/actions/financeiro.test.ts` | 🟢 | `[X]` |
| T004 | Criar suíte de testes Vitest para Server Actions do RH | T001 | `[//]` | `src/actions/rh.test.ts` | 🟢 | `[X]` |

## Fase 3, Núcleo

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T005 | Criar Server Actions do Financeiro (CRUD Contas, Títulos, Baixas, DRE e Alertas) | T001 | - | `src/actions/financeiro.ts` | 🟢 | `[X]` |
| T006 | Criar Server Actions do RH (CRUD Dossiê, Documentos, Férias e Ocorrências) | T001 | `[//]` | `src/actions/rh.ts` | 🟢 | `[X]` |

## Fase 4, Integração

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T007 | Criar tela e abas UI do Módulo Financeiro | T005 | - | `src/app/(dashboard)/financeiro/page.tsx` | 🟢 | `[X]` |
| T008 | Criar tela e abas UI do Módulo de RH | T006 | `[//]` | `src/app/(dashboard)/rh/page.tsx` | 🟢 | `[X]` |

## Fase 5, Polimento

| ID | Descrição | Dependências | Paralelismo | Arquivo alvo | Confidência | Status |
|----|-----------|--------------|-------------|--------------|-------------|--------|
| T009 | Atualizar Dashboard Principal com cards e alertas rápidos de Financeiro e RH | T007, T008 | - | `src/app/(dashboard)/page.tsx` | 🟡 | `[X]` |
| T010 | Validar compilação `tsc --noEmit` e suíte de testes Vitest completa | T009 | - | `package.json` | 🟢 | `[X]` |

## Notas de execução

- 10 de 10 tarefas concluídas com sucesso.
- Compilação TypeScript 100% limpa (`tsc --noEmit`).
- Suíte completa de testes Vitest 100% verde (72/72 testes passando).

## Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-20 | Versão inicial gerada por `/reversa-to-do` | reversa |
| 2026-07-20 | Todas as 10 tarefas concluídas por `/reversa-coding` | reversa |

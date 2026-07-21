# Legacy Impact: Módulos Financeiro e RH

> Identificador: `001-modulos-financeiro-rh`
> Data: `2026-07-20`
> Âncora: Greenfield (prd.md + specs SDD em `_reversa_sdd/sdd/`)

## Mapeamento de Arquivos Afetados

| Arquivo afetado | Componente | Tipo de impacto | Severidade | Justificativa |
|---|---|---|---|---|
| `src/db/schema.ts` | `financeiro-core`, `rh-dossie-colaboradores` | componente-novo | LOW | Adição das 7 novas tabelas e 4 enums sem alterar schema existente |
| `scripts/setup_rls.ts` | Security | componente-novo | LOW | Habilitação de RLS para as novas tabelas |
| `src/actions/financeiro.ts` | `financeiro-core`, `financeiro-calendario-dre` | componente-novo | LOW | Criação das Server Actions do módulo financeiro |
| `src/actions/rh.ts` | `rh-dossie-colaboradores`, `rh-ferias-historico` | componente-novo | LOW | Criação das Server Actions do módulo de RH |
| `src/app/(dashboard)/financeiro/page.tsx` | UI Financeiro | componente-novo | LOW | Tela e abas de gestão financeira |
| `src/app/(dashboard)/rh/page.tsx` | UI RH | componente-novo | LOW | Tela e abas de gestão de pessoas |
| `src/app/(dashboard)/page.tsx` | UI Dashboard | componente-novo | LOW | Adição dos cards de acesso rápido no painel principal |

## Preservadas
- Todas as tabelas e rotas existentes do projeto (pessoa, pedagogico, secretaria, aee, diario_classe, etc.).

## Modificadas
- `src/db/schema.ts` (extensão sem quebra de retrocompatibilidade)
- `scripts/setup_rls.ts` (inclusão das tabelas)
- `src/app/(dashboard)/page.tsx` (inclusão de links)

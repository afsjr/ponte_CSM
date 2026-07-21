# Roadmap: Módulos Financeiro e RH

> Identificador: `001-modulos-financeiro-rh`
> Data: `2026-07-20`
> Requirements: `_reversa_forward/001-modulos-financeiro-rh/requirements.md`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA

## 1. Resumo da abordagem

A solução adiciona os módulos Financeiro e de RH na arquitetura existente (Next.js 15 App Router, TypeScript, Drizzle ORM, Supabase PostgreSQL). No banco de dados, o schema `src/db/schema.ts` será estendido com novas tabelas: `plano_contas`, `centro_custo`, `lancamento_financeiro`, `titulo_financeiro`, `rh_dossie_colaborador`, `rh_documento_colaborador`, `rh_ferias` e `rh_ocorrencia_funcional`. No backend, Server Actions protegidas por `checkAuth()` e auditoria `audit_log` gerenciarão os lançamentos e mutações. As telas serão adicionadas sob `/app/(dashboard)/financeiro` e `/app/(dashboard)/rh` em padrão de abas responsivas.

## 2. Princípios aplicados

| Princípio | Como a feature se relaciona | Status |
|-----------|------------------------------|--------|
| Retenção de Dados | Proibição de exclusão física nas tabelas financeiras e de RH (soft/hard delete desabilitados) | Respeita |
| Segurança & RLS | RLS habilitado em todas as novas tabelas Supabase com acesso restrito a usuários autenticados | Respeita |
| Arquitetura Isolada | Camada de dados isolada no Drizzle ORM (`src/db/schema.ts`) e Server Actions isoladas em `src/actions/financeiro.ts` e `src/actions/rh.ts` | Respeita |

## 3. Decisões técnicas

| ID | Decisão | Justificativa | Alternativas descartadas | Confidência |
|----|---------|----------------|--------------------------|-------------|
| D-01 | Server Actions separadas (`src/actions/financeiro.ts` e `src/actions/rh.ts`) | Alta coesão por domínio e facilitador de manutenção | Action gigante unificada | 🟢 |
| D-02 | Armazenamento de Documentos de RH no Supabase Storage | Integração nativa com RLS e Supabase Client SSR do projeto | Armazenamento no sistema de arquivos local | 🟢 |
| D-03 | DRE apurado via agregação Drizzle SQL em Server Components | Carregamento rápido sem tráfego excessivo de dados cliente | Agregação e cálculos de margem no cliente | 🟡 |

## 4. Premissas

| Premissa | Origem (`requirements.md` seção) | Risco se errada |
|----------|----------------------------------|-----------------|
| Margem meta no DRE padrão assumida em 15% para alertas visuais | `requirements.md#10.-lacunas` | Exibição de alertas amarelos com limiar não customizado |

## 5. Delta arquitetural

| Componente | Arquivo de origem no legado | Tipo de mudança | Resumo |
|------------|------------------------------|-----------------|--------|
| Schema de Dados | `src/db/schema.ts` | componente-novo | Adição das 8 tabelas de Financeiro e RH |
| Actions Financeiro | `src/actions/financeiro.ts` | componente-novo | CRUD de lançamentos, títulos, DRE e calendário |
| Actions RH | `src/actions/rh.ts` | componente-novo | CRUD de dossiê, documentos, férias e ocorrências |
| UI Dashboard Financeiro | `src/app/(dashboard)/financeiro/page.tsx` | componente-novo | Painel com abas (Contas, Calendário, DRE) |
| UI Dashboard RH | `src/app/(dashboard)/rh/page.tsx` | componente-novo | Painel com abas (Dossiê, Férias, Ocorrências, Folha) |

## 6. Delta no modelo de dados

- Resumo das mudanças: Criação de 8 novas tabelas relacionais com chaves estrangeiras para `pessoa`, Enums para categorias, status e tipos de ocorrência/documento.
- Detalhe completo em: `_reversa_forward/001-modulos-financeiro-rh/data-delta.md`

## 7. Delta de contratos externos

n/a (sem integração por API externa na V1).

## 8. Plano de migração

1. Adicionar os novos enums e tabelas ao `src/db/schema.ts`.
2. Executar `drizzle-kit generate` para gerar o arquivo SQL de migração.
3. Executar o script de migração no Supabase.
4. Atualizar `scripts/setup_rls.ts` para habilitar RLS e aplicar políticas de acesso às novas tabelas.

## 9. Riscos e mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Inconsistência no saldo ao registrar baixas parciais | Alto | Baixa | Utilizar transações atômicas no Drizzle para atualização de títulos |
| Upload de documentos excedendo limite do Supabase | Médio | Média | Validar tamanho (<10MB) e formato no frontend antes do envio |

## 10. Critério de pronto

- [ ] Todas as ações do `actions.md` marcadas `[X]`
- [ ] Novas tabelas criadas no Supabase com RLS ativado
- [ ] Suíte de testes Vitest rodando 100% verde para `src/actions/financeiro.test.ts` e `src/actions/rh.test.ts`

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-20 | Versão inicial gerada por `/reversa-plan` | reversa |

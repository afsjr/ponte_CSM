# Pesquisa e Investigação Técnica: Financeiro e RH

> Identificador: `001-modulos-financeiro-rh`
> Data: `2026-07-20`

## 1. Padrões de Mercado Avaliados
- **Plano de Contas Hierárquico**: Estrutura contábil sintética e analítica (ex: `1.1.01 - Mensalidades Infantil`, `2.1.01 - Salários Corpo Docente`).
- **DRE Gerencial (Demonstração do Resultado do Exercício)**: Modelo de Apuração de Resultado Exercício = Receita Bruta - Deduções - Custos Diretos - Despesas Operacionais.
- **Gestão de Férias Trabalhistas (CLT)**: Período Aquisitivo (12 meses de trabalho) vs Período Concessivo (12 meses subsequentes para gozo).

## 2. Decisão de Armazenamento de Documentos
- **Supabase Storage**: Utilização de bucket privado `rh-documentos` protegido por RLS, onde o caminho do arquivo obedece a estrutura `rh-documentos/{pessoa_id}/{documento_id}.pdf`.

## 3. Padrões de Testes
- Utilização da suíte Vitest com Mocks para as Server Actions de `src/actions/financeiro.ts` e `src/actions/rh.ts`, garantindo paridade com as suítes existentes (`pedagogico.test.ts`, `secretaria.test.ts`).

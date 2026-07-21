# Spec: Financeiro Calendário e DRE (Alertas, Tributos e Margens)

> Selo 🟡 PLANEJADO. Especificação técnica de comportamento (Spec-Driven Development).

**Versão:** 1.0
**Data:** 2026-07-20T22:52:51-03:00
**Autor:** reversa-spec-sdd
**Componente:** `financeiro-calendario-dre`
**Status:** aprovado

---

## 1. Visão Geral e Objetivos
🟡 O componente `financeiro-calendario-dre` gerencia o calendário tributário e fiscal da escola, controlando prazos de vencimento de impostos, salários e contas a pagar, com disparo de alertas proativos aos gestores. Além disso, consolida as receitas e despesas apuradas para a geração do relatório DRE (Demonstração do Resultado do Exercício) e análise de margens de lucro/perda em tempo real.

---

## 2. Requisitos Funcionais

- 🟡 **RF-01 (Calendário Tributário/Fiscal)**: O sistema deve exibir uma visão de calendário com todos os compromissos financeiros (impostos, folha salarial, fornecedores) marcados por data de vencimento.
- 🟡 **RF-02 (Sistema de Alertas Proativos)**: O sistema deve destacar e alertar no dashboard compromissos financeiros a vencer nos próximos 7 dias e compromissos em atraso.
- 🟡 **RF-03 (Relatório DRE)**: O sistema deve consolidar o DRE com totalização de receitas brutas, deduções, despesas operacionais e resultado líquido no período selecionado.
- 🟡 **RF-04 (Cálculo de Margem por Segmento)**: O sistema deve permitir filtrar o resultado DRE por centro de custo (Infantil, Fundamental, Técnico) para apuração de lucro ou perda por segmento.
- 🟡 **RF-05 (Exportação de Relatórios)**: O sistema deve permitir exportar o DRE e a visão do calendário financeiro em formatos de visualização limpos para a direção.

---

## 3. Comportamento e Fluxos

- 🟡 **Fluxo de Alerta de Vencimento**:
  1. Ao carregar o painel financeiro, o sistema verifica os títulos com vencimento em $\le 7$ dias.
  2. Apresenta cartões de alerta com destaque visual (amarelo para atenção, vermelho para vencidos).
  3. Permite que o gestor clique no alerta para ir diretamente à tela de pagamento do título.
- 🟡 **Fluxo de Geração do DRE**:
  1. O usuário seleciona o período (mês/ano ou intervalo customizado) e o centro de custo desejado.
  2. O sistema realiza a soma das receitas liquidadas/a receber e abate as despesas correspondentes.
  3. Renderiza a tabela de DRE com o lucro líquido e percentual de margem apurado.

---

## 4. Non-Goals (Fora de Escopo)

- 🟡 Envio de notificações por SMS ou e-mail externo na V1 (alertas são concentrados dentro da interface da aplicação).
- 🟡 Apuração contábil oficial de IRPJ/CSLL para fins de declaração à Receita Federal (foco no DRE gerencial da escola).

---

## 5. Edge Cases e Tratamento de Erros

- 🟡 **EC-01 (Período sem lançamentos)**: Quando o DRE for gerado para um mês sem movimentações, o sistema deve apresentar valores zerados de forma clara, sem erros de divisão por zero na margem.
- 🟡 **EC-02 (Mudança de data de vencimento)**: Ao alterar a data de vencimento de um compromisso no calendário, os alertas de dashboard devem ser recalculados instantaneamente.

---

## 6. Critérios de Aceite

- 🟡 **Dado** que há um imposto a vencer em 3 dias, **Quando** o gestor financeiro acessa a aplicação, **Então** um alerta de atenção é exibido no topo do dashboard financeiro.
- 🟡 **Dado** que o gestor seleciona o centro de custo "Educação Infantil" no DRE, **Quando** clica em filtrar, **Então** o sistema exibe apenas as receitas e despesas vinculadas a esse segmento e a margem apurada.

---

## 7. Relatório de Avaliação SDD

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORE TOTAL: 94/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Breakdown:
  Completude:    95/100 (peso 30%)
  Testabilidade: 95/100 (peso 25%)
  Clareza:       95/100 (peso 20%)
  Escopo:        90/100 (peso 15%)
  Edge Cases:    90/100 (peso 10%)

Gaps críticos:
  - Nenhum gap crítico.

Sugestões:
  1. Implementar futuramente notificações por e-mail para lembretes de impostos.
```

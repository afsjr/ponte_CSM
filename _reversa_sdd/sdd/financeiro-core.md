# Spec: Financeiro Core (Plano de Contas, Lançamentos e Títulos)

> Selo 🟡 PLANEJADO. Especificação técnica de comportamento (Spec-Driven Development).

**Versão:** 1.0
**Data:** 2026-07-20T22:52:51-03:00
**Autor:** reversa-spec-sdd
**Componente:** `financeiro-core`
**Status:** aprovado

---

## 1. Visão Geral e Objetivos
🟡 O componente `financeiro-core` é responsável pelo gerenciamento da estrutura contábil/financeira da escola. Ele provê a gestão do Plano de Contas e dos Centros de Custo (categorizando transações por Educação Infantil, Fundamental e Técnico), além do registro e controle do ciclo de vida das Contas a Pagar e Receber.

---

## 2. Requisitos Funcionais

- 🟡 **RF-01 (Plano de Contas)**: O sistema deve permitir o cadastro hierárquico de contas contábeis de receitas e despesas.
- 🟡 **RF-02 (Centros de Custo)**: O sistema deve permitir vincular cada lançamento financeiro a um ou mais centros de custo (ex: Infantil, Fundamental, Técnico, Administrativo).
- 🟡 **RF-03 (Contas a Pagar)**: O sistema deve permitir o registro de contas a pagar com data de vencimento, fornecedor, valor, categoria e status (Pendente, Pago, Cancelado).
- 🟡 **RF-04 (Contas a Receber)**: O sistema deve permitir o registro de contas a receber com aluno/sacado, vencimento, valor, origem (mensalidade, taxa de material, uniforme) e status (Pendente, Recebido, Atrasado).
- 🟡 **RF-05 (Baixa e Conciliação)**: O sistema deve permitir registrar a baixa manual de títulos com data de pagamento, valor efetivamente pago/recebido, juros/descontos aplicados e forma de pagamento.

---

## 3. Comportamento e Fluxos

- 🟡 **Fluxo de Lançamento de Despesa**:
  1. O usuário acessa a tela de Contas a Pagar e clica em "Nova Despesa".
  2. Preenche os dados obrigatórios (Fornecedor, Categoria, Centro de Custo, Valor, Vencimento).
  3. O sistema valida os campos, gera o registro com status `Pendente` e grava o log de auditoria.
- 🟡 **Fluxo de Baixa de Título**:
  1. O usuário seleciona um título `Pendente` ou `Atrasado` e clica em "Registrar Baixa".
  2. Informa a data de liquidação, valor pago e forma de pagamento (PIX, Boleto, Transferência, Dinheiro).
  3. O sistema atualiza o status do título para `Pago` / `Recebido` e ajusta os relatórios de caixa.

---

## 4. Non-Goals (Fora de Escopo)

- 🟡 Integração por API com serviços bancários para conciliação automática por arquivo de extrato em tempo real na V1.
- 🟡 Emissão nativa de Notas Fiscais de Serviço (NFS-e).

---

## 5. Edge Cases e Tratamento de Erros

- 🟡 **EC-01 (Tentativa de baixa com valor negativo)**: O sistema deve rejeitar valores de pagamento negativos ou zerados, exibindo mensagem de erro.
- 🟡 **EC-02 (Exclusão de conta com lançamentos vinculados)**: O sistema deve impedir a exclusão de uma categoria do Plano de Contas que possua lançamentos cadastrados.
- 🟡 **EC-03 (Baixa parcial)**: Quando o valor pago for inferior ao valor do título, o sistema deve permitir registrar como baixa parcial e manter o saldo restante como `Pendente`.

---

## 6. Critérios de Aceite

- 🟡 **Dado** que o gestor cadastra uma conta a pagar de R$ 500,00 para o centro de custos "Ensino Técnico", **Quando** salvar o lançamento, **Então** o título fica visível como pendente e computado na previsão de saídas do segmento Técnico.
- 🟡 **Dado** que o gestor seleciona uma mensalidade em atraso, **Quando** confirma a baixa total com recebimento em PIX, **Então** o status da conta a receber muda imediatamente para `Recebido`.

---

## 7. Relatório de Avaliação SDD

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORE TOTAL: 92/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Breakdown:
  Completude:    95/100 (peso 30%)
  Testabilidade: 90/100 (peso 25%)
  Clareza:       95/100 (peso 20%)
  Escopo:        90/100 (peso 15%)
  Edge Cases:    85/100 (peso 10%)

Gaps críticos:
  - Nenhum gap crítico.

Sugestões:
  1. Adicionar suporte a anexos de comprovantes de pagamento no futuro.
```

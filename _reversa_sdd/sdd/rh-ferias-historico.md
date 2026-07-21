# Spec: RH Férias e Histórico Funcional (Férias, Promoções e Ocorrências)

> Selo 🟡 PLANEJADO. Especificação técnica de comportamento (Spec-Driven Development).

**Versão:** 1.0
**Data:** 2026-07-20T22:52:51-03:00
**Autor:** reversa-spec-sdd
**Componente:** `rh-ferias-historico`
**Status:** aprovado

---

## 1. Visão Geral e Objetivos
🟡 O componente `rh-ferias-historico` controla a vida funcional do colaborador dentro da instituição de ensino. É responsável pela gestão dos períodos aquisitivos e agendamento de férias, além do registro de movimentações da carreira (promoções de cargo, alteração salarial, gratificações) e histórico disciplinar/funcional (advertências, suspensões e elogios).

---

## 2. Requisitos Funcionais

- 🟡 **RF-01 (Controle de Férias)**: O sistema deve calcular automaticamente o período aquisitivo de férias a partir da data de admissão e permitir registrar a programação e o gozo de férias.
- 🟡 **RF-02 (Alerta de Férias Vencidas)**: O sistema deve emitir alerta no painel de RH para colaboradores que estiverem próximos de completar 2 anos sem o gozo do período aquisitivo (risco de férias em dobro).
- 🟡 **RF-03 (Registro de Histórico de Promoções e Salários)**: O sistema deve manter histórico imutável de todas as alterações de cargo, mudança de nível/classe e reajustes salariais do colaborador.
- 🟡 **RF-04 (Registro de Gratificações)**: O sistema deve permitir o lançamento de gratificações eventuais ou permanentes (ex: gratificação por função de coordenação ou projetos especiais).
- 🟡 **RF-05 (Ocorrências Funcionais e Disciplinares)**: O sistema deve permitir registrar ocorrências no dossiê do colaborador (advertências verbais/escritas, suspensões, elogios), com data, motivo e responsável pelo registro.

---

## 3. Comportamento e Fluxos

- 🟡 **Fluxo de Programação de Férias**:
  1. O usuário de RH acessa a aba "Férias" na ficha do funcionário.
  2. O sistema exibe o período aquisitivo aberto e a quantidade de dias disponíveis (ex: 30 dias).
  3. O usuário seleciona a data de início e fim da programação de férias.
  4. O sistema valida se as datas estão no período permissível e registra a programação.
- 🟡 **Fluxo de Lançamento de Advertência / Ocorrência**:
  1. O usuário acessa a aba "Ocorrências Funcionais" do colaborador.
  2. Clica em "Nova Ocorrência", seleciona o tipo (Advertência, Elogio, Promoção, Gratificação), descreve a justificativa e anexa documento se houver.
  3. O sistema grava o registro com selo de data/hora e o ID do usuário gestor autor do registro.

---

## 4. Non-Goals (Fora de Escopo)

- 🟡 Cálculo e homologação automática de rescisão contratual com cálculo de FGTS/multa rescisória na V1.
- 🟡 Controle de ponto eletrônico via biometria/reconhecimento facial nativo.

---

## 5. Edge Cases e Tratamento de Erros

- 🟡 **EC-01 (Tentativa de agendamento de férias fora do período permissível)**: O sistema deve alertar se a data inicial de férias for posterior ao vencimento do segundo período aquisitivo.
- 🟡 **EC-02 (Alteração de histórico passado)**: Registros de advertências e promoções salariais passadas não podem ser alterados ou apagados sem um fluxo de justificativa gravado no `audit_log`.

---

## 6. Critérios de Aceite

- 🟡 **Dado** que um colaborador possui 1 período aquisitivo vencido, **Quando** o RH acessa a aba de férias, **Então** o sistema indica o prazo limite para concessão antes do vencimento do segundo período.
- 🟡 **Dado** que o gestor aplica uma advertência por falta não justificada, **Quando** confirma o registro, **Então** a ocorrência é anexada permanentemente à timeline funcional do funcionário.

---

## 7. Relatório de Avaliação SDD

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORE TOTAL: 93/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Breakdown:
  Completude:    95/100 (peso 30%)
  Testabilidade: 95/100 (peso 25%)
  Clareza:       90/100 (peso 20%)
  Escopo:        90/100 (peso 15%)
  Edge Cases:    90/100 (peso 10%)

Gaps críticos:
  - Nenhum gap crítico.

Sugestões:
  1. Integrar futuramente com módulo de substituição de professores durante o período de férias.
```

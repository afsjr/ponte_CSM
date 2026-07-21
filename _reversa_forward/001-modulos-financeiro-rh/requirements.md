# Requirements: Módulos Financeiro e RH

> Identificador: `001-modulos-financeiro-rh`
> Data: `2026-07-20`
> Pasta da extração reversa: `_reversa_sdd/`
> Confidência: 🟢 CONFIRMADO, 🟡 INFERIDO, 🔴 LACUNA / DÚVIDA

## 1. Resumo executivo

Os Módulos Financeiro e RH entregam a gestão financeira e de departamento pessoal da escola. Para o financeiro, automatizam o Plano de Contas/Centros de Custo (Infantil, Fundamental, Técnico), Contas a Pagar/Receber, Calendário de Tributos/Salários com alertas proativos e o DRE em tempo real. Para o RH, centralizam os dossiês dos colaboradores, documentos, período aquisitivo de férias, histórico funcional (promoções, advertências, gratificações) e apoio à folha salarial.

## 2. Contexto a partir do legado

| Fonte | Trecho relevante | Confidência |
|-------|------------------|-------------|
| `_reversa_sdd/prd.md#escopo-in` | Visão e escopo dos módulos Financeiro e RH | 🟡 |
| `_reversa_sdd/personas.md#persona-1` | Perfil e jornada do Gestor Financeiro / Tesouraria | 🟡 |
| `_reversa_sdd/personas.md#persona-2` | Perfil e jornada do Gestor de Pessoas / RH | 🟡 |
| `_reversa_sdd/sdd/financeiro-core.md#requisitos-funcionais` | Especificação técnica de lançamentos e títulos | 🟡 |
| `_reversa_sdd/sdd/financeiro-calendario-dre.md#requisitos-funcionais` | Especificação de calendário e DRE | 🟡 |
| `_reversa_sdd/sdd/rh-dossie-colaboradores.md#requisitos-funcionais` | Especificação de dossiê e documentos | 🟡 |
| `_reversa_sdd/sdd/rh-ferias-historico.md#requisitos-funcionais` | Especificação de férias e ocorrências | 🟡 |

## 3. Personas e cenários de uso

| Persona | Objetivo | Cenário-chave |
|---------|----------|---------------|
| Gestor Financeiro / Tesouraria | Controlar caixa, tributos e margens | Acompanhar calendário de vencimentos, registrar baixas e consultar DRE por segmento |
| Gestor de Pessoas / RH | Manter conformidade trabalhista e dossiês | Gerenciar documentos contratuais, agendar férias e registrar histórico funcional |

## 4. Regras de negócio novas ou alteradas

1. **RN-01 (Segmentação Orçamentária):** Todos os lançamentos de receitas e despesas devem obrigatoriamente estar associados a pelo menos um Centro de Custo (Infantil, Fundamental, Técnico ou Administrativo). 🟡
2. **RN-02 (Alertas Preventivos):** O sistema deve gerar alertas visuais no dashboard para tributos e compromissos salariais com vencimento em até 7 dias. 🟡
3. **RN-03 (Imutabilidade de Ocorrências):** Registros de advertências, promoções e alterações de remuneração são imutáveis e auditados via log. 🟡
4. **RN-04 (Alerta de Férias Vencidas):** O sistema deve alertar o RH sobre colaboradores que completarem 23 meses de período aquisitivo sem agendamento de férias. 🟡

## 5. Requisitos Funcionais

| ID | Requisito | Prioridade | Critério de aceite | Confidência |
|----|-----------|------------|--------------------|-------------|
| RF-01 | Cadastro de Plano de Contas e Centros de Custo | Must | Permite criar categorias hierárquicas e vincular a segmentos escolares | 🟡 |
| RF-02 | Lançamento de Contas a Pagar e Receber | Must | Permite registrar títulos com data, valor, fornecedor/aluno e centro de custo | 🟡 |
| RF-03 | Baixa Manual de Títulos e Conciliação | Must | Registra pagamentos/recebimentos com data, valor efetivo e forma de pagamento | 🟡 |
| RF-04 | Calendário Financeiro e Sistema de Alertas | Must | Exibe visão de calendário com destaque para vencimentos em $\le 7$ dias | 🟡 |
| RF-05 | Relatório DRE e Apuração de Margem | Must | Consolida receitas e despesas apurando lucro ou perda em tempo real por segmento | 🟡 |
| RF-06 | Dossiê e Cadastro de Colaborador (RH) | Must | Armazena dados contratuais, pessoais e bancários de professores e apoio | 🟡 |
| RF-07 | Upload e Gestão de Documentos Digitais | Must | Permite guardar PDF/imagens categorizados no Supabase Storage | 🟡 |
| RF-08 | Gestão de Período Aquisitivo e Férias | Must | Calcula prazos aquisitivos e registra agendamento e gozo de férias | 🟡 |
| RF-09 | Histórico Funcional e Ocorrências | Must | Registra advertências, suspensões, promoções e gratificações na linha do tempo | 🟡 |
| RF-10 | Relatório de Apoio à Folha de Pagamento | Should | Consolida proventos, gratificações e descontos para conferência | 🟡 |

## 6. Requisitos Não Funcionais

| Tipo | Requisito | Evidência ou justificativa | Confidência |
|------|-----------|------------|-------------|
| Desempenho | DRE e Calendário devem ser renderizados em menos de 1 segundo | Consultas otimizadas com Drizzle ORM | 🟡 |
| Segurança | Controle estrito de RLS no Supabase e verificação de auth em todas as Server Actions | Prevenção de vazamento de dados salariais e contratuais | 🟢 |
| Auditoria | Mutações financeiras e funcionais devem ser registradas em `audit_log` | Rastreabilidade e regra não-negociável do projeto | 🟢 |

## 7. Critérios de Aceitação

```gherkin
Cenário: Alerta de vencimento de imposto no calendário
  Dado que existe uma conta a pagar de tributo com vencimento em 4 dias
  Quando o gestor financeiro acessa o dashboard
  Então o sistema exibe um alerta de atenção amarelo com os detalhes da conta

Cenário: Registro de ocorrência funcional no RH
  Dado que o gestor de RH está na ficha de um colaborador
  Quando lança uma ocorrência de promoção com novo salário
  Então a ocorrência é gravada de forma imutável na timeline do colaborador
```

## 8. Prioridade MoSCoW

| Item | MoSCoW | Justificativa |
|------|--------|---------------|
| RF-01 a RF-09 | Must | Funcionalidades essenciais para a operação financeira e de RH |
| RF-10 | Should | Relatório de conferência de folha agregante para fechamento mensal |
| RNF de Segurança | Must | RLS obrigatório para sigilo salarial e contratual |

## 9. Esclarecimentos

> Nenhuma sessão de dúvidas registrada ainda. Rode `/reversa-clarify` quando houver `[DÚVIDA]` pendente.

## 10. Lacunas

- 🔴 [DÚVIDA] Qual a margem meta percentual desejada pela direção escolar no relatório DRE para destacar alertas de margem baixa?

## 11. Histórico de alterações

| Data | Alteração | Autor |
|------|-----------|-------|
| 2026-07-20 | Versão inicial gerada por `/reversa-requirements` | reversa |

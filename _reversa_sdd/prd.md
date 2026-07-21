# PRD: Módulos Financeiro e RH (Sistema CSM)

> Selo 🟡 PLANEJADO. Documento gerado a partir de ideation + personas.

**Versão:** 1.0
**Data:** 2026-07-20T22:51:37-03:00
**Autor:** reversa-drafter
**Status:** rascunho

---

## 1. Problema

🟡 Falta de visibilidade financeira unificada de receitas, despesas, margens (lucro/perda) por segmento da escola (Infantil, Fundamental, Técnico) e riscos de perda de prazos de impostos e compromissos salariais. No RH, descentralização documental dos colaboradores, falta de rastreabilidade do histórico funcional (advertências, promoções, gratificações) e controle manual de férias.

### Quem sente
🟡 **Gestor Financeiro / Tesouraria**: diariamente no acompanhamento de contas a pagar/receber, conciliação e calendário tributário.
🟡 **Gestor de Pessoas / RH**: no gerenciamento do departamento pessoal, férias, documentação e ocorrências trabalhistas dos professores e funcionários.
🟡 **Direção Escolar**: ao necessitar de relatórios estratégicos DRE e visão clara da margem financeira da instituição.

---

## 2. Personas-alvo

🟡 Referência completa em [`personas.md`](./personas.md). Resumo:

- **Gestor Financeiro / Tesouraria**: 🟡 Responsável pelo controle de receitas/despesas e pontualidade tributária/salarial. Sentia falta de DRE em tempo real e alertas prévios no calendário.
- **Gestor de Pessoas / RH**: 🟡 Responsável pela gestão de colaboradores, contratos, férias e histórico. Sentia falta de centralização documental e histórico funcional estruturado.

---

## 3. Métricas de sucesso

🟡 Indicadores mensuráveis para avaliação do projeto em 3 meses:

| Métrica | Unidade | Alvo | Prazo |
|---|---|---|---|
| 🟡 Pontualidade Tributária/Fiscal | Multas/Juros | 0 ocorrências de atraso | 3 meses |
| 🟡 Visibilidade de Margem (DRE) | Tempo de geração | Tempo real (instantâneo) | 1 mês |
| 🟡 Centralização no RH | % Colaboradores com dossiê | 100% dos funcionários | 2 meses |
| 🟡 Controle de Férias | Inconsistências de vencimento | 0 férias vencidas sem alerta | 3 meses |

---

## 4. Escopo (in)

🟡 Funcionalidades que integrarão a V1 dos módulos:

- 🟡 **Financeiro - Plano de Contas e Centros de Custo**: Estruturação flexível separando receitas/despesas por Educação Infantil, Fundamental e Técnico.
- 🟡 **Financeiro - Contas a Pagar e Receber**: Lançamento, categorização, controle de status (Pendente, Pago, Atrasado).
- 🟡 **Financeiro - Calendário e Alertas**: Visualização em calendário de compromissos fiscais, salariais e contas com disparo de alertas.
- 🟡 **Financeiro - DRE e Margens**: Relatório automático de Demonstração do Resultado do Exercício com margem de lucro/perda.
- 🟡 **RH - Dossiê do Colaborador**: Centralização de dados pessoais, contratuais, bancários e armazenamento de documentos.
- 🟡 **RH - Gestão de Férias**: Controle do período aquisitivo, agendamento e histórico de gozo de férias.
- 🟡 **RH - Histórico Funcional**: Registro de ocorrências (advertências, suspensões, elogios), promoções de cargo e gratificações.
- 🟡 **RH - Relatório de Folha de Pagamento**: Consolidação de valores e proventos para conferência e suporte ao pagamento.

---

## 5. Não-objetivos (out)

🟡 Recursos mantidos fora do escopo inicial da V1:

- 🟡 Emissão direta de Nota Fiscal Eletrônica (NF-e/NFS-e) via webservice de prefeituras.
- 🟡 Cálculo automatizado de rescisão trabalhista com homologação sindical complexa.
- 🟡 Integração por Webhook bancário em tempo real para liquidação de boletos (V1 usará controle e conciliação por status/extrato).

---

## 6. Restrições

🟡 Diretrizes arquiteturais, de compliance e prazo:

| Tipo | Descrição |
|---|---|
| 🟡 Técnica | Manter arquitetura unificada do projeto: Next.js 15 (App Router), Drizzle ORM, Supabase (PostgreSQL + RLS), Vitest. |
| 🟡 Segurança/RLS | Habilitar RLS em todas as tabelas novas do banco com trava de exclusão e log de auditoria (`audit_log`). |
| 🟡 Compliance | Respeitar LGPD no acesso aos dados pessoais de colaboradores (RH) e diretrizes trabalhistas (CLT/Convenção). |
| 🟡 Prazo | Entrega funcional estruturada para validação até o final do ciclo atual. |

---

## 7. Dependências externas

🟡 Serviços e componentes do ambiente:

- 🟡 Banco de dados Supabase PostgreSQL + Supabase Auth.
- 🟡 Sistema de storage Supabase para guarda de documentos escaneados dos colaboradores.

---

## 8. Riscos

🟡 Riscos mapeados e estratégias de mitigação:

| Risco | Impacto | Probabilidade | Mitigação proposta |
|---|---|---|---|
| 🟡 Complexidade na classificação por centro de custo | Médio | Média | Definir categorias padrão pré-cadastradas para Educação Infantil, Fundamental e Técnico. |
| 🟡 Acesso indevido a dados de remuneração/RH | Alto | Baixa | Aplicar políticas rígidas de RLS no Supabase e verificar `checkAuth()` em todas as Server Actions. |
| 🟡 Perda de prazos fiscais se alerta não for visto | Alto | Média | Destacar alertas críticos no dashboard principal do usuário financeiro. |

---

## 9. Critérios de aceite (alto nível)

🟡 Critérios de validação operacional:

- 🟡 **Dado** que o gestor financeiro acessa o calendário, **Quando** houver tributos a vencer nos próximos 7 dias, **Então** o sistema exibe alertas em destaque e permite consultar os detalhes da obrigação.
- 🟡 **Dado** que o gestor lança receitas e despesas, **Quando** gerar o relatório de DRE, **Então** o sistema exibe o resultado apurado com margem de lucro ou perda por segmento.
- 🟡 **Dado** que o gestor de RH acessa a ficha de um colaborador, **Quando** consultar a aba de férias ou histórico, **Então** o sistema exibe os períodos aquisitivos pendentes e os registros de advertências/promoções em timeline.

---

## Pendências de cobertura

🟡 Nenhuma pendência crítica. Todas as definições foram alinhadas com o padrão da aplicação existente.

---

Gerado por reversa-drafter em 2026-07-20T22:51:37-03:00
Fontes: ideation.md, personas.md

# Spec: RH Dossiê dos Colaboradores (Documentos, Folha e Contratos)

> Selo 🟡 PLANEJADO. Especificação técnica de comportamento (Spec-Driven Development).

**Versão:** 1.0
**Data:** 2026-07-20T22:52:51-03:00
**Autor:** reversa-spec-sdd
**Componente:** `rh-dossie-colaboradores`
**Status:** aprovado

---

## 1. Visão Geral e Objetivos
🟡 O componente `rh-dossie-colaboradores` centraliza todas as informações do corpo docente e funcionários da escola. Gerencia o cadastro estendido de Recursos Humanos, o repositório seguro de documentos digitais (contratos, diplomas, ASOs, autorizações) e a geração de relatórios de apoio ao processamento da folha salarial.

---

## 2. Requisitos Funcionais

- 🟡 **RF-01 (Dossiê e Dados do Colaborador)**: O sistema deve permitir visualizar e gerenciar o perfil completo do colaborador, incluindo cargo, jornada semanal, salario base, dados bancarios e dependentes.
- 🟡 **RF-02 (Gestão de Documentos Digitais)**: O sistema deve permitir o envio e armazenamento de arquivos digitais (PDF, imagens) associados ao colaborador, categorizados por tipo (RG/CPF, Carteira de Trabalho, Diploma, ASO, Contrato).
- 🟡 **RF-03 (Controle de Validade de Documentos)**: O sistema deve permitir registrar a data de validade de exames médicos (ASO) e alvarás, emitindo alertas quando estiverem próximos do vencimento.
- 🟡 **RF-04 (Relatório de Apoio à Folha)**: O sistema deve consolidar em formato de relatório os valores de salário base, gratificações, adicionais e descontos cadastrados para conferência da folha de pagamento.

---

## 3. Comportamento e Fluxos

- 🟡 **Fluxo de Upload de Documento**:
  1. O usuário de RH acesa a aba "Documentos" no dossiê do colaborador.
  2. Seleciona o tipo de documento, data de emissão/validade e faz o upload do arquivo.
  3. O sistema envia o arquivo para o storage seguro (Supabase Storage) e grava a referência no banco com permissão restrita.
- 🟡 **Fluxo de Consulta da Folha**:
  1. O usuário acessa a opção "Relatório de Folha de Pagamento".
  2. Seleciona o mês de referência.
  3. O sistema gera a listagem de todos os funcionários ativos com vencimentos, adicionais e conta bancária para depósito.

---

## 4. Non-Goals (Fora de Escopo)

- 🟡 Cálculo automático de alíquotas complexas de INSS/IRRF ou geração direta de arquivos de remessa bancária da folha (V1 fornece dados consolidados para conferência).
- 🟡 Emissão automática de holerites em PDF assinados digitalmente.

---

## 5. Edge Cases e Tratamento de Erros

- 🟡 **EC-01 (Upload de arquivo corrompido ou formato inválido)**: O sistema deve rejeitar arquivos fora dos formatos permitidos (PDF, PNG, JPG) ou superiores ao limite de tamanho (10MB).
- 🟡 **EC-02 (Acesso por usuários não autorizados)**: As rotas e ações do dossiê de RH devem ser protegidas por `checkAuth()` e RLS, bloqueando usuários com perfil comum de secretaria ou professor.

---

## 6. Critérios de Aceite

- 🟡 **Dado** que o gestor de RH envia o ASO periódico de um professor, **Quando** cadastra a validade para 12 meses, **Então** o documento é salvo com sucesso e o status da ficha de saúde fica verde.
- 🟡 **Dado** que um usuário sem permissão de RH tenta acessar a rota de dados salariais, **Quando** a requisição chega à Server Action, **Então** o acesso é negado com erro de autorização.

---

## 7. Relatório de Avaliação SDD

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORE TOTAL: 91/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Breakdown:
  Completude:    90/100 (peso 30%)
  Testabilidade: 95/100 (peso 25%)
  Clareza:       90/100 (peso 20%)
  Escopo:        90/100 (peso 15%)
  Edge Cases:    85/100 (peso 10%)

Gaps críticos:
  - Nenhum gap crítico.

Sugestões:
  1. Adicionar futuramente assinatura eletrônica de documentos do contrato.
```

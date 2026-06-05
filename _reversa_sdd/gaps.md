# Análise de Lacunas (Gaps) — secretaria CSM - educação Básica

> Gerado pelo Revisor em 2026-06-03
> Metodologia: Reversa Framework (doc_level = completo)
> Status: ✅ Revisão de Lacunas Concluída

Este documento lista todas as lacunas (gaps) técnicas identificadas entre o Software Design Document (SDD) e a implementação atual do código, com o status após a validação do usuário.

---

## 1. Módulo de Cadastros (Pessoas)

### Lacuna: Funcionalidade de Exclusão (RESOLVIDO)
* **Descrição:** O sistema possui rotas e Server Actions de CRUD de pessoas, porém não há opção de exclusão na UI ou no backend.
* **Resolução:** Aprovado modelo de exclusão controlada. Será criada a tabela `audit_log` para registrar logs permanentes de exclusões feitas por usuários com perfil administrativo autorizado.
* **Ação:** Criar tabela `audit_log` e implementar ações de delete associadas com verificação de integridade e preenchimento de log.

### Lacuna: Dados Complementares (Aluno e Funcionário) (PENDENTE)
* **Descrição:** O SDD cita a criação de tabelas ou campos para dados complementares específicos (`dados_aluno`, `dados_funcionario`). Atualmente, todos os dados residem na tabela genérica `pessoa`.
* **Status:** Pendente de expansão futura.
* **Evidência no Código:** Tabelas não criadas em `src/db/schema.ts`.

---

## 2. Módulo Pedagógico

### Lacuna: Relacionamento de Turma com Ano Letivo (PENDENTE)
* **Descrição:** No schema Drizzle, a tabela `turma` não possui a FK `ano_letivo_id`. No entanto, no diagrama do SDD (Seção 3.4) e nas necessidades escolares, a turma é intrinsecamente vinculada a um Ano Letivo.
* **Status:** Crítico. Necessário adicionar `anoLetivoId` na tabela `turma`.
* **Evidência no Código:** `src/db/schema.ts` (linhas 141-151, tabela `turma` sem a FK).

### Lacuna: Enum de Situação da Turma (Desativação) (RESOLVIDO)
* **Descrição:** A tabela `turma` utiliza um campo `ativa: boolean`. O usuário solicitou uma forma de desativar turmas entre anos letivos.
* **Resolução:** Acatada a alteração do campo `ativa: boolean` na tabela `turma` para um enum `situacao_turma` (`aberta`, `em_andamento`, `encerrada`, `cancelada`).
* **Ação:** Alterar o tipo da coluna no schema Drizzle e atualizar as referências do frontend.

### Lacuna: Tabelas de Cursos Técnicos e Módulos (RESOLVIDO / POSTERGADO)
* **Descrição:** As tabelas `curso_tecnico` e `modulo_curso` para a gestão do Ensino Técnico (ex: Enfermagem) não foram criadas.
* **Resolução:** Postergado para a Fase 2/3. O MVP deve focar exclusivamente no Infantil e Fundamental.
* **Ação:** Sem ações de banco imediatas.

### Lacuna: Grade Curricular e Salas (PENDENTE)
* **Descrição:** As tabelas `grade_curricular` e `sala` citadas no SDD estão ausentes.
* **Status:** Moderado/Baixo. A tabela `quadro_horario` existe, mas não se relaciona com `grade_curricular` ou `sala`.

---

## 3. Módulo Secretaria

### Lacuna: Tabela de Contratos Escolares (RESOLVIDO)
* **Descrição:** A tabela `contrato_escolar` é descrita no SDD e o usuário solicitou uma regra de encerramento automático. O banco não possui essa tabela.
* **Resolução:** Aprovado o uso de lazy evaluation no backend. Ao carregar a página da secretaria ou consultar o contrato, se a `dataVigenciaFim` estiver no passado, o contrato é tratado como encerrado.
* **Ação:** Criar a tabela `contrato_escolar` no banco e implementar a regra no resolver/Server Action de busca.

### Lacuna: Tabela de Documentos Gerados (RESOLVIDO)
* **Descrição:** A coordenação solicitou um painel de emissão de documentos. A tabela `documento_gerado` para registrar o histórico e hash das emissões não existe.
* **Resolução:** Aprovada a criação da tabela `documento_gerado` contendo `hash_verificacao` de segurança (SHA256) e logs de emissão dos documentos pela coordenação, auditável por logs.
* **Ação:** Criar tabela `documento_gerado` e implementar infraestrutura básica de PDF + rota pública de verificação de autenticidade por hash.

### Lacuna: Histórico Escolar e Ocorrências (PENDENTE)
* **Descrição:** As tabelas `historico_escolar` e `ocorrencia_aluno` não foram desenvolvidas.
* **Status:** Moderado. Necessárias para o fechamento do ano letivo e controle pedagógico.

---

## 4. Módulo Diário de Classe

### Lacuna: Tabela de Médias de Período (`media_periodo`) (PENDENTE)
* **Descrição:** Tabela para cachear a média do bimestre/trimestre e frequência consolidada de cada matrícula.
* **Status:** Moderado. Atualmente as faltas e médias são calculadas em tempo de execução nas queries, mas o cache facilitará a emissão de boletins rápidos.
* **Evidência no Código:** Ausência no schema.

# Relatório de Confiança — Sistema de Gestão Escolar (Secretaria CSM)

> Gerado pelo Revisor em 2026-06-03
> Metodologia: Reversa Framework (doc_level = completo)
> Status: ✅ Revisão de Lacunas Concluída

---

## Resumo Geral

| Nível | Quantidade | Percentual |
|-------|-----------|------------|
| 🟢 CONFIRMADO | 23 | 69.7% |
| 🟡 INFERIDO   | 0 | 0.0% |
| 🔴 LACUNA     | 10 | 30.3% |
| **Total**     | 33 | 100% |

**Confiança geral:** **69.7%** (soma de 🟢 + metade dos 🟡)

---

## Por Módulo (Unit)

| Módulo | 🟢 CONFIRMADO | 🟡 INFERIDO | 🔴 LACUNA | Confiança |
|--------|--------------|-------------|-----------|-----------|
| `cadastros` | 6 | 0 | 1 | 85.7% |
| `pedagogico` | 8 | 0 | 4 | 66.6% |
| `secretaria` | 4 | 0 | 3 | 57.1% |
| `diario` | 5 | 0 | 2 | 71.4% |

---

## Lacunas Pendentes 🔴

Itens que permaneceram sem confirmação e serão tratados no roadmap de desenvolvimento:

### Cadastros
- **Dados Extras (Aluno/Funcionário)** — Ausência das tabelas auxiliares `dados_aluno` e `dados_funcionario` para armazenar informações específicas que não cabem em `pessoa`.

### Pedagógico
- **Grade Curricular** — A tabela `grade_curricular` para vincular disciplinas a séries de forma permanente.
- **Salas** — Tabela `sala` para localização de turmas e horários.
- **Filtro de Ano Letivo na Turma** — A tabela `turma` não possui relacionamento (`anoLetivoId`) direto com a tabela `ano_letivo` no banco de dados.

### Secretaria
- **Histórico Escolar** — Tabela `historico_escolar` para consolidação anual.
- **Ocorrências** — Tabela `ocorrencia_aluno` para registros disciplinares.
- **Exclusão de Matrículas/Anos Letivos** — Definição das regras de restrição para estes registros específicos.

### Diário de Classe
- **Médias de Período** — A tabela `media_periodo` para armazenamento de notas consolidadas e faltas periódicas.
- **Automação de Recuperação** — Algoritmo de aplicação da fórmula de recuperação de médias no backend.

---

## Histórico de Reclassificações

| De | Para | Afirmação | Evidência / Resposta |
|----|------|-----------|-----------|
| 🔴 | 🟢 | **Exclusão de Registros** | Usuário validou criação da tabela `audit_log` (somente gravação) com restrição de perfil administrativo ao invés de exclusão física direta ou soft-delete genérico. |
| 🔴 | 🟢 | **Encerramento de Contratos** | Usuário optou por lazy evaluation no backend ao consultar registros. |
| 🔴 | 🟢 | **Situação da Turma** | Aprovada a alteração do campo `ativa: boolean` para o enum `situacao_turma` (`aberta`, `em_andamento`, `encerrada`, `cancelada`). |
| 🔴 | 🟢 | **Emissão de Documentos** | Aprovada a criação da tabela `documento_gerado` como log de auditoria de emissão, com hash de validação simples. |
| 🔴 | 🟢 | **Cursos Técnicos / Módulos** | Usuário instruiu adiar a modelagem do Técnico para fases futuras, focando no Infantil e Fundamental. |

---

## Recomendações Técnicas

### 🛡️ Recomendação de Autenticidade de Documentos: Hash SHA256 vs Blockchain

O usuário questionou sobre o uso de **blockchain** para garantir a autenticidade dos documentos emitidos (como declarações e históricos).

> [!IMPORTANT]
> **Recomendação do Revisor:** **Não utilizar Blockchain para este cenário.**
> A escola é a única fonte de verdade (Single Source of Truth) e autoridade emissora dos documentos. O uso de blockchain introduziria complexidade de infraestrutura desnecessária, custos de transação (gas fees) e latência de rede.
>
> **Abordagem Proposta (Hash Criptográfico):**
> 1. Na geração de um documento, o backend calcula um hash SHA256 único a partir dos dados do aluno, tipo de documento, data e uma chave secreta (salt) do servidor.
> 2. Salvamos esse hash na tabela `documento_gerado`.
> 3. Imprimimos no rodapé do documento um **QR Code** apontando para uma URL pública da secretaria (ex: `secretaria.csm.edu.br/validar/[HASH]`).
> 4. Qualquer pessoa externa (ex: outra escola ou faculdade) escaneia o QR Code e acessa a página pública que pesquisa o hash no banco de dados e exibe: *"Documento Autêntico emitido para [Aluno] em [Data]"*.
>
> Esta solução é segura, tem custo zero e tempo de desenvolvimento extremamente baixo.

### 📝 Ordem de Ação de Engenharia (Roadmap Técnico)

1. **Ajuste de Schema (Drizzle):**
   - Criar a tabela `audit_log` com os campos `id`, `usuarioId`, `acao` (enum: delete, insert, update), `tabela`, `registroId`, `dadosAntigos` (jsonb), `motivo` e `createdAt`.
   - Modificar a tabela `turma`: remover `ativa: boolean`, adicionar enum `situacao_turma` e adicionar `anoLetivoId` vinculando a `ano_letivo.id` (restrict).
   - Criar a tabela `contrato_escolar` com os campos básicos de vigência e status.
   - Criar a tabela `documento_gerado` com os campos de histórico, tipo de documento e `hashVerificacao`.
2. **Atualização das Server Actions:**
   - Adicionar validações de perfil administrativo nos Server Actions antes de realizar operações de gravação de log.
   - Atualizar a Server Action de busca de contrato para aplicar lazy evaluation de encerramento se a data atual for posterior à data de vigência fim.

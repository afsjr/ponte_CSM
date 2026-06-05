# Perguntas para Validação — secretaria CSM - educação Básica

> Gerado pelo Revisor em 2026-06-03 Responda cada pergunta preenchendo o campo
> **Resposta** e me avise quando terminar (basta digitar `reversa`).

---

## Pergunta 1

**Contexto:** Exclusão de Registros / Política de Dados (`PROJECT_STATE.md` vs
Demanda do Usuário) **Spec afetada:** `_reversa_sdd/cadastros/requirements.md`,
`_reversa_sdd/pedagogico/requirements.md` **Pergunta:** Como deve funcionar a
exclusão de registros na prática (Turmas, Pessoas, Diários)? O
`PROJECT_STATE.md` restringe deletar dados ("NO soft-delete or hard-delete
algorithms. ALL deletions are manual..."). Sugerimos implementar uma tabela
`audit_log` para registrar as exclusões (quem deletou, quando e o motivo) e
permitir exclusão física no banco apenas se não houver registros vinculados (ex:
não deletar turma com alunos matriculados). Você aprova essa modelagem ou
prefere uma abordagem de soft-delete (ex: campo `deletado: boolean`)?
**Impacto:** Se aprovado, criaremos a tabela `audit_log` e as regras de exclusão
controlada com logs permanentes de auditoria.

**Status:** ✅ Respondida

**Resposta:** a tabela de audit_log deve ser sempre criada e alimentada como um
grande livro de registros que só grava e nunca apaga. ao invés de deletar
direto, criar perfil de autorização .<!-- preencha aqui -->


---

## Pergunta 2

**Contexto:** Encerramento Automático de Contratos (`src/db/schema.ts` e Módulo
Secretaria) **Spec afetada:** `_reversa_sdd/secretaria/requirements.md`
**Pergunta:** Como o sistema deve gerenciar e disparar a mudança de status do
contrato para `encerrado` quando atingida a `dataVigenciaFim`? Prefere que
façamos uma checagem em tempo de leitura/lazy evaluation (ao consultar o
contrato no frontend, verificamos a data e atualizamos se necessário) ou que
configuremos um job periódico (ex: pg_cron no Supabase) rodando diariamente?
**Impacto:** A lazy evaluation é mais simples, 100% segura e livre de
infraestrutura extra. O cron job é assíncrono e mantém o banco atualizado em
segundo plano mesmo sem acessos, mas requer privilégios e configuração de banco.

**Status:** ✅ Respondida

**Resposta:** aplique a lazy evaluation sugerida<!-- preencha aqui -->


---

## Pergunta 3

**Contexto:** Situação da Turma (`src/db/schema.ts` -> tabela `turma`) **Spec
afetada:** `_reversa_sdd/pedagogico/design.md` **Pergunta:** Na desativação de
uma turma de um ano para o outro, você aprova alterar o campo `ativa: boolean`
na tabela `turma` para um enum `situacao_turma`? Os valores propostos são:
`aberta` (criada, aceita matrículas), `em_andamento` (período letivo ativo),
`encerrada` (ano letivo concluído, somente leitura) e `cancelada` (turma que não
abriu por falta de alunos). **Impacto:** Esta alteração permite desativar turmas
("encerrada") preservando o histórico de anos anteriores sem risco de alterações
acidentais.

**Status:** ✅ Respondida

**Resposta:** sugestão acatada<!-- preencha aqui -->


---

## Pergunta 4

**Contexto:** Emissão de Documentos (Módulo Secretaria e Coordenação) **Spec
afetada:** `_reversa_sdd/secretaria/requirements.md` **Pergunta:** Quais são os
tipos de documentos que a Coordenação precisa emitir inicialmente? (Ex:
Declaração de Matrícula, Boletim Escolar, Histórico Escolar). Além disso, os
documentos precisam de um hash de autenticidade (para validação externa via link
público) ou apenas a geração simples de PDF para impressão/download é suficiente
para o MVP? **Impacto:** Se necessitar de validação externa, criaremos um campo
`hash_verificacao` em `documento_gerado` e uma página pública de validação de
documentos sem necessidade de login.

**Status:** ✅ Respondida

**Resposta:** assim como temos os logs de auditoria de deletação, podemos ter os
de geração de documentos. tem alguma outra sugestão que gostaria que fosse feita
para este módulo antes de prosseguirmos? tipo um blockchain ?
<!-- preencha aqui -->


---

## Pergunta 5

**Contexto:** Mapeamento de Cursos e Módulos Técnicos
(`docs/historico_ia/plano_de_implementacao.md` seção 3.4) **Spec afetada:**
`_reversa_sdd/pedagogico/design.md` **Pergunta:** A estrutura de `curso_tecnico`
e `modulo_curso` (mencionada no diagrama do SDD) deve ser criada no banco de
dados agora na Fase 1 (MVP) ou podemos focar nas Séries regulares (Educação
Infantil e Ensino Fundamental), deixando a estrutura do Colégio Técnico para a
Fase 2/3? **Impacto:** Se criarmos agora, adicionaremos as tabelas
`curso_tecnico` e `modulo_curso` e seus relacionamentos no schema Drizzle.

**Status:** ✅ Respondida

**Resposta:** deixe o técnico e módulo cursos para fase posterior, focando
apenas no infantil e fundamental depois vamos tentar implementar o técnico e os
módulos ou integrar a outra IA que está fazendo o técnico <!-- preencha aqui -->


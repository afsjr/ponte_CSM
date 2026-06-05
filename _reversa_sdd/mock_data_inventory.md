# Inventário de Dados de Teste e Mocks

Este documento lista todas as tabelas, IDs fixos e dados simulados criados e utilizados durante a fase de desenvolvimento e teste das novas funcionalidades (como o **Portal do Responsável** e o **Mural de Avisos**). Use este inventário como guia para limpar o banco de dados antes da fase de testes de usuário ou da implantação em produção.

---

## 1. Mocks de Código (Simulação de Ambiente)

### 1.1. Usuário de Desenvolvimento Padrão (Mock Auth)
No arquivo [responsavel.ts](file:///Users/itouch/Documents/projetos_escola/secretaria_csm_tecnico/secretaria%20CSM%20-%20educa%C3%A7%C3%A3o%20B%C3%A1sica/src/actions/responsavel.ts), a função `checkAuth` simula um usuário administrador caso não exista um token ativo no Supabase Auth e o ambiente seja `development`:
*   **ID do Usuário**: `00000000-0000-0000-0000-000000000000`
*   **E-mail**: `dev@mock.com`

> [!WARNING]
> Certifique-se de que a variável de ambiente `NODE_ENV` esteja configurada como `'production'` no deploy final para que essa brecha de segurança seja desativada de forma permanente.

### 1.2. Simulador do Portal das Famílias
Na página [page.tsx](file:///Users/itouch/Documents/projetos_escola/secretaria_csm_tecnico/secretaria%20CSM%20-%20educa%C3%A7%C3%A3o%20B%C3%A1sica/src/app/(portal)/responsavel/page.tsx), há uma barra de debug (`Simulador do Portal`) visível apenas em `development` que permite alternar a visualização por qualquer pessoa classificada como `responsavel` no banco. Ela é desativada automaticamente no ambiente de produção.

---

## 2. Tabelas com Dados de Teste (Supabase)

As tabelas listadas a seguir contêm dados inseridos manualmente para testes locais ou gerados durante simulações e devem ser limpas antes do início dos testes de usuários reais.

### 2.1. `mural_aviso`
*   **Tipo de dado**: Comunicados da escola para os responsáveis/alunos.
*   **O que limpar**: Todos os avisos de teste criados através da aba de "Comunicados" da Secretaria.
*   **Ação**: Remover registros onde `titulo` ou `conteudo` forem fictícios ou contiverem emojis e textos de testes.

### 2.2. `aviso_ciente`
*   **Tipo de dado**: Confirmações de leitura individualizadas por filho feitas pelos responsáveis.
*   **O que limpar**: Toda a tabela deve ser zerada antes do início de produção para que não haja ciências residuais.
*   **Ação**: `TRUNCATE TABLE aviso_ciente CASCADE;`

### 2.3. `vinculo_responsavel_aluno`
*   **Tipo de dado**: Relacionamento físico de parentesco/tutoria de responsável financeiro e de retirada com o aluno.
*   **O que limpar**: Relacionamentos cadastrados na aba "Vínculos" para associar pessoas fictícias a alunos.
*   **Ação**: Remover registros fictícios criados para conectar responsáveis e alunos simulados.

### 2.4. `ocorrencia_aluno`
*   **Tipo de dado**: Ocorrências pedagógicas (como a lançada na estudante "maria").
*   **O que limpar**: Ocorrências criadas na ficha do aluno para testar a visualização de conduta no Portal das Famílias.
*   **Ação**: Excluir observações pedagógicas que contêm conteúdo de teste.

### 2.5. `pessoa` e `pessoa_classificacao`
*   **Tipo de dado**: Cadastros base de pessoas e suas funções (Alunos, Professores, Responsáveis).
*   **O que limpar**: Pessoas simuladas que foram criadas para atuar como responsáveis de teste.
*   **Ação**: Limpar pessoas de teste (como perfis criados sem CPF real ou para simulação de vínculos) e suas respectivas classificações.

---

## 3. Script SQL para Limpeza Seletiva (Rascunho)

Para limpar rapidamente os registros gerados na fase de desenvolvimento sem excluir a estrutura essencial do sistema (tabelas e metadados de disciplinas da BNCC), o seguinte script SQL pode ser utilizado no console do Supabase:

```sql
-- 1. Remover confirmações de leitura (cientes) de teste
TRUNCATE TABLE "aviso_ciente" CASCADE;

-- 2. Remover comunicados do mural criados para testes
TRUNCATE TABLE "mural_aviso" CASCADE;

-- 3. Remover vínculos familiares cadastrados para teste
TRUNCATE TABLE "vinculo_responsavel_aluno" CASCADE;

-- 4. Opcional: Remover ocorrências pedagógicas de teste
-- DELETE FROM "ocorrencia_aluno" WHERE data < CURRENT_DATE;
```

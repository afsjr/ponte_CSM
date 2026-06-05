# Tarefas de Implementação: Fase 1 (MVP)

Acompanhamento do desenvolvimento do Sistema de Gestão Escolar.

## 1. Setup e Infraestrutura
- `[x]` Configurar projeto Next.js (App Router, Tailwind, TypeScript)
- `[x]` Configurar Supabase Client e tipos de banco de dados
- `[x]` Implementar schema inicial do banco de dados (Drizzle ORM ou Supabase SQL)
- `[x]` Criar tabelas core: `pessoa`, `pessoa_classificacao`, `anexo`
- `[x]` Configurar Supabase Auth (Login/Logout)
- `[x]` Implementar RBAC e Row Level Security (RLS) básico

## 2. Módulo de Cadastros
- `[x]` UI/UX: Layout base do painel (Sidebar, Header, Breadcrumbs)
- `[x]` Implementar TDD: Testes unitários para entidade Pessoa
- `[x]` Backend: API Routes / Server Actions para gestão de Pessoa
- `[x]` UI: Tela de Listagem de Pessoas (filtros, paginação)
- `[x]` UI: Formulário de Cadastro (Abas: Dados Pessoais, Endereço, Contato, Dados Bancários)
- `[ ]` Integrações específicas por classificação (Aluno, Funcionário, Responsável, Fornecedor)

## 3. Módulo Pedagógico
- `[ ]` Tabelas e CRUD: Nível de Ensino, Série, Turma, Disciplina
- `[ ]` Tabelas e CRUD: Cursos Técnicos (estruturas e módulos independentes)
- `[ ]` Fluxo de Matrícula (vínculo Turma <-> Aluno)
- `[ ]` Regras de Avaliação: Numérica (0-10, arredondamentos) vs Conceitual (Ed. Infantil)
- `[ ]` Regras de Recuperação e Média
- `[ ]` Diário de Classe e Frequência (regra de 75% mínimo)
- `[ ]` UI: Lançamento de notas e faltas pelo Professor

## 4. Módulo de Secretaria
- `[ ]` Tabelas e CRUD: Contrato Escolar
- `[ ]` Lógica de arquivamento/exportação (CSV/Excel/JSON/PDF)
- `[ ]` Geração de Histórico Escolar e Boletim (templates base)
- `[ ]` Módulo de Ocorrências (registros disciplinares/administrativos)

## 5. Qualidade e Segurança
- `[ ]` Configurar alertas para LGPD e políticas genéricas
- `[ ]` Auditoria (Log system para remoção manual)
- `[ ]` Testes E2E dos fluxos principais

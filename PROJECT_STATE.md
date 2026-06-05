# PROJECT_STATE & LEDGER
**Project**: Sistema de Gestão Escolar (Secretaria CSM - Educação Básica)
**Vision**: Plataforma unificada para secretaria, professores, financeiro e RH, substituindo gradualmente o sistema legado (Sponte).
**Stack**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL + Auth + Storage), Drizzle ORM.

## 🔴 NON-NEGOTIABLE RULES (AI INSTRUCTIONS)
1. **Data Retention**: NO soft-delete or hard-delete algorithms. ALL deletions are manual, require an audit trail, and prior data export.
2. **Pedagogy (Fundamental/Técnico)**: Notas numéricas (0-10) arredondadas no 0.5 mais próximo.
3. **Pedagogy (Infantil)**: Avaliação conceitual (rubricas e habilidades).
4. **Attendance**: Aprovação exige >= 75% de presença.
5. **Recovery**: Cálculo de recuperação = (Média Anterior + Nota Recuperação) / 2.
6. **Architecture**: Alta coesão, baixo acoplamento. Camada de acesso a dados isolada no Drizzle.
7. **AI Security (Prompt Injection)**: O projeto prevê um cenário "híbrido inteligente". Qualquer entrada de usuário ou integração com LLM deve ser estritamente sanitizada. Instruções e dados do usuário devem trafegar separadamente (ex: Structured Outputs, guardrails, role system) para mitigar tentativas de Prompt Injection. Jamais executar código ou query SQL gerada dinamicamente por input do usuário/IA sem validação estrita.

## 🤖 MULTI-AGENT SYNCHRONIZATION RULES
Para garantir que múltiplos agentes de IA trabalhem em paralelo neste repositório sem causar conflitos (Merge Conflicts ou corrupção de banco), as seguintes regras aplicam-se a QUALQUER IA:
1. **Separação de Domínios (Bounded Contexts):** Verifique em qual módulo você deve atuar e NÃO altere arquivos de UI ou Server Actions de outros domínios.
2. **Locking do Schema (`src/db/schema.ts`):** Antes de alterar o banco, LEIA o `schema.ts`. Adicione suas tabelas sem alterar as existentes. O comando `npx drizzle-kit push` só deve ser rodado se você tiver certeza de que outro agente não está rodando no mesmo milissegundo.
3. **Comunicação via Ledger:** Registre blocos no `PROJECT_STATE.md` com a flag `[WIP]` se estiver executando uma tarefa demorada.
4. **Comunicação Inter-Agentes:** Usem o arquivo `docs/historico_ia/sync/AGENT_SYNC.md` como Chat Log assíncrono. Registrem lá o que terminaram ou o que vão começar, para servir de debug trail em caso de quebra do sistema.
5. **Dependências Globais:** Não altere o `layout.tsx` global ou configurações do `tailwind.config.ts` se outro agente for ser afetado sem antes propor num arquivo separado ou consultar o estado atual.

---

## ⛓️ PROGRESS LEDGER (Append-Only)

**[BLOCK 000 - 2026-06-02] - Ideation & Architecture**
- Definido escopo Fase 1 (MVP: Setup, Cadastros Core, Pedagógico, Secretaria).
- Estimativa de custo e arquitetura Híbrida Inteligente aprovada (Supabase Pro).

**[BLOCK 001 - 2026-06-02] - Next.js Foundation**
- Repositório inicializado: Next.js 15, React 19, Tailwind CSS.
- Pacotes instalados: drizzle-orm, postgres, @supabase/supabase-js, @supabase/ssr, lucide-react.

**[BLOCK 002 - 2026-06-02] - Supabase Client Setup**
- Utilitários SSR criados em `src/lib/supabase/` (`client.ts`, `server.ts`, `middleware.ts`).
- Middleware root configurado para refresh automático de sessão.

**[BLOCK 003 - 2026-06-02] - Database Schema (Core)**
- `drizzle.config.ts` configurado com `dotenv`.
- Schema base (`src/db/schema.ts`) criado:
  - Enums (situacao_pessoa, genero, estado_civil, tipo_classificacao, etc).
  - Tabelas: `pessoa`, `pessoa_classificacao`, `endereco`, `contato`, `anexo`.
- Migração via `drizzle-kit push` concluída. Banco Supabase está vivo.

**[BLOCK 004 - 2026-06-02] - Security & Auth**
- Utilitários de Login e Logout (`actions.ts`) com `signInWithPassword`.
- Rota de Auth `/login` construída. Middleware configurado para redirecionar não-autenticados.
- RLS (Row Level Security) habilitado em todas as tabelas (Script em `scripts/setup_rls.ts`).
- Políticas aplicadas: `authenticated` role pode acessar dados; DELETES totalmente bloqueados no DB.

**[BLOCK 005 - 2026-06-02] - Core Backend & TDD**
- Criada suíte de testes Vitest configurada para rodar localmente no Node.
- Testes unitários para `createPessoa` implementados usando Mock do DB (`vi.mock('@/db')`).
- Implementado `src/actions/pessoa.ts` contendo as funções do CRUD via Server Actions (`createPessoa`, `getPessoas`, `updatePessoa`). Todas utilizando transações seguras e retornando estado limpo. Nenhuma exclusão permitida.

**[BLOCK 006 - 2026-06-02] - Pessoas List UI**
- Criados componentes cliente (`SearchInput` com debounce, `Pagination`) em `src/components/ui/`.
- Desenvolvida a página Server Component `src/app/(dashboard)/cadastros/pessoas/page.tsx`.
- Integrou a API de paginação e pesquisa SSR (Server-Side Rendering) com o Supabase/Drizzle.

**[BLOCK 007 - 2026-06-02] - Formulário de Cadastro**
- Criada a página de inclusão `/cadastros/pessoas/novo`.
- Componente Client-side `PessoaForm.tsx` implementado utilizando arquitetura em Abas (Tabs).
- Integrado diretamente com a Server Action `createPessoa` (Transação atômica que cadastra a pessoa e as classificações selecionadas).

**[BLOCK 008 - 2026-06-02] - Base do Módulo Pedagógico (Agente 1)**
- Atualizado `src/db/schema.ts` com as tabelas NivelEnsino, Serie, Disciplina e Turma, além do enum `turno`.
- Criada a tela inicial do Módulo Pedagógico em `src/app/(dashboard)/pedagogico/page.tsx`.
- Tentativa de rodar `drizzle-kit push` encontrou erro de parse do Drizzle com constraints do Supabase.

**[BLOCK 009 - 2026-06-02] - Expansão do Cadastro (Endereço e Contato) (Agente 1)**
- Atualizada a Server Action `createPessoa` (`src/actions/pessoa.ts`) para receber, validar e persistir `endereco` e `contatos` atrelados à pessoa na mesma transação atômica.
- Formulário (`PessoaForm.tsx`) expandido com abas de "Endereço" e "Contato", com state unificado no lado do cliente.

**[BLOCK 010 - 2026-06-02] - CRUD do Módulo Pedagógico (Agente 2)**
- Criado arquivo `src/actions/pedagogico.ts` com as Server Actions de CRUD para Nível de Ensino, Série, Turma e Disciplina.
- Refatorado `src/app/(dashboard)/pedagogico/page.tsx` para apresentar um sistema de Abas (Tabs) para gerenciar o módulo.
- Criados componentes Client-side em `src/app/(dashboard)/pedagogico/components/`:
  - `PedagogicoTabs.tsx` (Gerenciador de Abas)
  - `NivelEnsinoTab.tsx` (CRUD visual Nível)
  - `SerieTab.tsx` (CRUD visual Série vinculada ao Nível)
  - `TurmaTab.tsx` (CRUD visual Turma vinculada à Série e enum Turno)
  - `DisciplinaTab.tsx` (CRUD visual Disciplina)
- Código tipado validado via `npx tsc` (nenhum erro de TS).

**[BLOCK 011 - 2026-06-02] - Setup Módulo Secretaria (Agente 3)**
- Adicionadas as tabelas `ano_letivo` e `matricula` ao `src/db/schema.ts` com seus respectivos Enums (`status_matricula`, `motivo_saida`).
- Executado `drizzle-kit generate` e aplicado com sucesso via `scripts/migrate.ts` (Incluindo também `turma_docente` do Agente 2).
- RLS configurado e ativado para `turma_docente`, `ano_letivo` e `matricula` no `scripts/setup_rls.ts`.
- Logs de sincronia e estado atualizados em `AGENT_SYNC.md` e `PROJECT_STATE.md`.

**[BLOCK 012 - 2026-06-02] - UI de Associação Docente (Agente 2)**
- Adicionada tabela `turmaDocente` ao `schema.ts`.
- Criadas Server Actions em `src/actions/pedagogico.ts` para alocar e gerenciar professores (`alocarProfessorTurma`, `getProfessoresTurma`, etc).
- Desenvolvido `TurmaProfessoresModal.tsx` e integrado no `TurmaTab.tsx` para gerenciar a vinculação Professor/Disciplina na Turma via interface.

**[BLOCK 013 - 2026-06-02] - Módulo da Secretaria (Agente 3)**
- Criada a Server Action `src/actions/secretaria.ts` para operações em `ano_letivo` e `matricula`.
- Construída a rota `/secretaria` com `SecretariaTabs.tsx` replicando a interface padrão.
- Adicionado `AnoLetivoTab.tsx` para gerenciar calendário e `MatriculaTab.tsx` para efetuar matrículas (vínculo Aluno <-> Turma <-> Ano Letivo).
- Telas completas, responsivas e conectadas ao DB via Drizzle.

**[BLOCK 014 - 2026-06-02] - Refinamento Dashboard (Agente 2)**
- Dashboard inicial (`/page.tsx`) atualizado. Agora extrai métricas dinâmicas do banco de dados usando Drizzle em Server Components para exibir total de alunos cadastrados, matrículas ativas, turmas ativas e funcionários.

**[BLOCK 015 - 2026-06-02] - Base de Dados Diário de Classe (Agente 3)**
- Construída a base de dados do Diário de Classe (Notas e Frequência).
- Adicionadas as tabelas `periodo_avaliativo`, `avaliacao`, `nota`, `diario_classe` e `frequencia_aluno` ao `src/db/schema.ts`.
- Criada e aplicada a migração com `drizzle-kit generate` e `scripts/migrate.ts`.
- Adicionadas as novas tabelas ao `scripts/setup_rls.ts` e configuradas as políticas de RLS para as mesmas.
- Criadas as Server Actions iniciais em `src/actions/diario.ts` para realizar operações CRUD nas tabelas de Diário de Classe.

**[BLOCK 016 - 2026-06-03] - Regras Pedagógicas e Rodada Profunda de Testes**
- **Regras Pedagógicas (Fase 3):** Implementada a Action `getTurmaMediaEStatus` e utilitários de arredondamento de notas escolares (limiar de 0.5) e fórmulas de recuperação final.
- **Interface Diário de Classe:** Modificados `NotasPanel.tsx` e `FrequenciaPanel.tsx` para apresentar média final, percentual de frequências em tempo real e habilitar áreas de texto conceituais abertas para o nível Infantil.
- **Vitest & Mocks de Next.js**: Corrigido o mock de cookies do Next.js/Supabase e adicionada suíte unitária (`pedagogico.test.ts`) e de integração para as Server Actions do Diário (`diario.test.ts`). Todos os 14 testes estão verdes.

**[BLOCK 021 - 2026-06-03] - Auditoria de RLS e Guardrails de Segurança**
- **Row-Level Security (RLS)**: Identificado e corrigido que `funcionario_habilitacao`, `quadro_horario` e `aee_prontuario` estavam sem políticas de RLS e habilitadas para acesso público direto no banco. Atualizado `scripts/setup_rls.ts` para incluí-las e aplicado com sucesso.
- **Segurança de Server Actions**: Refatorado `src/actions/pedagogico.ts` adicionando travas de `checkAuth()` em todas as operações de mutação (criação, edição e remoção) e corrigindo parâmetros inseguros (ex. `usuarioId`) de deleções para serem obtidos diretamente da sessão segura do servidor.

**[BLOCK 022 - 2026-06-03] - Dados Extras de Aluno e Funcionário (Módulo 1 - Cadastros)**
- **Banco de Dados (Schema & Migrações)**: Criadas as tabelas `dados_aluno` e `dados_funcionario` e aplicada a migração física no Supabase (`0007_groovy_sleeper.sql`).
- **Segurança (RLS)**: Atualizado o script `scripts/setup_rls.ts` para habilitar automaticamente Row Level Security e configurar políticas de acesso para usuários autenticados nas duas novas tabelas.
- **Server Actions**: Estendidas as ações de `createPessoa` e `updatePessoa` para persistir dados auxiliares de forma atômica na transação. Criada a ação `getPessoaById` para buscar uma pessoa com todos os dados aninhados.
- **Frontend (Visual)**: Modificado o formulário de cadastro `/cadastros/pessoas/novo` para expor abas dinâmicas de Aluno (RA, Matrícula, etc) e Funcionário (Cargo, Salário em Reais, etc) a depender das classificações ativas.
- **Testes**: Adicionados novos testes cobrindo criação de pessoa com dados extras e busca por ID. Suíte Vitest rodada com 100% de sucesso (25 testes verdes).

**[BLOCK 023 - 2026-06-04] - Módulo Pedagógico - Fase 2 (Grade Curricular e Salas)**
- **Banco de Dados & RLS**: Criadas as tabelas `sala` e `grade_curricular`, e adicionada a coluna `salaId` em `turma` no `schema.ts`. Migração (`0008_fearless_maestro.sql`) aplicada no Supabase e RLS configurado via `scripts/setup_rls.ts`.
- **Server Actions**: Implementadas ações de CRUD para Salas e Grades Curriculares em `src/actions/pedagogico.ts`, protegidas por `checkAuth()` e com registros de auditoria em `audit_log` para exclusões.
- **Frontend**: Desenvolvidos os componentes `SalaTab.tsx` e `GradeCurricularTab.tsx`. Atualizada a aba `PedagogicoTabs.tsx` para expor os novos painéis, e integrada a seleção de salas no fluxo de turmas em `TurmaTab.tsx`.
- **Testes**: Criada a suíte de testes unitários e de integração `src/actions/pedagogico_fase2.test.ts`. Toda a suíte de testes Vitest rodada com 100% de sucesso (32 testes verdes).

**[BLOCK 024 - 2026-06-04] - Módulo Secretaria - Fase 3 (Ocorrências e Histórico)**
- **Banco de Dados & RLS**: Criadas as tabelas `ocorrencia_aluno` e `historico_escolar` no `schema.ts`. Migração (`0009_rich_dracula.sql`) aplicada no Supabase e RLS configurado via `scripts/setup_rls.ts`.
- **Server Actions**: Implementadas ações de CRUD para Ocorrências e ações de consolidação de Histórico Escolar em `src/actions/secretaria.ts`, protegidas por `checkAuth()` e gerando logs de auditoria no `audit_log` para qualquer exclusão.
- **Frontend**: Desenvolvidos os componentes `OcorrenciaTab.tsx` e `HistoricoTab.tsx`. Atualizado o painel principal `SecretariaTabs.tsx` para incorporar as novas abas de forma nativa e responsiva.
- **Testes**: Criada e validada a suíte de testes integrados `src/actions/secretaria_fase3.test.ts`. Toda a suíte de testes Vitest rodou com 100% de sucesso (39 testes verdes no total do projeto).

**[BLOCK 025 - 2026-06-04] - Portal do Responsável & Mural de Avisos**
- **Banco de Dados & RLS**: Criadas as tabelas `vinculo_responsavel_aluno`, `mural_aviso` e `aviso_ciente` no `schema.ts`. Migração (`0010_fresh_red_skull.sql`) aplicada no Supabase e RLS configurado via `scripts/setup_rls.ts`.
- **Server Actions**: Criadas as ações em `src/actions/responsavel.ts` para controle de vínculos familiares, avisos direcionados sanitizados (bloqueio de links e anexos por segurança) e registro individualizado de confirmação de leitura ("Ciente").
- **Frontend**: Criada aba de Gestão de Avisos na Secretaria (`AvisosTab.tsx`) e integrada em `SecretariaTabs.tsx`. Desenvolvido o Portal do Responsável (`/responsavel/page.tsx`) mobile-first, com seletor de alunos, cronogramas de aula, boletim e ocorrências.
- **Testes**: Desenvolvida suíte Vitest em `src/actions/responsavel.test.ts` com 100% de aprovação (46 testes verdes no total do projeto).

**[BLOCK 026 - 2026-06-05] - Evolução do Módulo de AEE (Atendimento Educacional Especializado)**
- **Banco de Dados & RLS**: Criadas as tabelas `aee_pei`, `aee_pei_meta`, `aee_atendimento` e `aee_documento` no `schema.ts`. Migração (`0011_nebulous_kat_farrell.sql`) aplicada no Supabase e RLS configurado via `scripts/setup_rls.ts`.
- **Server Actions**: Implementado o CRUD completo em `src/actions/aee.ts` englobando `getPeiAluno`, `upsertPei`, `addMetaPei`, `updateMetaPeiStatus`, `deleteMetaPei`, `getAtendimentosAluno`, `saveAtendimento`, `getDocumentosAluno`, `saveDocumento` e `getAnosLetivos`.
- **Frontend**: Reestruturado o prontuário no `AeeFormModal.tsx` com 4 abas premium (Ficha Geral, Plano Pedagógico (PEI) com metas e adaptações laboratoriais para Ensino Técnico, Registro de Atendimentos com timeline de sessões, e Laudos & Anexos).
- **Testes**: Criada a suíte `src/actions/aee.test.ts` com 12 testes unitários. Toda a suíte de testes Vitest rodou com 100% de sucesso (58 testes verdes no total do projeto).
- **Compilação**: Validada compilação com `tsc --noEmit` sem erros.

---

## 🎯 NEXT ACTIONS FOR THE AI
**Context for the next LLM picking this up:**
1. A evolução do módulo de AEE (todos os níveis de ensino, PEI, metas, atendimentos multifuncionais, e laudos clínicos) foi totalmente concluída e testada.
2. **IMMEDIATE TASK:** Aguardar novas especificações ou próximos módulos pedagógicos/secretaria solicitados pelo usuário, ou orientações sobre a importação de dados legados do Sponte.

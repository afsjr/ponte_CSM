# Arquitetura e Guia de Manutenção - Sistema de Gestão Escolar (CSM)

Este documento foi criado para ajudar futuros desenvolvedores a entender rapidamente a arquitetura do projeto, seus padrões de código e como dar continuidade ao desenvolvimento de forma segura e consistente.

## 1. Visão Geral da Arquitetura (Tech Stack)

O sistema é uma plataforma unificada de gestão escolar projetada para substituir o sistema legado (Sponte). 

* **Framework Base:** Next.js 15 (App Router) + React 19.
* **Estilização:** Tailwind CSS (v4) + Lucide React para ícones.
* **Banco de Dados:** PostgreSQL hospedado no Supabase.
* **Autenticação:** Supabase Auth (GoTrue) com SSR (Server-Side Rendering).
* **ORM:** Drizzle ORM para consultas tipadas e seguras.
* **Segurança de Dados:** Row Level Security (RLS) habilitado nativamente no PostgreSQL. Nenhuma query cliente é feita no frontend; tudo roda em Server Actions seguras.
* **Testes:** Vitest para testes unitários e de integração (Mocks no servidor).

---

## 2. Regras de Negócio Inegociáveis

Para manter a consistência e segurança do banco de dados, existem regras estritas:

1. **Retenção de Dados:** **NÃO EXISTE EXCLUSÃO (DELETE)** no sistema de forma sistêmica sem trilha de auditoria. Tudo é mantido para fins de histórico e compliance. Exclusões (quando necessárias) devem gravar log na tabela `audit_log`.
2. **Pedagógico (Notas):** Notas de Ensino Fundamental/Técnico são numéricas (0-10) arredondadas no 0.5 mais próximo. Educação Infantil usa avaliação conceitual.
3. **Frequência:** A aprovação exige no mínimo 75% de presença.
4. **Isolamento e Segurança:** Jamais passe IDs inseguros ou parâmetros de queries não validados vindos do cliente direto para o banco. Use validação no backend e pegue a sessão autenticada.

---

## 3. Estrutura de Pastas Principal

```text
├── src/
│   ├── app/                # Rotas da aplicação (Next.js App Router)
│   │   ├── (dashboard)/    # Rotas protegidas (Secretaria, Pedagógico)
│   │   ├── login/          # Rota de autenticação pública
│   │   ├── api/            # Endpoints da API (se necessários)
│   │   └── layout.tsx      # Layout global
│   ├── db/                 # Camada de Dados (Drizzle)
│   │   └── schema.ts       # ÚNICA FONTE DA VERDADE para as tabelas do banco
│   ├── lib/                # Configurações e utilitários globais
│   │   └── supabase/       # Clientes do Supabase (server, browser, middleware)
│   └── actions/            # (Ou lib/actions) Server Actions (Onde roda a lógica de backend)
├── scripts/                # Scripts utilitários locais (ex: setup RLS, migrações custom)
├── docs/                   # Documentação do projeto (como este arquivo)
└── PROJECT_STATE.md        # Arquivo de estado usado para controle de progresso e contexto
```

---

## 4. Banco de Dados e ORM (Drizzle)

O Drizzle é usado para manter o schema em código TypeScript, garantindo type-safety de ponta a ponta. Toda a definição do banco mora em `src/db/schema.ts`.

### Exemplo: Como adicionar uma nova tabela

1. Abra `src/db/schema.ts`.
2. Adicione a tabela mantendo o padrão das demais (UUID como chave, campos de auditoria `createdAt` e `updatedAt`):

```typescript
// src/db/schema.ts
import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const novaTabela = pgTable('nova_tabela', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull(),
  
  // Padrão de Auditoria OBRIGATÓRIO
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

3. Gere e aplique a migração:
   * **Gerar:** Rode `npx drizzle-kit generate` (Isso cria um arquivo `.sql` na pasta `supabase/migrations`).
   * **Aplicar:** Use as ferramentas CLI do Supabase ou aplique manualmente. No projeto existe um script `scripts/migrate.ts` para aplicar caso não use o CLI.
4. **MUITO IMPORTANTE:** Habilite o RLS para a nova tabela rodando ou atualizando o script de RLS (`scripts/setup_rls.ts`).

---

## 5. Server Actions (Como construir o Backend)

Nós **não usamos rotas `/api` para operações CRUD internas**. Usamos Server Actions do Next.js. Elas são funções TypeScript exportadas com a diretiva `"use server"` e chamadas diretamente pelos botões e formulários no Frontend.

### Padrão de uma Server Action Segura

As ações precisam **sempre** verificar se o usuário está logado antes de alterar o banco.

```typescript
// src/actions/exemplo.ts
"use server"

import { db } from "@/db";
import { novaTabela } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";

export async function criarRegistro(dados: { nome: string }) {
  // 1. Verificação de Autenticação e Segurança (Obrigatório)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Não autorizado");
  }

  try {
    // 2. Operação de Banco de Dados via Drizzle
    const resultado = await db.insert(novaTabela).values({
      nome: dados.nome,
    }).returning(); // .returning() traz o item criado

    // 3. Resposta padronizada para o Frontend
    return { success: true, data: resultado[0] };
  } catch (error) {
    console.error("Erro ao criar registro:", error);
    return { success: false, error: "Falha ao processar solicitação." };
  }
}
```

---

## 6. Frontend: Server Components vs Client Components

O App Router usa Server Components por padrão (renderizam no servidor, sem JS enviado pro navegador).

* **Server Components (`page.tsx`, `layout.tsx`):**
  Use para buscar os dados iniciais do banco, garantindo carregamento rápido. Eles chamam as funções do Drizzle diretamente ou Server Actions de leitura e passam os dados por _props_.

* **Client Components (`"use client"`):**
  Use para qualquer coisa que exige estado ou interatividade do usuário (Botões, Formulários, `useState`, Modal).

### Exemplo de Fluxo (Frontend chamando a Server Action)

```tsx
// app/dashboard/minha-tela/page.tsx (Server Component)
import { getRegistros } from "@/actions/exemplo";
import ListaInterativa from "./ListaInterativa";

export default async function Page() {
  const dadosIniciais = await getRegistros(); // Busca rápida e segura no backend
  return <ListaInterativa dadosIniciais={dadosIniciais} />;
}

// app/dashboard/minha-tela/ListaInterativa.tsx (Client Component)
"use client"

import { useState } from "react";
import { criarRegistro } from "@/actions/exemplo"; // Importa a action como se fosse função normal

export default function ListaInterativa({ dadosIniciais }) {
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    setSalvando(true);
    const resposta = await criarRegistro({ nome: "Novo Item" }); // Roda no backend
    if (resposta.success) {
      alert("Salvo com sucesso!");
    }
    setSalvando(false);
  }

  return <button onClick={handleSalvar} disabled={salvando}>Salvar</button>;
}
```

---

## 7. Autenticação e Gestão de Usuários

A autenticação é gerida estritamente pelo GoTrue do Supabase (tabelas internas `auth.users` e `auth.identities`).

* **Criação de Usuário (Signup):** Nunca manipule o banco `auth` do Supabase via SQL direto (causará corrupção do motor de Auth e gerará "Database error querying schema"). A criação de contas deve sempre passar pelas APIs oficiais (`supabase.auth.signUp` no lado do cliente ou na Admin API no Server Action).
* **Vínculos:** Após a API do Supabase criar a conta, os dados do usuário ficam vinculados pelo `id` do `auth.users` com o `id` da tabela pública `public.pessoa`.
* **Middlewares:** O arquivo `src/lib/supabase/middleware.ts` intercepta as requisições de página e redireciona usuários deslogados da pasta `/(dashboard)` de volta para `/login`.

---

## 8. Resumo Operacional (Como fazer X?)

* **Rodar o ambiente de dev:** `npm run dev`
* **Criar ou Atualizar as tabelas no Supabase:**
  1. Edite `src/db/schema.ts`
  2. `npx drizzle-kit generate`
  3. Aplique as migrações usando a CLI do Supabase (`supabase db push`) ou scripts manuais se preferir.
* **Testar um novo código pesado de negócio:** Escreva um teste no Vitest. Rode `npx vitest`.
* **Adicionar uma regra visual comum:** Use classes do Tailwind CSS. Componentes padrão (ex: modais, inputs de pesquisa com debounce) ficam em `src/components/ui/`.

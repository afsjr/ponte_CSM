import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

const TEST_USERS = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    email: 'secretaria@csmeducacao.com',
    nome: 'Teste Secretaria',
    role: 'funcionario',
    cargo: 'Secretária',
    departamento: 'Secretaria'
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    email: 'coordenacao@csmeducacao.com',
    nome: 'Teste Coordenação',
    role: 'funcionario',
    cargo: 'Coordenador',
    departamento: 'Coordenação'
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    email: 'professor@csmeducacao.com',
    nome: 'Teste Professor',
    role: 'funcionario',
    cargo: 'Professor',
    departamento: 'Pedagógico'
  },
  {
    id: 'f0000000-0000-0000-0000-000000000004',
    email: 'aluno@csmeducacao.com',
    nome: 'Teste Aluno',
    role: 'aluno',
    cargo: null,
    departamento: null
  },
  {
    id: 'f0000000-0000-0000-0000-000000000005',
    email: 'responsavel@csmeducacao.com',
    nome: 'Teste Responsável',
    role: 'responsavel',
    cargo: null,
    departamento: null
  }
];

const DEFAULT_PASSWORD = 'Teste#12345';

async function run() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) {
    dbUrl = dbUrl.replace(':6543', ':5432');
  }
  const sql = postgres(dbUrl, { prepare: false });

  try {
    console.log("Iniciando limpeza e criação de usuários de teste...");

    // Criptografa a senha usando bcrypt do PostgreSQL com cost 10 (requerido pelo GoTrue)
    const [pwdHashRow] = await sql`SELECT crypt(${DEFAULT_PASSWORD}, gen_salt('bf', 10)) as hash`;
    const passwordHash = pwdHashRow.hash;

    for (const u of TEST_USERS) {
      console.log(`Processando usuário: ${u.email}`);

      // 1. Limpeza de dados antigos para evitar conflitos
      await sql`DELETE FROM auth.identities WHERE user_id = ${u.id} OR identity_data->>'email' = ${u.email}`;
      await sql`DELETE FROM auth.users WHERE id = ${u.id} OR email = ${u.email}`;
      await sql`DELETE FROM public.contato WHERE valor = ${u.email}`;
      await sql`DELETE FROM public.pessoa WHERE id = ${u.id}`;

      // 2. Inserir na tabela public.pessoa
      await sql`
        INSERT INTO public.pessoa (id, nome_completo, situacao, created_at, updated_at)
        VALUES (${u.id}, ${u.nome}, 'ativo', NOW(), NOW())
      `;

      // 3. Inserir classificação da pessoa
      await sql`
        INSERT INTO public.pessoa_classificacao (pessoa_id, tipo, created_at, updated_at)
        VALUES (${u.id}, ${u.role}, NOW(), NOW())
      `;

      // 4. Inserir contato de e-mail
      await sql`
        INSERT INTO public.contato (pessoa_id, tipo, valor, principal, created_at, updated_at)
        VALUES (${u.id}, 'email', ${u.email}, true, NOW(), NOW())
      `;

      // 5. Inserir detalhes específicos dependendo do papel
      if (u.role === 'funcionario') {
        await sql`
          INSERT INTO public.dados_funcionario (pessoa_id, cargo, departamento, created_at, updated_at)
          VALUES (${u.id}, ${u.cargo}, ${u.departamento}, NOW(), NOW())
        `;
      } else if (u.role === 'aluno') {
        await sql`
          INSERT INTO public.dados_aluno (pessoa_id, permitir_biblioteca, created_at, updated_at)
          VALUES (${u.id}, true, NOW(), NOW())
        `;
      }

      // 6. Inserir na tabela auth.users do Supabase
      await sql`
        INSERT INTO auth.users (
          id, instance_id, aud, role, email, encrypted_password, 
          email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
          created_at, updated_at, is_super_admin
        ) VALUES (
          ${u.id},
          '00000000-0000-0000-0000-000000000000',
          'authenticated',
          'authenticated',
          ${u.email},
          ${passwordHash},
          NOW(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          ${JSON.stringify({ nome: u.nome })}::jsonb,
          NOW(),
          NOW(),
          false
        )
      `;

      // 7. Inserir na tabela auth.identities do Supabase
      await sql`
        INSERT INTO auth.identities (
          id, user_id, provider_id, identity_data, provider, 
          last_sign_in_at, created_at, updated_at
        ) VALUES (
          ${u.id},
          ${u.id},
          ${u.id},
          ${JSON.stringify({ sub: u.id, email: u.email })}::jsonb,
          'email',
          NOW(),
          NOW(),
          NOW()
        )
      `;
      
      console.log(`Usuário ${u.email} criado com sucesso!`);
    }

    console.log("\nTodos os perfis de teste foram criados com sucesso!");
    process.exit(0);
  } catch (err) {
    console.error("Erro na criação dos usuários de teste:", err);
    process.exit(1);
  }
}

run();

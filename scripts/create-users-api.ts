import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const TEST_USERS = [
  { email: 'secretaria@csmeducacao.com', nome: 'Teste Secretaria', role: 'funcionario', cargo: 'Secretária', departamento: 'Secretaria' },
  { email: 'coordenacao@csmeducacao.com', nome: 'Teste Coordenação', role: 'funcionario', cargo: 'Coordenador', departamento: 'Coordenação' },
  { email: 'professor@csmeducacao.com', nome: 'Teste Professor', role: 'funcionario', cargo: 'Professor', departamento: 'Pedagógico' },
  { email: 'aluno@csmeducacao.com', nome: 'Teste Aluno', role: 'aluno', cargo: null, departamento: null },
  { email: 'responsavel@csmeducacao.com', nome: 'Teste Responsável', role: 'responsavel', cargo: null, departamento: null },
];

const PASSWORD = 'Teste#12345';

async function createUsersViaAPI() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) dbUrl = dbUrl.replace(':6543', ':5432');
  const sql = postgres(dbUrl, { prepare: false });

  for (const u of TEST_USERS) {
    console.log(`\nCriando ${u.email} via API...`);

    // 1. Signup via Supabase API (cria auth.users + auth.identities corretamente)
    const signupRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        email: u.email,
        password: PASSWORD,
        options: {
          data: { nome: u.nome }
        }
      }),
    });

    if (signupRes.status !== 200) {
      const errBody = await signupRes.text();
      console.log(`  Signup falhou (${signupRes.status}): ${errBody}`);
      continue;
    }

    const signupData = await signupRes.json();
    const userId = signupData.user?.id;
    console.log(`  Auth user criado: ${userId}`);

    // 2. Verificar login imediatamente
    const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({ email: u.email, password: PASSWORD }),
    });
    console.log(`  Login test: ${loginRes.status}`);

    // 3. Criar pessoa no public schema vinculada ao auth user
    const existingPessoa = await sql`SELECT id FROM public.pessoa WHERE id = ${userId}::uuid`;
    if (existingPessoa.length === 0) {
      await sql`
        INSERT INTO public.pessoa (id, nome_completo, situacao, created_at, updated_at)
        VALUES (${userId}::uuid, ${u.nome}, 'ativo', NOW(), NOW())
      `;
      console.log(`  Pessoa criada`);
    }

    // 4. Criar classificação
    const existingClass = await sql`SELECT id FROM public.pessoa_classificacao WHERE pessoa_id = ${userId}::uuid`;
    if (existingClass.length === 0) {
      await sql`
        INSERT INTO public.pessoa_classificacao (pessoa_id, tipo, created_at, updated_at)
        VALUES (${userId}::uuid, ${u.role}, NOW(), NOW())
      `;
      console.log(`  Classificação ${u.role} criada`);
    }

    // 5. Criar contato email
    const existingContato = await sql`SELECT id FROM public.contato WHERE pessoa_id = ${userId}::uuid AND tipo = 'email'`;
    if (existingContato.length === 0) {
      await sql`
        INSERT INTO public.contato (pessoa_id, tipo, valor, principal, created_at, updated_at)
        VALUES (${userId}::uuid, 'email', ${u.email}, true, NOW(), NOW())
      `;
    }

    // 6. Criar dados específicos
    if (u.role === 'funcionario' && u.cargo) {
      const existingFunc = await sql`SELECT id FROM public.dados_funcionario WHERE pessoa_id = ${userId}::uuid`;
      if (existingFunc.length === 0) {
        await sql`
          INSERT INTO public.dados_funcionario (pessoa_id, cargo, departamento, created_at, updated_at)
          VALUES (${userId}::uuid, ${u.cargo}, ${u.departamento}, NOW(), NOW())
        `;
        console.log(`  Dados funcionário criados`);
      }
    } else if (u.role === 'aluno') {
      const existingAluno = await sql`SELECT id FROM public.dados_aluno WHERE pessoa_id = ${userId}::uuid`;
      if (existingAluno.length === 0) {
        await sql`
          INSERT INTO public.dados_aluno (pessoa_id, permitir_biblioteca, created_at, updated_at)
          VALUES (${userId}::uuid, true, NOW(), NOW())
        `;
        console.log(`  Dados aluno criados`);
      }
    }

    console.log(`  ✅ ${u.email} pronto!`);
  }

  console.log("\n=== RESUMO FINAL ===");
  const allUsers = await sql`
    SELECT u.email, u.id, pc.tipo as classificacao
    FROM auth.users u
    LEFT JOIN public.pessoa p ON p.id = u.id
    LEFT JOIN public.pessoa_classificacao pc ON pc.pessoa_id = u.id
    WHERE u.email LIKE '%csmeducacao.com'
    ORDER BY u.email
  `;
  for (const u of allUsers) {
    console.log(`  ${u.email} (${u.id}) - ${u.classificacao}`);
  }

  process.exit(0);
}

createUsersViaAPI().catch(e => { console.error(e); process.exit(1); });

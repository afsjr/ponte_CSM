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
  { email: 'admin@csmeducacao.com', nome: 'Administrador CSM', role: 'funcionario', cargo: 'Administrador', departamento: 'Direção' }
];

const PASSWORD = 'Teste#12345';

async function recreateAll() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) dbUrl = dbUrl.replace(':6543', ':5432');
  const sql = postgres(dbUrl, { prepare: false });

  try {
    console.log("1. Removendo usuários antigos de auth.users...");
    for (const u of TEST_USERS) {
      await sql`DELETE FROM auth.users WHERE email = ${u.email}`;
    }
    console.log("   Usuários antigos removidos!");

    console.log("\n2. Criando usuários via API do Supabase (GoTrue)...");
    for (const u of TEST_USERS) {
      console.log(`   Criando ${u.email}...`);
      const res = await fetch(`${supabaseUrl}/auth/v1/signup`, {
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

      const data = await res.json();
      if (res.status >= 400) {
        console.error(`   Erro ao criar ${u.email}:`, data);
      } else {
        console.log(`   Sucesso! ID: ${data.user?.id || data.id}`);
      }
    }

    console.log("\n3. Confirmando e-mails automaticamente no banco...");
    await sql`
      UPDATE auth.users 
      SET email_confirmed_at = NOW()
      WHERE email LIKE '%csmeducacao.com';
    `;
    console.log("   E-mails confirmados!");

    console.log("\n4. Testando login via API para verificação...");
    for (const u of TEST_USERS) {
      const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          email: u.email,
          password: PASSWORD,
        }),
      });
      if (loginRes.status === 200) {
        console.log(`   [OK] Login bem-sucedido para ${u.email}`);
      } else {
        const err = await loginRes.json();
        console.error(`   [ERRO] Login falhou para ${u.email}:`, err);
      }
    }

    console.log("\n=== CONCLUÍDO COM SUCESSO ===");
  } catch (err) {
    console.error("FATAL:", err);
  } finally {
    process.exit(0);
  }
}

recreateAll();

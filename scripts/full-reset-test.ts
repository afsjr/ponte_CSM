import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function fullReset() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) dbUrl = dbUrl.replace(':6543', ':5432');
  const sql = postgres(dbUrl, { prepare: false });

  try {
    // 1. Listar TODOS os users no auth (não só os nossos)
    console.log("=== TODOS OS USERS NO AUTH ===");
    const allUsers = await sql`SELECT id, email, created_at FROM auth.users ORDER BY created_at`;
    for (const u of allUsers) {
      console.log(`  ${u.email} (${u.id}) criado em ${u.created_at}`);
    }
    console.log(`Total: ${allUsers.length} users\n`);

    // 2. Limpar TODOS os nossos test users do auth
    console.log("=== LIMPANDO TEST USERS DO AUTH ===");
    const testIds = [
      'f0000000-0000-0000-0000-000000000001',
      'f0000000-0000-0000-0000-000000000002',
      'f0000000-0000-0000-0000-000000000003',
      'f0000000-0000-0000-0000-000000000004',
      'f0000000-0000-0000-0000-000000000005',
    ];

    // Limpar sessions e refresh_tokens primeiro
    for (const id of testIds) {
      await sql`DELETE FROM auth.refresh_tokens WHERE user_id = ${id}::text`;
      await sql`DELETE FROM auth.sessions WHERE user_id = ${id}::uuid`;
      try { await sql`DELETE FROM auth.mfa_factors WHERE user_id = ${id}::uuid`; } catch {}
      await sql`DELETE FROM auth.identities WHERE user_id = ${id}::uuid`;
      await sql`DELETE FROM auth.users WHERE id = ${id}::uuid`;
    }
    // Também limpar por email
    await sql`DELETE FROM auth.identities WHERE identity_data->>'email' LIKE '%csmeducacao.com'`;
    await sql`DELETE FROM auth.users WHERE email LIKE '%csmeducacao.com'`;
    console.log("Test users removidos do auth.\n");

    // 3. Verificar quantos users sobraram
    const remaining = await sql`SELECT id, email FROM auth.users`;
    console.log(`Users restantes no auth: ${remaining.length}`);
    for (const u of remaining) {
      console.log(`  ${u.email} (${u.id})`);
    }

    // 4. Agora testar signup via API (agora que email confirmation deve estar OFF)
    console.log("\n=== TESTE SIGNUP FRESH (pós-cleanup) ===");
    const freshEmail = `fresh_test_${Date.now()}@gmail.com`;
    const signupRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        email: freshEmail,
        password: 'Teste#12345',
      }),
    });
    console.log(`Signup status: ${signupRes.status}`);
    const signupBody = await signupRes.text();
    console.log(`Signup body: ${signupBody.substring(0, 500)}`);

    // 5. Se signup funcionou, tentar login imediatamente
    if (signupRes.status === 200) {
      console.log("\n=== TESTE LOGIN COM USER FRESH ===");
      const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          email: freshEmail,
          password: 'Teste#12345',
        }),
      });
      console.log(`Login status: ${loginRes.status}`);
      const loginBody = await loginRes.text();
      console.log(`Login body: ${loginBody.substring(0, 500)}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fullReset();

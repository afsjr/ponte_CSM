import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

async function investigate() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) dbUrl = dbUrl.replace(':6543', ':5432');
  const sql = postgres(dbUrl, { prepare: false });

  try {
    // 1. Checar triggers na tabela auth.users
    console.log("=== TRIGGERS em auth.users ===");
    const triggers = await sql`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_schema = 'auth' AND event_object_table = 'users'
    `;
    for (const t of triggers) {
      console.log(`  ${t.trigger_name} (${t.event_manipulation})`);
      console.log(`    -> ${t.action_statement.substring(0, 200)}`);
    }

    // 2. Checar se existe a coluna is_sso_user (GoTrue recente exige)
    console.log("\n=== COLUNAS de auth.users ===");
    const cols = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'auth' AND table_name = 'users'
      ORDER BY ordinal_position
    `;
    for (const c of cols) {
      console.log(`  ${c.column_name} (${c.data_type}) nullable=${c.is_nullable} default=${c.column_default || 'none'}`);
    }

    // 3. Checar se existe a coluna is_anonymous
    const hasIsAnonymous = cols.some((c: any) => c.column_name === 'is_anonymous');
    const hasIsSsoUser = cols.some((c: any) => c.column_name === 'is_sso_user');
    console.log(`\n  has is_anonymous: ${hasIsAnonymous}`);
    console.log(`  has is_sso_user: ${hasIsSsoUser}`);

    // 4. Checar colunas de auth.identities
    console.log("\n=== COLUNAS de auth.identities ===");
    const idCols = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'auth' AND table_name = 'identities'
      ORDER BY ordinal_position
    `;
    for (const c of idCols) {
      console.log(`  ${c.column_name} (${c.data_type}) nullable=${c.is_nullable} default=${c.column_default || 'none'}`);
    }

    // 5. Checar se os registros auth.users têm todos os campos obrigatórios preenchidos
    console.log("\n=== CAMPOS CRÍTICOS dos test users ===");
    const critical = await sql`
      SELECT id, email, aud, role, is_sso_user, is_anonymous,
             email_confirmed_at IS NOT NULL as email_confirmed,
             encrypted_password IS NOT NULL as has_password,
             instance_id, confirmation_token, recovery_token,
             banned_until
      FROM auth.users
      WHERE email LIKE '%csmeducacao.com'
    `;
    for (const u of critical) {
      console.log(`  ${u.email}:`);
      console.log(`    aud=${u.aud} role=${u.role} is_sso=${u.is_sso_user} is_anon=${u.is_anonymous}`);
      console.log(`    email_confirmed=${u.email_confirmed} has_password=${u.has_password}`);
      console.log(`    instance_id=${u.instance_id}`);
      console.log(`    confirmation_token="${u.confirmation_token}" recovery_token="${u.recovery_token}"`);
      console.log(`    banned_until=${u.banned_until}`);
    }

    // 6. Checar se há funções/views quebradas no schema auth
    console.log("\n=== FUNCTIONS no schema auth ===");
    const funcs = await sql`
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'auth'
      ORDER BY routine_name
    `;
    for (const f of funcs) {
      console.log(`  ${f.routine_name}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
investigate();

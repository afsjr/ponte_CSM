import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

async function debug() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) dbUrl = dbUrl.replace(':6543', ':5432');
  const sql = postgres(dbUrl, { prepare: false });

  try {
    // 1. Listar todos os users no auth
    const users = await sql`
      SELECT id, email, encrypted_password, email_confirmed_at, 
             raw_app_meta_data, confirmation_token, aud, role,
             created_at, updated_at
      FROM auth.users 
      WHERE email LIKE '%csmeducacao.com'
      ORDER BY email
    `;
    console.log("=== AUTH.USERS ===");
    for (const u of users) {
      console.log(`Email: ${u.email}`);
      console.log(`  ID: ${u.id}`);
      console.log(`  Password hash prefix: ${u.encrypted_password?.substring(0, 10)}...`);
      console.log(`  Email confirmed: ${u.email_confirmed_at}`);
      console.log(`  Aud: ${u.aud}`);
      console.log(`  Role: ${u.role}`);
      console.log(`  App meta: ${JSON.stringify(u.raw_app_meta_data)}`);
      console.log(`  Confirmation token: "${u.confirmation_token}"`);
      console.log();
    }

    // 2. Listar identities
    const identities = await sql`
      SELECT i.id, i.user_id, i.provider, i.provider_id, i.identity_data
      FROM auth.identities i
      JOIN auth.users u ON u.id = i.user_id
      WHERE u.email LIKE '%csmeducacao.com'
      ORDER BY u.email
    `;
    console.log("=== AUTH.IDENTITIES ===");
    for (const i of identities) {
      console.log(`User ID: ${i.user_id}`);
      console.log(`  Provider: ${i.provider}`);
      console.log(`  Provider ID: ${i.provider_id}`);
      console.log(`  Identity data: ${JSON.stringify(i.identity_data)}`);
      console.log();
    }

    // 3. Testar password match
    console.log("=== PASSWORD MATCH TEST ===");
    const tests = await sql`
      SELECT email, 
             (encrypted_password = crypt('Teste#12345', encrypted_password)) as match
      FROM auth.users
      WHERE email LIKE '%csmeducacao.com'
    `;
    for (const t of tests) {
      console.log(`${t.email}: password_match = ${t.match}`);
    }

    // 4. Checar se há duplicatas
    console.log("\n=== DUPLICATAS ===");
    const dupes = await sql`
      SELECT email, count(*) as cnt
      FROM auth.users
      WHERE email LIKE '%csmeducacao.com'
      GROUP BY email
      HAVING count(*) > 1
    `;
    if (dupes.length === 0) {
      console.log("Nenhuma duplicata encontrada.");
    } else {
      console.log("DUPLICATAS:", dupes);
    }

    // 5. Checar a versão do schema do GoTrue
    console.log("\n=== GOTRUE SCHEMA VERSION ===");
    const version = await sql`
      SELECT * FROM auth.schema_migrations ORDER BY version DESC LIMIT 5
    `;
    console.log(version);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
debug();

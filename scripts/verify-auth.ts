import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

async function verify() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) dbUrl = dbUrl.replace(':6543', ':5432');
  const sql = postgres(dbUrl, { prepare: false });

  try {
    console.log("=== AUTH.USERS - campos token ===");
    const users = await sql`
      SELECT email, confirmation_token, recovery_token, confirmed_at
      FROM auth.users WHERE email LIKE '%csmeducacao.com'
    `;
    for (const u of users) {
      console.log(`${u.email}: conf_token="${u.confirmation_token}" rec_token="${u.recovery_token}" confirmed_at=${u.confirmed_at}`);
    }

    console.log("\n=== AUTH.IDENTITIES - email gerado ===");
    const ids = await sql`
      SELECT i.user_id, i.email, i.provider_id, i.identity_data
      FROM auth.identities i
      JOIN auth.users u ON u.id = i.user_id
      WHERE u.email LIKE '%csmeducacao.com'
    `;
    for (const i of ids) {
      console.log(`${i.user_id}: generated_email=${i.email} provider_id=${i.provider_id}`);
      console.log(`  identity_data=${JSON.stringify(i.identity_data)}`);
    }

    // Teste final: simular exatamente o que o GoTrue faz
    console.log("\n=== SIMULAR QUERY GOTRUE ===");
    const gotrue = await sql`
      SELECT 
        u.id, u.email, u.encrypted_password, u.email_confirmed_at, u.confirmed_at,
        u.aud, u.role, u.is_sso_user, u.is_anonymous,
        i.provider, i.provider_id, i.identity_data, i.email as identity_email
      FROM auth.users u
      LEFT JOIN auth.identities i ON i.user_id = u.id AND i.provider = 'email'
      WHERE u.email = 'secretaria@csmeducacao.com'
    `;
    console.log(JSON.stringify(gotrue, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
verify();

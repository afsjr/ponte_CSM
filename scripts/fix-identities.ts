import { config } from 'dotenv';
config({ path: '.env.local' });
import postgres from 'postgres';

const TEST_USERS = [
  { id: 'f0000000-0000-0000-0000-000000000001', email: 'secretaria@csmeducacao.com' },
  { id: 'f0000000-0000-0000-0000-000000000002', email: 'coordenacao@csmeducacao.com' },
  { id: 'f0000000-0000-0000-0000-000000000003', email: 'professor@csmeducacao.com' },
  { id: 'f0000000-0000-0000-0000-000000000004', email: 'aluno@csmeducacao.com' },
  { id: 'f0000000-0000-0000-0000-000000000005', email: 'responsavel@csmeducacao.com' },
];

async function fix() {
  let dbUrl = process.env.DATABASE_URL!;
  if (dbUrl.includes(':6543')) dbUrl = dbUrl.replace(':6543', ':5432');
  const sql = postgres(dbUrl, { prepare: false });

  try {
    for (const u of TEST_USERS) {
      // Fix: reescrever identity_data como JSONB nativo e provider_id como email
      const identityData = JSON.stringify({ sub: u.id, email: u.email, email_verified: false, phone_verified: false });
      await sql`
        UPDATE auth.identities
        SET 
          identity_data = ${identityData}::jsonb,
          provider_id = ${u.email}
        WHERE user_id = ${u.id}::uuid AND provider = 'email'
      `;
      console.log(`Fixed identity for ${u.email}`);
    }

    // Verificar o resultado
    console.log("\n=== VERIFICATION ===");
    const identities = await sql`
      SELECT user_id, provider_id, identity_data, pg_typeof(identity_data) as dtype
      FROM auth.identities
      WHERE user_id IN ('f0000000-0000-0000-0000-000000000001','f0000000-0000-0000-0000-000000000002','f0000000-0000-0000-0000-000000000003','f0000000-0000-0000-0000-000000000004','f0000000-0000-0000-0000-000000000005')
    `;
    for (const i of identities) {
      console.log(`User ${i.user_id}:`);
      console.log(`  provider_id: ${i.provider_id}`);
      console.log(`  identity_data type: ${i.dtype}`);
      console.log(`  identity_data: ${JSON.stringify(i.identity_data)}`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
fix();

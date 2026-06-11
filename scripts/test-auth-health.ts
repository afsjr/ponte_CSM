import { config } from 'dotenv';
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function testSignup() {
  // Teste 1: signup com um email totalmente novo
  const randomEmail = `teste_${Date.now()}@gmail.com`;
  const url = `${supabaseUrl}/auth/v1/signup`;
  
  console.log(`=== TESTE SIGNUP ===`);
  console.log(`POST ${url}`);
  console.log(`Email: ${randomEmail}`);
  
  const res1 = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({
      email: randomEmail,
      password: 'Teste#12345',
    }),
  });
  console.log(`Status: ${res1.status}`);
  const body1 = await res1.text();
  console.log(`Body: ${body1}\n`);

  // Teste 2: user info endpoint
  console.log(`=== TESTE HEALTH ===`);
  const healthUrl = `${supabaseUrl}/auth/v1/health`;
  const res2 = await fetch(healthUrl, {
    headers: { 'apikey': supabaseAnonKey },
  });
  console.log(`Status: ${res2.status}`);
  const body2 = await res2.text();
  console.log(`Body: ${body2}\n`);

  // Teste 3: settings
  console.log(`=== TESTE SETTINGS ===`);
  const settingsUrl = `${supabaseUrl}/auth/v1/settings`;
  const res3 = await fetch(settingsUrl, {
    headers: { 'apikey': supabaseAnonKey },
  });
  console.log(`Status: ${res3.status}`);
  const body3 = await res3.text();
  console.log(`Body: ${body3.substring(0, 500)}\n`);
}

testSignup().catch(console.error);

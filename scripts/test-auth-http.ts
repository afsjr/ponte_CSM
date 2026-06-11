import { config } from 'dotenv';
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function testAuthDirectly() {
  const url = `${supabaseUrl}/auth/v1/token?grant_type=password`;
  
  console.log(`POST ${url}`);
  console.log(`Using email: secretaria@csmeducacao.com`);
  console.log(`Using password: Teste#12345`);
  console.log();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
    },
    body: JSON.stringify({
      email: 'secretaria@csmeducacao.com',
      password: 'Teste#12345',
    }),
  });

  console.log(`Status: ${response.status} ${response.statusText}`);
  
  const responseHeaders = Object.fromEntries(response.headers.entries());
  console.log(`Headers:`, JSON.stringify(responseHeaders, null, 2));
  
  const body = await response.text();
  console.log(`\nBody:`);
  console.log(body);
}

testAuthDirectly().catch(console.error);

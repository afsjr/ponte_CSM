import { config } from 'dotenv';
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function testFreshSignup() {
  const testEmail = `admin.test.${Date.now()}@csmeducacao.com`;
  const password = 'Teste#12345';

  console.log(`Testing signup with ${testEmail}...`);

  const signupRes = await fetch(`${supabaseUrl}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
    },
    body: JSON.stringify({
      email: testEmail,
      password: password,
    }),
  });

  console.log(`Signup status: ${signupRes.status} ${signupRes.statusText}`);
  const signupData = await signupRes.json();
  console.log('Signup result:', signupData);

  if (signupRes.status === 200 || signupRes.status === 201) {
    console.log('\nNow testing login for the newly created user...');
    const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        email: testEmail,
        password: password,
      }),
    });
    console.log(`Login status: ${loginRes.status} ${loginRes.statusText}`);
    const loginData = await loginRes.json();
    console.log('Login result:', loginData);
  }
}

testFreshSignup().catch(console.error);

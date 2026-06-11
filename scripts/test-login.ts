import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  const email = 'secretaria@csmeducacao.com'
  const password = 'Teste#12345'
  
  console.log(`Tentando login com ${email} e senha ${password}...`)
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Erro no login:", error.message)
  } else {
    console.log("Login bem-sucedido!", data.user?.id)
  }
}

testLogin()

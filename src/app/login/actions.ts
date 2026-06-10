'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rateLimit'

export async function login(formData: FormData) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1'
  
  // Limita a 5 tentativas de login por IP a cada 60 segundos
  if (!rateLimit(ip + '_login', 5, 60 * 1000)) {
    redirect('/login?error=Muitas tentativas. Tente novamente mais tarde.')
  }

  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=Invalid credentials')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function sendResetLink(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string

  // Obter o origin atual para montar a URL de redirecionamento corretamente
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/atualizar-senha`,
  })

  if (error) {
    console.error('ERRO SUPABASE AUTH:', error);
    redirect('/redefinir-senha?error=Não foi possível enviar o e-mail. Verifique se o endereço está correto.')
  }

  redirect('/redefinir-senha?success=true')
}

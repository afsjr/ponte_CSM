'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    redirect('/atualizar-senha?error=As senhas não coincidem.')
  }

  if (password.length < 6) {
    redirect('/atualizar-senha?error=A senha deve ter pelo menos 6 caracteres.')
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    redirect('/atualizar-senha?error=Erro ao atualizar a senha. Tente solicitar o link novamente.')
  }

  redirect('/?success=Senha atualizada com sucesso.')
}

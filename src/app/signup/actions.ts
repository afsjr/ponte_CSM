'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/db'
import { pessoa, pessoaClassificacao, contato } from '@/db/schema'
import { headers } from 'next/headers'
import { rateLimit } from '@/lib/rateLimit'
import { eq, and, sql } from 'drizzle-orm'

export async function signup(formData: FormData) {
  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for') ?? '127.0.0.1'
  
  // Limita a 3 criações de conta por IP a cada 1 hora (60 min * 60 seg * 1000 ms)
  if (!rateLimit(ip + '_signup', 3, 60 * 60 * 1000)) {
    redirect('/signup?error=Muitas contas criadas. Tente novamente mais tarde.')
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nomeCompleto = formData.get('nomeCompleto') as string
  const cpf = formData.get('cpf') as string

  // Remove máscara do CPF se houver
  const cpfLimpo = cpf.replace(/\D/g, '')

  // 1. Verificar se o CPF já está cadastrado no banco public.pessoa
  const [pessoaExistente] = await db.select({
    id: pessoa.id,
    nomeCompleto: pessoa.nomeCompleto,
  })
  .from(pessoa)
  .where(eq(pessoa.cpf, cpfLimpo));

  if (pessoaExistente) {
    // Verificar se já existe registro de auth correspondente na tabela auth.users ou com o e-mail
    const [authExistente] = await db.execute(sql`SELECT id FROM auth.users WHERE id = ${pessoaExistente.id}`);
    const [emailExistente] = await db.execute(sql`SELECT id FROM auth.users WHERE email = ${email}`);

    if (authExistente || emailExistente) {
      redirect('/signup?error=Este CPF ou E-mail já possui cadastro no sistema.')
    }

    // Se a pessoa existe na base mas não tem login, criamos a conta vinculada ao ID existente
    try {
      await db.transaction(async (tx) => {
        // Insere na tabela auth.users (usando postgres pgcrypto para criptografar a senha)
        await tx.execute(sql`
          INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, 
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
            created_at, updated_at, is_super_admin
          ) VALUES (
            ${pessoaExistente.id},
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            ${email},
            crypt(${password}, gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}'::jsonb,
            ${JSON.stringify({ nome: pessoaExistente.nomeCompleto })}::jsonb,
            NOW(),
            NOW(),
            false
          )
        `);

        // Insere na tabela auth.identities
        await tx.execute(sql`
          INSERT INTO auth.identities (
            id, user_id, provider_id, identity_data, provider, 
            last_sign_in_at, created_at, updated_at
          ) VALUES (
            ${pessoaExistente.id},
            ${pessoaExistente.id},
            ${pessoaExistente.id},
            ${JSON.stringify({ sub: pessoaExistente.id, email: email })}::jsonb,
            'email',
            NOW(),
            NOW(),
            NOW()
          )
        `);

        // Garantir que a pessoa tem o contato de e-mail cadastrado e ativo
        const [contatoEmail] = await tx.select()
          .from(contato)
          .where(and(eq(contato.pessoaId, pessoaExistente.id), eq(contato.tipo, 'email')));

        if (!contatoEmail) {
          await tx.insert(contato).values({
            pessoaId: pessoaExistente.id,
            tipo: 'email',
            valor: email,
            principal: true,
          });
        }
      });
    } catch (dbError: any) {
      console.error('Erro ao vincular conta no banco:', dbError);
      redirect(`/signup?error=${encodeURIComponent('Houve um erro técnico ao vincular sua conta. Contate o administrador.')}`);
    }

    // Como criamos direto no banco, redirecionamos para o login informando sucesso
    redirect('/login?success=Seu cadastro foi vinculado com sucesso! Faça login com suas credenciais.')
  }

  // Se o CPF é inédito, segue o fluxo normal do Supabase Auth
  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome: nomeCompleto,
      }
    }
  })

  if (authError || !authData.user) {
    console.error('Erro de Autenticação:', authError)
    redirect(`/signup?error=${encodeURIComponent(authError?.message || 'Erro ao criar conta de acesso.')}`)
  }

  // 2. Criar os registros na base do Drizzle vinculando o id da pessoa ao user.id
  try {
    await db.transaction(async (tx) => {
      // Inserir a Pessoa com situação 'inativo' e o UUID exato do auth
      await tx.insert(pessoa).values({
        id: authData.user!.id,
        nomeCompleto,
        cpf: cpfLimpo,
        situacao: 'inativo', // Começa inativo para a aprovação manual
      });

      // Classificação 'interessado'
      await tx.insert(pessoaClassificacao).values({
        pessoaId: authData.user!.id,
        tipo: 'interessado',
      });

      // Inserir contato de E-mail para poder ser consultado e encontrado depois
      await tx.insert(contato).values({
        pessoaId: authData.user!.id,
        tipo: 'email',
        valor: email,
        principal: true,
      });
    })
  } catch (dbError: any) {
    console.error('Erro ao salvar no banco:', dbError)
    redirect(`/signup?error=${encodeURIComponent('A conta de login foi criada, mas houve um erro ao registrar seus dados no sistema. Tente novamente ou contate o suporte.')}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

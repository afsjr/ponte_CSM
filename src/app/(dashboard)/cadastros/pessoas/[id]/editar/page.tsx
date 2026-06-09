import { notFound } from 'next/navigation'
import { getPessoaById } from '@/actions/pessoa'
import { getDisciplinas, getTurmas } from '@/actions/pedagogico'
import { PessoaEditForm } from './PessoaEditForm'
import { LucideArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

function isPedagogical(dadosFuncionario: any) {
  if (!dadosFuncionario) return true;
  const cargo = (dadosFuncionario.cargo || '').toLowerCase();
  const depto = (dadosFuncionario.departamento || '').toLowerCase();
  
  const palavrasPedagogicas = [
    'professor', 'professora', 'docente', 'coordenador', 'coordenadora', 
    'coordenação', 'aee', 'auxiliar de sala', 'pedagogico', 'pedagógico'
  ];
  
  return palavrasPedagogicas.some(word => cargo.includes(word) || depto.includes(word));
}

export default async function EditarPessoaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isDev = process.env.NODE_ENV === 'development'
  const role = user?.app_metadata?.role || user?.user_metadata?.role
  const email = user?.email || ''
  const isAdmin = email === 'adelinosantos.fs@gmail.com' ||
                  role === 'admin' || 
                  role === 'master' || 
                  (isDev && !email.includes('comum'))

  const [pessoaRes, disciplinasRes, turmasRes] = await Promise.all([
    getPessoaById(id),
    getDisciplinas(),
    getTurmas(),
  ])

  if (!pessoaRes.success || !pessoaRes.data) {
    notFound()
  }

  const disciplinas = disciplinasRes.success && disciplinasRes.data ? disciplinasRes.data : []
  const turmas = turmasRes.success && turmasRes.data ? turmasRes.data : []
  const pessoa = pessoaRes.data

  const isFuncionario = pessoa.classificacoes.includes('funcionario')
  const isPedagogo = isPedagogical(pessoa.dadosFuncionario)

  if (isFuncionario && !isPedagogo && !isAdmin) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Link
            href="/cadastros/pessoas"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <LucideArrowLeft size={16} />
            Voltar
          </Link>
        </div>
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-2">Acesso Restrito / Não Autorizado</h2>
          <p className="text-sm">
            Os dados deste funcionário pertencem a um setor administrativo ou operacional (não-pedagógico). 
            Por questões de confidencialidade e privacidade de dados, apenas usuários administradores têm permissão para visualizar ou editar este perfil.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/cadastros/pessoas"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <LucideArrowLeft size={16} />
          Voltar
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar Pessoa</h1>
          <p className="text-gray-500">{pessoa.nomeCompleto}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <PessoaEditForm
          pessoa={pessoa as any}
          disciplinas={disciplinas as any}
          turmas={turmas as any}
        />
      </div>
    </div>
  )
}

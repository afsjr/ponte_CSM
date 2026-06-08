import { notFound } from 'next/navigation'
import { getPessoaById } from '@/actions/pessoa'
import { getDisciplinas, getTurmas } from '@/actions/pedagogico'
import { PessoaEditForm } from './PessoaEditForm'
import { LucideArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function EditarPessoaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

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

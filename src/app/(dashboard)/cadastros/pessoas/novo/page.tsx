import { PessoaForm } from './PessoaForm'
import { getDisciplinas, getTurmas } from '@/actions/pedagogico'

export default async function NovaPessoaPage() {
  const disciplinasRes = await getDisciplinas()
  const disciplinas = disciplinasRes.success && disciplinasRes.data ? disciplinasRes.data : []

  const turmasRes = await getTurmas()
  const turmas = turmasRes.success && turmasRes.data ? turmasRes.data : []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Novo Cadastro de Pessoa</h1>
        <p className="text-gray-500">
          Preencha os dados abaixo para cadastrar um novo aluno, funcionário ou responsável.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <PessoaForm disciplinas={disciplinas as any} turmas={turmas as any} />
      </div>
    </div>
  )
}

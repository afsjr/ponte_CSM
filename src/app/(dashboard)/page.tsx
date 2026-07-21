import { LucideUsers, LucideGraduationCap, LucideFileText, LucideSettings, LucideUserCheck, LucideBookOpen } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/db'
import { pessoaClassificacao, turma, matricula, pessoa } from '@/db/schema'
import { eq, sql, or } from 'drizzle-orm'
import { AlertCircle, UserPlus, DollarSign } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardHome() {
  // Executar queries em paralelo para performance
  const [totalAlunosRes, totalFuncionariosRes, turmasAtivasRes, matriculasAtivasRes, pendentesRes] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(pessoaClassificacao).where(eq(pessoaClassificacao.tipo, 'aluno')),
    db.select({ count: sql<number>`count(*)` }).from(pessoaClassificacao).where(eq(pessoaClassificacao.tipo, 'funcionario')),
    db.select({ count: sql<number>`count(*)` }).from(turma).where(or(eq(turma.situacao, 'aberta'), eq(turma.situacao, 'em_andamento'))),
    db.select({ count: sql<number>`count(*)` }).from(matricula).where(eq(matricula.status, 'ativo')),
    db.select({ count: sql<number>`count(*)` }).from(pessoa).where(eq(pessoa.situacao, 'inativo'))
  ]);

  const totalAlunos = Number(totalAlunosRes[0]?.count || 0)
  const totalFuncionarios = Number(totalFuncionariosRes[0]?.count || 0)
  const turmasAtivas = Number(turmasAtivasRes[0]?.count || 0)
  const matriculasAtivas = Number(matriculasAtivasRes[0]?.count || 0)
  const pendentesAprovacao = Number(pendentesRes[0]?.count || 0)

  return (
    <div className="flex flex-col gap-6">
      
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Bem-vindo(a) ao CSM Gestão</h1>
        <p className="text-gray-500">
          Selecione um dos módulos abaixo para iniciar suas atividades ou verifique o panorama atual da escola.
        </p>
      </div>

      {pendentesAprovacao > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex items-start gap-4">
          <div className="bg-amber-100 text-amber-600 p-2 rounded-lg mt-1">
            <AlertCircle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-amber-800 font-semibold mb-1">Atenção: Cadastros Pendentes</h3>
            <p className="text-amber-700 text-sm">
              Você possui <strong>{pendentesAprovacao} interessado(s)</strong> que criaram conta recentemente e estão aguardando aprovação para acessar o sistema.
            </p>
          </div>
          <div>
            <Link 
              href="/cadastros/pessoas" 
              className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <UserPlus size={16} />
              Revisar Cadastros
            </Link>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
            <LucideUsers size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Alunos Cadastrados</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalAlunos}</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4 hover:border-purple-200 transition-colors">
          <div className="bg-purple-50 text-purple-600 p-3 rounded-lg">
            <LucideUserCheck size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Matrículas Ativas</p>
            <h3 className="text-2xl font-bold text-gray-900">{matriculasAtivas}</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4 hover:border-green-200 transition-colors">
          <div className="bg-green-50 text-green-600 p-3 rounded-lg">
            <LucideBookOpen size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Turmas Ativas</p>
            <h3 className="text-2xl font-bold text-gray-900">{turmasAtivas}</h3>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center gap-4 hover:border-amber-200 transition-colors">
          <div className="bg-amber-50 text-amber-600 p-3 rounded-lg">
            <LucideGraduationCap size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Funcionários</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalFuncionarios}</h3>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mt-2">Acesso Rápido</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/cadastros/pessoas" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-200 transition-all group">
          <div className="bg-blue-50 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LucideUsers size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Cadastros</h3>
          <p className="text-sm text-gray-500 line-clamp-2">Gestão de alunos, funcionários, responsáveis e turmas.</p>
        </Link>

        <Link href="/pedagogico" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-green-200 transition-all group">
          <div className="bg-green-50 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LucideGraduationCap size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Módulo Pedagógico</h3>
          <p className="text-sm text-gray-500 line-clamp-2">Lançamento de notas, faltas, diário de classe e boletins.</p>
        </Link>

        <Link href="/secretaria" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-purple-200 transition-all group">
          <div className="bg-purple-50 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LucideFileText size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Secretaria</h3>
          <p className="text-sm text-gray-500 line-clamp-2">Contratos, histórico escolar, atestados e ocorrências.</p>
        </Link>
        
        <Link href="/financeiro" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-emerald-200 transition-all group">
          <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <DollarSign size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Financeiro</h3>
          <p className="text-sm text-gray-500 line-clamp-2">Contas a pagar/receber, DRE, margens e calendário tributário.</p>
        </Link>

        <Link href="/rh" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-200 transition-all group">
          <div className="bg-indigo-50 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LucideUsers size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Recursos Humanos</h3>
          <p className="text-sm text-gray-500 line-clamp-2">Dossiê do colaborador, férias, ocorrências funcionais e folha.</p>
        </Link>

        <Link href="/configuracoes" className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-slate-200 transition-all group">
          <div className="bg-slate-100 text-slate-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <LucideSettings size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Configurações</h3>
          <p className="text-sm text-gray-500 line-clamp-2">Parâmetros do sistema, anos letivos e regras gerais.</p>
        </Link>
      </div>
    </div>
  )
}

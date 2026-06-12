import React from 'react'
import Link from 'next/link'
import { 
  LucideGraduationCap, 
  LucideUsers, 
  LucideFileText, 
  LucideUserCheck, 
  LucideBookOpen, 
  LucideShieldAlert, 
  LucideAward,
  LucideCheckCircle,
  LucideArrowRight,
  LucideBrain
} from 'lucide-react'

export default function ApresentacaoPage() {
  const perfis = [
    {
      id: 'professores',
      titulo: 'Corpo Docente',
      cargo: 'Professores',
      descricao: 'Diário de classe digital, lançamento simplificado de notas e frequências em tempo real, controle de conteúdo pedagógico e recuperações.',
      icone: LucideBookOpen,
      cor: 'from-amber-500 to-orange-600',
      shadowCor: 'shadow-orange-500/10',
      borderHover: 'hover:border-orange-300 dark:hover:border-orange-800'
    },
    {
      id: 'secretaria',
      titulo: 'Secretaria Escolar',
      cargo: 'Secretária / Atendentes',
      descricao: 'Gestão de matrículas, emissão automatizada de contratos e certidões, registro de ocorrências disciplinares e mural de avisos gerais.',
      icone: LucideFileText,
      cor: 'from-emerald-500 to-teal-600',
      shadowCor: 'shadow-teal-500/10',
      borderHover: 'hover:border-emerald-300 dark:hover:border-emerald-800'
    },
    {
      id: 'coordenadoras',
      titulo: 'Equipe Pedagógica',
      cargo: 'Coordenadoras',
      descricao: 'Estruturação da grade curricular, alocação de docentes a turmas, acompanhamento individualizado de alunos (PEI) e auditoria de registros.',
      icone: LucideUserCheck,
      cor: 'from-purple-500 to-indigo-600',
      shadowCor: 'shadow-indigo-500/10',
      borderHover: 'hover:border-purple-300 dark:hover:border-purple-800'
    },
    {
      id: 'alunos',
      titulo: 'Corpo Discente',
      cargo: 'Alunos',
      descricao: 'Acesso ao boletim de notas, acompanhamento do percentual de presença, visualização da grade horária semanal e download de declarações.',
      icone: LucideGraduationCap,
      cor: 'from-blue-500 to-cyan-600',
      shadowCor: 'shadow-cyan-500/10',
      borderHover: 'hover:border-blue-300 dark:hover:border-blue-800'
    },
    {
      id: 'responsaveis',
      titulo: 'Comunidade Familiar',
      cargo: 'Responsáveis Pedagógicos',
      descricao: 'Acompanhamento acadêmico de múltiplos filhos, controle financeiro de mensalidades, visualização de ocorrências e ciência de mural.',
      icone: LucideUsers,
      cor: 'from-sky-500 to-blue-600',
      shadowCor: 'shadow-blue-500/10',
      borderHover: 'hover:border-sky-300 dark:hover:border-sky-850'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-[11px] font-bold text-[var(--color-csm-red)] dark:text-red-400 uppercase tracking-widest animate-bounce">
          <span>Manual de Produção</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Como funciona o <span className="bg-gradient-to-r from-[var(--color-csm-red)] to-red-600 bg-clip-text text-transparent">Ponte CSM</span>?
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Um ambiente unificado e intuitivo para professores, coordenação, alunos, responsáveis e secretaria. Escolha seu perfil abaixo e aprenda como utilizar cada recurso com nossos simuladores.
        </p>
      </section>

      {/* Grid de Perfis */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Selecione seu Perfil de Acesso</h2>
            <p className="text-xs text-slate-500">Conheça o escopo de suas atribuições e experimente a ferramenta na prática.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {perfis.map((perfil) => {
            const Icon = perfil.icone
            return (
              <Link 
                key={perfil.id}
                href={`/apresentacao/${perfil.id}`}
                className={`group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm ${perfil.shadowCor} ${perfil.borderHover} transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:ring-2 hover:ring-red-500/10 cursor-pointer`}
              >
                {/* Ícone */}
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${perfil.cor} text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md`}>
                  <Icon size={24} />
                </div>
                
                {/* Conteúdo */}
                <div className="flex-grow space-y-2">
                  <span className="text-[10px] font-bold text-[var(--color-csm-red)] uppercase tracking-wider block">{perfil.cargo}</span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[var(--color-csm-red)] transition-colors">{perfil.titulo}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{perfil.descricao}</p>
                </div>
                
                {/* Rodapé Card */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-[var(--color-csm-red)] transition-colors">
                  <span>Conhecer Funções</span>
                  <LucideArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Regras de Ouro da Escola */}
      <section className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 dark:bg-red-950/30 text-[var(--color-csm-red)] p-2 rounded-xl">
            <LucideShieldAlert size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Regras de Ouro e Diretrizes Escolares</h2>
            <p className="text-xs text-slate-500">Conceitos fundamentais da infraestrutura pedagógica e de dados da instituição.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-2">
            <span className="text-base">🔢</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Arredondamento de Notas</h4>
            <p className="text-xs text-slate-500 leading-relaxed">As notas brutas das avaliações são automaticamente arredondadas para o <strong>0.5 mais próximo</strong> (ex: 7.3 vira 7.5, 7.2 vira 7.0) para simplificar a consolidação final.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-2">
            <span className="text-base">📅</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Frequência e Aprovação</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Para ser aprovado, o aluno deve possuir frequência <strong>igual ou superior a 75%</strong> das aulas dadas. O cálculo é feito de forma atômica no diário de classe.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-2">
            <span className="text-base">🔄</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">Recuperação Paralela</h4>
            <p className="text-xs text-slate-500 leading-relaxed">Se a média de um bimestre/trimestre for inferior a 6.0, o aluno tem direito à recuperação. A nova média calculada será: <strong>(Média Anterior + Nota da Recuperação) / 2</strong>.</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-2">
            <span className="text-base">🧠</span>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">AEE e Acessibilidade</h4>
            <p className="text-xs text-slate-500 leading-relaxed">O sistema possui um módulo completo de Inclusão, permitindo gerenciar o <strong>PEI (Plano Educacional Individualizado)</strong> com metas divididas por áreas e laudos clínicos confidenciais.</p>
          </div>
        </div>
      </section>

    </div>
  )
}

import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { 
  ProfessoresSimulador, 
  SecretariaSimulador, 
  CoordenadorasSimulador, 
  AlunosSimulador, 
  ResponsaveisSimulador 
} from '../components'
import { 
  LucideGraduationCap, 
  LucideUsers, 
  LucideFileText, 
  LucideUserCheck, 
  LucideBookOpen,
  LucideCompass,
  LucideHome,
  LucideInfo
} from 'lucide-react'

// Dados dos Perfis para Renderização
const perfilData = {
  professores: {
    titulo: 'Guia do Professor',
    subtitulo: 'Lançamento de diários de classe, notas de avaliações e frequências.',
    icone: LucideBookOpen,
    corBg: 'bg-amber-500/10 text-amber-605',
    colorHex: 'text-amber-500',
    atribuicoes: [
      { titulo: 'Diário de Classe', desc: 'Registrar o conteúdo das aulas diárias e a quantidade de horas letivas ministradas.' },
      { titulo: 'Lançamento de Faltas', desc: 'Controlar a chamada diária. Alunos precisam de no mínimo 75% de presença para aprovação.' },
      { titulo: 'Avaliações e Notas', desc: 'Criar provas, trabalhos e lançar notas brutas. O sistema aplica o arredondamento automático para o 0.5 mais próximo.' },
      { titulo: 'Recuperação Paralela', desc: 'Aplicar provas de recuperação para alunos com média inferior a 6.0, recalculando a média de forma automática.' }
    ],
    simulador: ProfessoresSimulador
  },
  secretaria: {
    titulo: 'Guia da Secretaria',
    subtitulo: 'Gestão da vida acadêmica, matrícula, contratos e registros burocráticos.',
    icone: LucideFileText,
    corBg: 'bg-emerald-500/10 text-emerald-600',
    colorHex: 'text-emerald-500',
    atribuicoes: [
      { titulo: 'Processo de Matrícula', desc: 'Realizar novas matrículas vinculando os alunos às turmas e anos letivos vigentes.' },
      { titulo: 'Contratos Financeiros', desc: 'Gerar contratos de prestação de serviços com valores de mensalidade e descontos parametrizados.' },
      { titulo: 'Ocorrências Disciplinares', desc: 'Registrar faltas disciplinares, advertências ou suspensões com rastro completo e providências aplicadas.' },
      { titulo: 'Mural de Avisos', desc: 'Publicar editais e comunicados direcionados (para a escola toda, séries ou turmas específicas) com leitura sob aviso de Ciente.' }
    ],
    simulador: SecretariaSimulador
  },
  coordenadoras: {
    titulo: 'Guia da Coordenação',
    subtitulo: 'Configuração da grade escolar, alocação docente e inclusão AEE.',
    icone: LucideUserCheck,
    corBg: 'bg-purple-500/10 text-purple-605',
    colorHex: 'text-purple-500',
    atribuicoes: [
      { titulo: 'Estruturação Pedagógica', desc: 'Criar e editar níveis de ensino, séries, disciplinas associadas e salas de aula físicas.' },
      { titulo: 'Alocação de Docentes', desc: 'Vincular professores às turmas e disciplinas correspondentes, indicando se é titular ou substituto.' },
      { titulo: 'PEI (AEE)', desc: 'Gerenciar o Prontuário de Atendimento Especializado (AEE) e estruturar o Plano Educacional Individualizado (PEI).' },
      { titulo: 'Auditoria de Dados', desc: 'Acompanhar logs de auditoria detalhados que registram inclusões, edições e exclusões (com justificativas).' }
    ],
    simulador: CoordenadorasSimulador
  },
  alunos: {
    titulo: 'Guia do Aluno',
    subtitulo: 'Consulta de boletim de notas, frequência acumulada e horários de aula.',
    icone: LucideGraduationCap,
    corBg: 'bg-blue-500/10 text-blue-600',
    colorHex: 'text-blue-500',
    atribuicoes: [
      { titulo: 'Boletim Escolar', desc: 'Verificar as notas obtidas nos trimestres, a média final por disciplina e a situação de aprovação.' },
      { titulo: 'Acompanhamento de Presença', desc: 'Consultar o percentual acumulado de presença nas aulas em tempo real, evitando retenção por faltas.' },
      { titulo: 'Quadro de Horários', desc: 'Verificar a distribuição das aulas pelos dias da semana e os professores de cada matéria.' },
      { titulo: 'Documentos Acadêmicos', desc: 'Realizar o download de declarações de matrícula geradas pela secretaria de forma instantânea.' }
    ],
    simulador: AlunosSimulador
  },
  responsaveis: {
    titulo: 'Guia do Responsável',
    subtitulo: 'Acompanhamento familiar, boletins integrados, ocorrências e mural.',
    icone: LucideUsers,
    corBg: 'bg-sky-500/10 text-sky-600',
    colorHex: 'text-sky-500',
    atribuicoes: [
      { titulo: 'Painel Multi-Dependentes', desc: 'Visualizar as informações acadêmicas de todos os filhos cadastrados sob sua tutela no mesmo painel.' },
      { titulo: 'Ciência de Comunicados', desc: 'Ler os avisos importantes direcionados à turma do filho e registrar a ciência de leitura obrigatória.' },
      { titulo: 'Boletins e Presença', desc: 'Monitorar o rendimento escolar, notas parciais, médias calculadas e faltas lançadas de cada dependente.' },
      { titulo: 'Ocorrências Pedagógicas', desc: 'Acompanhar observações disciplinares registradas pela coordenação e as providências tomadas.' }
    ],
    simulador: ResponsaveisSimulador
  }
}

type PerfilKey = keyof typeof perfilData

export default async function PerfilApresentacaoPage(props: { params: Promise<{ perfil: string }> }) {
  const { perfil } = await props.params
  
  if (!(perfil in perfilData)) {
    return notFound()
  }

  const data = perfilData[perfil as PerfilKey]
  const Icon = data.icone
  const Simulador = data.simulador

  const menuItens = [
    { id: 'professores', label: 'Professores', icone: LucideBookOpen },
    { id: 'secretaria', label: 'Secretaria', icone: LucideFileText },
    { id: 'coordenadoras', label: 'Coordenação', icone: LucideUserCheck },
    { id: 'alunos', label: 'Alunos', icone: LucideGraduationCap },
    { id: 'responsaveis', label: 'Responsáveis', icone: LucideUsers }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Navegação de Topo */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/apresentacao" className="hover:text-[var(--color-csm-red)] flex items-center gap-1 font-semibold transition-colors">
            <LucideHome size={14} /> Apresentação
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">{data.titulo}</span>
        </div>

        {/* Menu Rápido Lateral convertido em pílulas superiores */}
        <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-850">
          {menuItens.map((item) => {
            const MenuIcon = item.icone
            const active = item.id === perfil
            return (
              <Link
                key={item.id}
                href={`/apresentacao/${item.id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  active 
                    ? 'bg-white dark:bg-slate-800 text-[var(--color-csm-red)] shadow-sm border border-slate-200/50 dark:border-slate-700/50' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <MenuIcon size={14} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Bloco Esquerdo: Instruções e Atribuições (Didático) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 p-3 rounded-2xl ${data.corBg}`}>
              <Icon size={24} />
            </div>
            
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{data.titulo}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{data.subtitulo}</p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <LucideCompass size={14} />
              O que você está habilitado a fazer?
            </h3>

            <div className="space-y-4">
              {data.atribuicoes.map((at, idx) => (
                <div 
                  key={idx} 
                  className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 shadow-sm hover:border-slate-300 dark:hover:border-slate-750 transition-colors"
                >
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{at.titulo}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{at.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-2xl flex gap-3 text-xs text-blue-800 dark:text-blue-300">
            <LucideInfo size={18} className="shrink-0 text-blue-500" />
            <div>
              <span className="font-bold block mb-1">Dica de Produtividade</span>
              <p className="leading-relaxed">O sistema CSM conta com políticas automáticas de salvamento de estado. Todas as operações principais avisam no topo se foram gravadas no banco de dados com segurança.</p>
            </div>
          </div>
        </div>

        {/* Bloco Direito: Simulador Prático Interativo (Visual) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <span>🖥️</span>
              <span>Laboratório Prático (Simulador Vivo)</span>
            </h3>
            <span className="text-[10px] text-green-600 font-bold bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping"></span> Ambiente Seguro
            </span>
          </div>

          <Simulador />
        </div>

      </div>

    </div>
  )
}

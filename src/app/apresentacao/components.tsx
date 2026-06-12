'use client'

import React, { useState } from 'react'
import { 
  LucideGraduationCap, 
  LucideUsers, 
  LucideFileText, 
  LucideUserCheck, 
  LucideBookOpen, 
  LucideCheckCircle, 
  LucideAlertCircle, 
  LucideCalendar, 
  LucideClock, 
  LucidePlusCircle, 
  LucideEdit3, 
  LucideAward,
  LucideClipboard,
  LucideArrowRight,
  LucideUserPlus,
  LucideCheck,
  LucideFileSpreadsheet,
  LucideHeart,
  LucideBell
} from 'lucide-react'

// ==========================================
// UTILITÁRIO DE ARREDONDAMENTO PEDAGÓGICO
// ==========================================
// Regra do projeto: Notas arredondadas no 0.5 mais próximo.
// Exemplo: 7.2 -> 7.0, 7.3 -> 7.5, 7.7 -> 7.5, 7.8 -> 8.0
function arredondarNota(nota: number): number {
  return Math.round(nota * 2) / 2
}

// ==========================================
// 1. SIMULADOR DO PROFESSOR (DIÁRIO DE CLASSE)
// ==========================================
export function ProfessoresSimulador() {
  const [nota1, setNota1] = useState<string>('7.2')
  const [nota2, setNota2] = useState<string>('5.1')
  const [recup, setRecup] = useState<string>('')
  const [frequencia, setFrequencia] = useState<number>(80)

  const n1 = parseFloat(nota1) || 0
  const n2 = parseFloat(nota2) || 0
  const r = parseFloat(recup) || 0

  const n1Arredondada = arredondarNota(n1)
  const n2Arredondada = arredondarNota(n2)
  
  let mediaInicial = (n1Arredondada + n2Arredondada) / 2
  mediaInicial = arredondarNota(mediaInicial)

  let mediaFinal = mediaInicial
  let usouRecuperacao = false

  if (mediaInicial < 6.0 && r > 0) {
    mediaFinal = (mediaInicial + r) / 2
    mediaFinal = arredondarNota(mediaFinal)
    usouRecuperacao = true
  }

  const freqAprovada = frequencia >= 75
  const mediaAprovada = mediaFinal >= 6.0
  const status = (mediaAprovada && freqAprovada) 
    ? 'Aprovado' 
    : (!freqAprovada) 
      ? 'Reprovado por Falta' 
      : (mediaInicial < 6.0 && r === 0) 
        ? 'Em Recuperação' 
        : 'Reprovado por Média'

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 p-2 rounded-xl">
          <LucideBookOpen size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Simulador de Diário de Classe</h3>
          <p className="text-xs text-slate-500">Teste o lançamento de notas e a regra de arredondamento automática do CSM.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel de Lançamento */}
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Lançamento de Dados</h4>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nota Avaliação 1</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="10"
                  value={nota1}
                  onChange={(e) => setNota1(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Arredondada: <strong>{n1Arredondada.toFixed(1)}</strong></span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nota Avaliação 2</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="10"
                  value={nota2}
                  onChange={(e) => setNota2(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Arredondada: <strong>{n2Arredondada.toFixed(1)}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Frequência (%)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="50" 
                    max="100" 
                    value={frequencia}
                    onChange={(e) => setFrequencia(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 w-10 text-right">{frequencia}%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Recuperação Paralela</label>
                <input 
                  type="number" 
                  step="0.1" 
                  min="0" 
                  max="10"
                  placeholder="Só se média < 6"
                  disabled={mediaInicial >= 6.0}
                  value={recup}
                  onChange={(e) => setRecup(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {mediaInicial >= 6.0 ? "Não necessária (Média >= 6.0)" : `Arredondada: ${arredondarNota(r).toFixed(1)}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel de Resultados */}
        <div className="flex flex-col justify-between bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Resultado da Regra Pedagógica</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Média das Provas:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{mediaInicial.toFixed(1)}</span>
              </div>

              {usouRecuperacao && (
                <div className="flex justify-between items-center text-sm text-amber-600 dark:text-amber-400">
                  <span>Média c/ Recuperação:</span>
                  <span className="font-semibold">({mediaInicial.toFixed(1)} + {arredondarNota(r).toFixed(1)}) / 2 = {mediaFinal.toFixed(1)}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Mínimo de Frequência:</span>
                <span className={`font-semibold ${freqAprovada ? 'text-green-600' : 'text-red-600'}`}>
                  {frequencia}% {freqAprovada ? ' (Aprovado)' : ' (Reprovado)'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block uppercase">Situação Final</span>
              <span className={`text-lg font-bold ${
                status === 'Aprovado' 
                  ? 'text-green-600 dark:text-green-400' 
                  : status === 'Em Recuperação' 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : 'text-red-600 dark:text-red-400'
              }`}>
                {status}
              </span>
            </div>
            
            <div className={`p-2 rounded-lg ${
              status === 'Aprovado' 
                ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400' 
                : status === 'Em Recuperação' 
                  ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400' 
                  : 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400'
            }`}>
              {status === 'Aprovado' ? <LucideCheckCircle size={24} /> : <LucideAlertCircle size={24} />}
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 p-3 rounded-xl mt-4 flex gap-3 text-xs text-blue-800 dark:text-blue-300">
        <span className="text-base">💡</span>
        <p>
          <strong>Dica do Designer:</strong> O sistema elimina as contas manuais e arredondamentos inconsistentes. O professor apenas digita as notas brutas; o sistema faz o resto e sinaliza automaticamente quem precisa de recuperação ou quem estourou em faltas.
        </p>
      </div>
    </div>
  )
}

// ==========================================
// 2. SIMULADOR DA SECRETARIA (MATRÍCULA & CONTRATO)
// ==========================================
export function SecretariaSimulador() {
  const [alunoNome, setAlunoNome] = useState('Mariana Albuquerque')
  const [turmaTipo, setTurmaTipo] = useState('Ensino Fundamental')
  const [mensalidade, setMensalidade] = useState(850)
  const [desconto, setDesconto] = useState(10)
  const [contratoCriado, setContratoCriado] = useState(false)

  const matriculaGerada = 'MAT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000)
  const valorComDesconto = mensalidade * (1 - desconto / 100)

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 p-2 rounded-xl">
          <LucideFileText size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Simulador de Secretaria</h3>
          <p className="text-xs text-slate-500">Experimente simular uma matrícula e a geração automática do contrato financeiro.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nome Completo do Aluno</label>
            <input 
              type="text"
              value={alunoNome}
              onChange={(e) => setAlunoNome(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Nível de Ensino</label>
              <select 
                value={turmaTipo}
                onChange={(e) => setTurmaTipo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              >
                <option value="Educação Infantil">Educação Infantil</option>
                <option value="Ensino Fundamental">Ensino Fundamental</option>
                <option value="Ensino Técnico">Ensino Técnico</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Desconto (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100"
                value={desconto}
                onChange={(e) => setDesconto(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            onClick={() => setContratoCriado(true)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <LucideUserPlus size={16} />
            Gerar Matrícula & Contrato
          </button>
        </div>

        {/* Visualização de Resultados */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 flex flex-col justify-between min-h-[200px]">
          {contratoCriado ? (
            <div className="space-y-3 text-sm animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
                <LucideCheckCircle size={18} />
                <span>Documentos Gerados!</span>
              </div>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2 text-xs">
                <div><span className="text-slate-400">RA/Matrícula:</span> <strong className="font-mono text-slate-700 dark:text-slate-300">{matriculaGerada}</strong></div>
                <div><span className="text-slate-400">Aluno:</span> <strong className="text-slate-700 dark:text-slate-300">{alunoNome}</strong></div>
                <div><span className="text-slate-400">Nível:</span> <strong className="text-slate-700 dark:text-slate-300">{turmaTipo}</strong></div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                  <span className="text-slate-400">Mensalidade Cheia:</span>
                  <span className="line-through text-slate-400">R$ {mensalidade.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-800 dark:text-slate-200">
                  <span className="text-slate-400">Com Desconto ({desconto}%):</span>
                  <strong className="text-emerald-600 text-sm">R$ {valorComDesconto.toFixed(2)}</strong>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => alert('Contrato enviado para assinatura digital via e-mail e Portal do Responsável!')}
                  className="flex-1 text-[11px] bg-slate-800 text-white py-1.5 rounded hover:bg-slate-700 font-medium transition-colors"
                >
                  🚀 Assinatura Virtual
                </button>
                <button 
                  onClick={() => setContratoCriado(false)}
                  className="px-3 text-[11px] border border-slate-300 text-slate-600 dark:text-slate-400 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
                >
                  Novo
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 p-4">
              <LucideFileSpreadsheet size={48} className="text-slate-300 mb-2 stroke-1" />
              <p className="text-xs">Preencha os dados ao lado e clique em <strong>"Gerar Matrícula & Contrato"</strong> para simular o processo automatizado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 3. SIMULADOR DA COORDENAÇÃO (ALOCAÇÃO & AEE)
// ==========================================
export function CoordenadorasSimulador() {
  const [docente, setDocente] = useState('Prof. Ricardo Souza')
  const [materia, setMateria] = useState('Algoritmos e Lógica')
  const [peiObjetivos, setPeiObjetivos] = useState('Desenvolver raciocínio lógico básico com apoio visual e uso de blocos de montar.')
  const [metas, setMetas] = useState([
    { id: 1, area: 'Pedagógica', desc: 'Identificar estruturas de repetição', status: 'em_progresso' },
    { id: 2, area: 'Técnica', desc: 'Escrever pseudo-código guiado', status: 'nao_iniciado' },
    { id: 3, area: 'Autonomia', desc: 'Utilizar software assistivo de tela', status: 'alcancada' }
  ])

  const toggleMeta = (id: number) => {
    setMetas(metas.map(meta => {
      if (meta.id === id) {
        const nextStatus = meta.status === 'nao_iniciado' 
          ? 'em_progresso' 
          : meta.status === 'em_progresso' 
            ? 'alcancada' 
            : 'nao_iniciado'
        return { ...meta, status: nextStatus }
      }
      return meta
    }))
  }

  const progresso = Math.round((metas.filter(m => m.status === 'alcancada').length / metas.length) * 100)

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 p-2 rounded-xl">
          <LucideUserCheck size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Simulador de Coordenação (AEE & Grade)</h3>
          <p className="text-xs text-slate-500">Gerencie a alocação de docentes e as metas de inclusão no AEE (PEI).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel Esquerdo: Alocação Docente */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 rounded-xl">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Alocação de Docente na Grade</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                <span className="font-medium text-slate-700 dark:text-slate-300">1º Ano Técnico - Turma A</span>
                <span className="text-[10px] text-slate-400">Turno: Manhã</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Componente Curricular</label>
                  <select 
                    value={materia}
                    onChange={(e) => setMateria(e.target.value)}
                    className="w-full p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded focus:outline-none"
                  >
                    <option value="Algoritmos e Lógica">Algoritmos e Lógica</option>
                    <option value="Banco de Dados">Banco de Dados</option>
                    <option value="Desenvolvimento Web">Desenvolvimento Web</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Docente Habilitado</label>
                  <select 
                    value={docente}
                    onChange={(e) => setDocente(e.target.value)}
                    className="w-full p-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded focus:outline-none"
                  >
                    <option value="Prof. Ricardo Souza">Prof. Ricardo Souza</option>
                    <option value="Profa. Ana Clara">Profa. Ana Clara</option>
                    <option value="Prof. Carlos Mendes">Prof. Carlos Mendes</option>
                  </select>
                </div>
              </div>
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded border border-emerald-100 dark:border-emerald-900/30 text-[10px] flex items-center gap-1">
                <span>🟢</span>
                <span><strong>{docente}</strong> está alocado em <strong>{materia}</strong> para esta turma.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito: Acompanhamento de PEI (AEE) */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 rounded-xl space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acompanhamento PEI (AEE)</h4>
              <span className="text-xs bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 px-2 py-0.5 rounded-full font-bold">{progresso}% concluído</span>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div className="bg-purple-600 h-full transition-all duration-500" style={{ width: `${progresso}%` }}></div>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-slate-500"><strong>Objetivo do PEI:</strong> {peiObjetivos}</p>
              
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Metas de Aprendizagem (Clique para alterar o status)</span>
                
                {metas.map(meta => (
                  <div 
                    key={meta.id}
                    onClick={() => toggleMeta(meta.id)}
                    className="flex justify-between items-center p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded cursor-pointer hover:border-purple-300 dark:hover:border-purple-800 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400">{meta.area}</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{meta.desc}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      meta.status === 'alcancada' 
                        ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400' 
                        : meta.status === 'em_progresso' 
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {meta.status === 'alcancada' ? 'Alcançada' : meta.status === 'em_progresso' ? 'Em Progresso' : 'Não Iniciada'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 4. SIMULADOR DO ALUNO (BOLETIM E HORÁRIOS)
// ==========================================
export function AlunosSimulador() {
  const [selectedDia, setSelectedDia] = useState<string>('segunda')

  const disciplinas = [
    { nome: 'Matemática', t1: '8.0', t2: '7.5', t3: '8.5', freq: 92 },
    { nome: 'História', t1: '7.0', t2: '6.5', t3: '7.5', freq: 88 },
    { nome: 'Geografia', t1: '5.5', t2: '8.0', t3: '7.0', freq: 94 },
    { nome: 'Téc. Programação', t1: '9.0', t2: '9.5', t3: '9.0', freq: 98 }
  ]

  const cronograma: Record<string, string[]> = {
    segunda: ['07:30 - Matemática', '09:20 - Física', '10:30 - Téc. Programação'],
    terca: ['07:30 - História', '09:20 - Geografia', '10:30 - Inglês'],
    quarta: ['07:30 - Algoritmos', '09:20 - Química', '10:30 - Sociologia'],
    quinta: ['07:30 - Português', '09:20 - Artes', '10:30 - Téc. Programação'],
    sexta: ['07:30 - Educação Física', '09:20 - Matemática', '10:30 - Banco de Dados']
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-xl">
          <LucideGraduationCap size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white">Simulador do Portal do Aluno</h3>
          <p className="text-xs text-slate-500">Veja como os alunos acompanham suas notas, frequência e grade de aulas.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Boletim */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Boletim Escolar Digital</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                    <th className="py-2">Matéria</th>
                    <th className="py-2 text-center">T1</th>
                    <th className="py-2 text-center">T2</th>
                    <th className="py-2 text-center">T3</th>
                    <th className="py-2 text-center">Média</th>
                    <th className="py-2 text-right">Freq</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {disciplinas.map((disc, idx) => {
                    const m = (parseFloat(disc.t1) + parseFloat(disc.t2) + parseFloat(disc.t3)) / 3
                    const media = arredondarNota(m)
                    return (
                      <tr key={idx} className="text-slate-700 dark:text-slate-300">
                        <td className="py-2 font-medium">{disc.nome}</td>
                        <td className="py-2 text-center text-slate-400">{disc.t1}</td>
                        <td className="py-2 text-center text-slate-400">{disc.t2}</td>
                        <td className="py-2 text-center text-slate-400">{disc.t3}</td>
                        <td className={`py-2 text-center font-bold ${media >= 6 ? 'text-green-600' : 'text-red-600'}`}>
                          {media.toFixed(1)}
                        </td>
                        <td className={`py-2 text-right font-medium ${disc.freq >= 75 ? 'text-slate-600 dark:text-slate-400' : 'text-red-600 font-bold'}`}>
                          {disc.freq}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Cronograma / Horários */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quadro de Horário de Aulas</h4>
            
            {/* Seletor Dia */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {['segunda', 'terca', 'quarta', 'quinta', 'sexta'].map((dia) => (
                <button
                  key={dia}
                  onClick={() => setSelectedDia(dia)}
                  className={`px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                    selectedDia === dia 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {dia.slice(0, 3)}
                </button>
              ))}
            </div>

            {/* Listagem Aulas */}
            <div className="space-y-2 pt-1">
              {cronograma[selectedDia].map((aula, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded text-xs text-slate-700 dark:text-slate-300"
                >
                  <LucideClock size={14} className="text-slate-400" />
                  <span>{aula}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==========================================
// 5. SIMULADOR DO RESPONSÁVEL (PORTAL FAMILIAR)
// ==========================================
export function ResponsaveisSimulador() {
  const [selectedFilho, setSelectedFilho] = useState<'filho1' | 'filho2'>('filho1')
  const [avisos, setAvisos] = useState([
    { id: 1, titulo: 'Reunião de Pais e Mestres', data: '18/06', conteudo: 'Discussão sobre fechamento do trimestre letivo.', ciente: false },
    { id: 2, titulo: 'Campanha de Vacinação Escolar', data: '22/06', conteudo: 'Necessária apresentação de carteirinha atualizada.', ciente: true }
  ])

  const registrarCiente = (id: number) => {
    setAvisos(avisos.map(aviso => {
      if (aviso.id === id) {
        return { ...aviso, ciente: true }
      }
      return aviso
    }))
  }

  const ocorrencias = {
    filho1: [
      { data: '10/06/2026', titulo: 'Atraso na entrada', desc: 'Chegou 20 minutos após o início da primeira aula.', providencia: 'Advertência verbal e registro.' }
    ],
    filho2: []
  }

  const boletimResumido = {
    filho1: { nome: 'Ana Silva (Fundamental)', media: '7.8', frequencia: '93%' },
    filho2: { nome: 'Pedro Silva (Técnico)', media: '8.9', frequencia: '97%' }
  }

  const filhoAtivoInfo = boletimResumido[selectedFilho]
  const filhoAtivoOcorrencias = ocorrencias[selectedFilho]

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 p-2 rounded-xl">
            <LucideUsers size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Portal do Responsável Pedagógico</h3>
            <p className="text-xs text-slate-500">Monitore as notas de seus filhos e acene os avisos importantes.</p>
          </div>
        </div>

        {/* Seletor de Dependentes */}
        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedFilho('filho1')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              selectedFilho === 'filho1' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Ana
          </button>
          <button 
            onClick={() => setSelectedFilho('filho2')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
              selectedFilho === 'filho2' 
                ? 'bg-sky-600 text-white shadow-sm' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Pedro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Painel Esquerdo: Resumo do Dependente */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Visão Geral: {filhoAtivoInfo.nome}</h4>
            
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Média Geral</span>
                <span className="text-xl font-bold text-slate-800 dark:text-slate-200">{filhoAtivoInfo.media}</span>
              </div>
              
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-[10px] text-slate-400 uppercase font-medium block">Frequência</span>
                <span className="text-xl font-bold text-green-600">{filhoAtivoInfo.frequencia}</span>
              </div>
            </div>

            {/* Ocorrências */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Ocorrências Recentes</span>
              {filhoAtivoOcorrencias.length > 0 ? (
                filhoAtivoOcorrencias.map((oc, idx) => (
                  <div key={idx} className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-xs rounded space-y-1">
                    <div className="flex justify-between font-bold text-amber-800 dark:text-amber-400">
                      <span>⚠️ {oc.titulo}</span>
                      <span>{oc.data}</span>
                    </div>
                    <p className="text-amber-700 dark:text-amber-300">{oc.desc}</p>
                    <p className="text-[10px] text-amber-600"><strong>Providência:</strong> {oc.providencia}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">Nenhuma ocorrência registrada para este dependente.</p>
              )}
            </div>
          </div>
        </div>

        {/* Painel Direito: Mural de Avisos */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/50 rounded-xl space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <LucideBell size={14} className="text-sky-500" />
              Mural de Avisos
            </h4>

            <div className="space-y-3">
              {avisos.map(aviso => (
                <div 
                  key={aviso.id} 
                  className={`p-3 rounded-lg border text-xs space-y-2 transition-all ${
                    aviso.ciente 
                      ? 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70' 
                      : 'bg-white dark:bg-slate-900 border-sky-200 dark:border-sky-900 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{aviso.titulo}</span>
                    <span className="text-slate-400 font-normal">{aviso.data}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">{aviso.conteudo}</p>
                  
                  <div className="flex justify-end pt-1">
                    {aviso.ciente ? (
                      <span className="text-green-600 dark:text-green-400 font-bold flex items-center gap-1 text-[10px]">
                        <LucideCheck size={12} /> Ciente Confirmado
                      </span>
                    ) : (
                      <button
                        onClick={() => registrarCiente(aviso.id)}
                        className="bg-sky-600 hover:bg-sky-700 text-white px-2.5 py-1 rounded text-[10px] font-semibold transition-colors flex items-center gap-1"
                      >
                        Marcar como Ciente
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

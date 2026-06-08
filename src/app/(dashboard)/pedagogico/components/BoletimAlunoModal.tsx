'use client'

import { useState, useEffect } from 'react'
import { LucideX, LucideLoader2, LucideAward, LucideBookOpen } from 'lucide-react'
import { getBoletimEHorarioFilho } from '@/actions/responsavel'

interface BoletimAlunoModalProps {
  aluno: { alunoId: string; matriculaId: string; nomeCompleto: string; numeroMatricula: string };
  turma: { id: string; nome: string };
  onClose: () => void;
}

export function BoletimAlunoModal({ aluno, turma, onClose }: BoletimAlunoModalProps) {
  const [loading, setLoading] = useState(true)
  const [boletim, setBoletim] = useState<any[]>([])

  useEffect(() => {
    loadBoletim()
  }, [])

  const loadBoletim = async () => {
    setLoading(true)
    const res = await getBoletimEHorarioFilho(aluno.alunoId, aluno.matriculaId, turma.id)
    if (res.success && res.data) {
      setBoletim(res.data.boletim)
    }
    setLoading(false)
  }

  // Identificar todos os períodos (bimestres) existentes nas notas para montar o cabeçalho dinâmico
  const periodosSet = new Set<string>()
  boletim.forEach(disc => {
    disc.mediasPeriodo.forEach((mp: any) => periodosSet.add(mp.periodo))
  })
  const periodos = Array.from(periodosSet).sort()

  const getMediaByPeriodo = (disc: any, periodo: string) => {
    const p = disc.mediasPeriodo.find((mp: any) => mp.periodo === periodo)
    return p ? p.media / 100 : null
  }

  const formatGrade = (nota: number | null) => {
    if (nota === null) return '-'
    return nota.toFixed(1).replace('.', ',')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LucideAward className="text-blue-600 dark:text-blue-400" />
              Boletim Geral do Estudante
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              <strong>{aluno.nomeCompleto}</strong> (Matrícula: {aluno.numeroMatricula}) - {turma.nome}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 rounded-lg transition-colors"
          >
            <LucideX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-900">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <LucideLoader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-500 font-medium">Buscando notas e frequências...</p>
            </div>
          ) : boletim.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <LucideBookOpen className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
              Nenhum dado avaliativo ou frequência registrada para este aluno até o momento.
            </div>
          ) : (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Disciplina</th>
                      {periodos.map(p => (
                        <th key={p} className="px-4 py-4 font-semibold text-center uppercase tracking-wider text-xs whitespace-nowrap">{p}</th>
                      ))}
                      <th className="px-4 py-4 font-bold text-center text-blue-700 dark:text-blue-400 uppercase tracking-wider text-xs bg-blue-50/50 dark:bg-blue-900/20">Média Final</th>
                      <th className="px-4 py-4 font-semibold text-center uppercase tracking-wider text-xs">Faltas</th>
                      <th className="px-4 py-4 font-semibold text-center uppercase tracking-wider text-xs">% Freq.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {boletim.map(disc => (
                      <tr key={disc.disciplinaId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 text-slate-900 dark:text-slate-200 font-medium">{disc.disciplinaNome}</td>
                        
                        {periodos.map(p => {
                          const media = getMediaByPeriodo(disc, p)
                          return (
                            <td key={p} className="px-4 py-4 text-center">
                              <span className={`font-medium ${media !== null ? (media >= 6 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400') : 'text-slate-400'}`}>
                                {formatGrade(media)}
                              </span>
                            </td>
                          )
                        })}

                        <td className="px-4 py-4 text-center bg-blue-50/30 dark:bg-blue-900/10">
                          {(() => {
                            const mediaFinalCalc = disc.mediaFinal !== null ? disc.mediaFinal / 100 : null;
                            return (
                              <span className={`font-bold text-base ${mediaFinalCalc !== null ? (mediaFinalCalc >= 6 ? 'text-blue-700 dark:text-blue-400' : 'text-red-600 dark:text-red-400') : 'text-slate-400'}`}>
                                {formatGrade(mediaFinalCalc)}
                              </span>
                            )
                          })()}
                        </td>
                        <td className="px-4 py-4 text-center text-slate-600 dark:text-slate-400 font-medium">
                          {disc.totalFaltas}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${disc.presencaPerc >= 75 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'}`}>
                            {disc.presencaPerc}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

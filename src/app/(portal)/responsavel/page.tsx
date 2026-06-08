'use client'

import { useState, useEffect } from 'react'
import { Megaphone, Calendar, Award, AlertTriangle, CheckCircle2, User, RefreshCw } from 'lucide-react'
import { getFilhosVinculados, getBoletimEHorarioFilho, getMuralAvisosResponsavel, marcarCienteAviso, getLoggedResponsavelId } from '@/actions/responsavel'
import { getPessoas } from '@/actions/pessoa' // para o seletor de debug

export default function PortalResponsavelPage() {
  const [isDev, setIsDev] = useState(false)
  const [responsaveis, setResponsaveis] = useState<any[]>([])
  const [selectedResponsavelId, setSelectedResponsavelId] = useState<string>('')
  
  const [filhos, setFilhos] = useState<any[]>([])
  const [selectedFilho, setSelectedFilho] = useState<any>(null)
  
  const [pedagogicoData, setPedagogicoData] = useState<any>({ ocorrencias: [], horarios: [], boletim: [] })
  const [avisos, setAvisos] = useState<any[]>([])
  
  const [loading, setLoading] = useState(true)
  const [loadingChildData, setLoadingChildData] = useState(false)
  const [isCienteLoading, setIsCienteLoading] = useState<string | null>(null)
  
  const [activeTab, setActiveTab] = useState<'avisos' | 'horario' | 'boletim'>('avisos')
  const [selectedDiaSemana, setSelectedDiaSemana] = useState<string>('')

  const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
  const diasLabels: any = {
    segunda: 'Segunda-feira',
    terca: 'Terça-feira',
    quarta: 'Quarta-feira',
    quinta: 'Quinta-feira',
    sexta: 'Sexta-feira',
    sabado: 'Sábado',
    domingo: 'Domingo'
  }

  // Detecta dia da semana atual e resolve responsável logado
  useEffect(() => {
    const diaNum = new Date().getDay() // 0=domingo, 1=segunda...
    const mapeamento: any = {
      1: 'segunda',
      2: 'terca',
      3: 'quarta',
      4: 'quinta',
      5: 'sexta',
      6: 'sabado',
      0: 'domingo'
    }
    setSelectedDiaSemana(mapeamento[diaNum] || 'segunda')
    
    // Detecta modo de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      setIsDev(true)
      loadResponsaveis()
    } else {
      // Produção: Resolve o ID do usuário real autenticado
      getLoggedResponsavelId().then((res) => {
        if (res.success && res.id) {
          setSelectedResponsavelId(res.id)
        } else {
          // Fallback se não conseguir resolver
          setSelectedResponsavelId('00000000-0000-0000-0000-000000000000')
        }
      })
    }
  }, [])

  // Carrega lista de responsáveis caso dev
  async function loadResponsaveis() {
    try {
      const res = await getPessoas({ limit: 100 }) // busca pessoas gerais
      if (res.success && res.data) {
        // Deduplica e filtra por tipo 'responsavel'
        const uniqueMap = new Map()
        res.data.forEach((p: any) => {
          if (!uniqueMap.has(p.id)) {
            uniqueMap.set(p.id, p)
          } else if (p.tipo === 'responsavel') {
            // Se já existe mas este registro é o de responsável, substitui para garantir
            uniqueMap.set(p.id, p)
          }
        })
        const uniquePessoas = Array.from(uniqueMap.values())
        const respOnly = uniquePessoas.filter((p: any) => p.tipo === 'responsavel')
        
        setResponsaveis(respOnly.length > 0 ? respOnly : uniquePessoas)
        if (respOnly.length > 0) {
          setSelectedResponsavelId(respOnly[0].id)
        } else if (uniquePessoas.length > 0) {
          setSelectedResponsavelId(uniquePessoas[0].id)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Carrega os filhos toda vez que muda o responsável selecionado
  useEffect(() => {
    if (selectedResponsavelId) {
      loadFilhos()
    }
  }, [selectedResponsavelId])

  async function loadFilhos() {
    setLoading(true)
    try {
      const res = await getFilhosVinculados(selectedResponsavelId)
      if (res.success && res.data) {
        setFilhos(res.data)
        if (res.data.length > 0) {
          setSelectedFilho(res.data[0])
        } else {
          setSelectedFilho(null)
          setPedagogicoData({ ocorrencias: [], horarios: [], boletim: [] })
          setAvisos([])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Carrega os dados pedagógicos e comunicados do filho selecionado
  useEffect(() => {
    if (selectedFilho) {
      loadFilhoData()
    }
  }, [selectedFilho])

  async function loadFilhoData() {
    setLoadingChildData(true)
    try {
      const [pedRes, avRes] = await Promise.all([
        getBoletimEHorarioFilho(selectedFilho.alunoId, selectedFilho.matriculaId, selectedFilho.turmaId),
        getMuralAvisosResponsavel(selectedResponsavelId, selectedFilho.alunoId)
      ])
      
      if (pedRes.success && pedRes.data) {
        setPedagogicoData(pedRes.data)
      }
      if (avRes.success && avRes.data) {
        setAvisos(avRes.data || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingChildData(false)
    }
  }

  async function handleCiente(avisoId: string) {
    if (!selectedFilho) return
    setIsCienteLoading(avisoId)
    try {
      const res = await marcarCienteAviso(avisoId, selectedResponsavelId, selectedFilho.alunoId)
      if (res.success) {
        // Recarrega mural de avisos para atualizar status
        const avRes = await getMuralAvisosResponsavel(selectedResponsavelId, selectedFilho.alunoId)
        if (avRes.success) {
          setAvisos(avRes.data || [])
        }
      } else {
        alert(res.error || 'Erro ao registrar ciência')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsCienteLoading(null)
    }
  }

  // Horários filtrados pelo dia selecionado
  const horariosDoDia = pedagogicoData.horarios.filter((h: any) => h.diaSemana === selectedDiaSemana)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      {/* Topo / Seletor de Teste em Dev */}
      {isDev && (
        <div className="bg-amber-50 border-b border-amber-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2 text-amber-800 font-medium">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
            Simulador do Portal (Ambiente de Testes)
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <label className="text-amber-800 font-medium whitespace-nowrap">Visualizar como:</label>
            <select
              value={selectedResponsavelId}
              onChange={(e) => setSelectedResponsavelId(e.target.value)}
              className="border border-amber-300 rounded px-2 py-1 text-gray-900 bg-white w-full sm:w-60 focus:outline-none"
            >
              {responsaveis.map((r: any) => (
                <option key={r.id} value={r.id}>{r.nomeCompleto} ({r.cpf ? `CPF: ${r.cpf}` : 'Sem CPF'})</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Header Premium do Portal */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[var(--color-csm-red)] flex items-center justify-center text-white font-bold shadow-md shadow-red-900/10">
              CSM
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Portal da Família</h1>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Colégio Santa Mônica</p>
            </div>
          </div>
          
          <button 
            onClick={() => selectedFilho && loadFilhoData()} 
            disabled={loadingChildData}
            className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200/80 rounded-full transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loadingChildData ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5 space-y-5">
        {/* Seletor de Filho (Pills) */}
        {filhos.length > 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Seus Filhos Matriculados:</div>
            <div className="flex flex-wrap gap-2">
              {filhos.map((f) => (
                <button
                  key={f.alunoId}
                  onClick={() => setSelectedFilho(f)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                    selectedFilho?.alunoId === f.alunoId
                      ? 'bg-red-50 text-[var(--color-csm-red)] border-[var(--color-csm-red)] shadow-sm'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <User size={14} />
                  {f.nomeCompleto.split(' ')[0]}
                </button>
              ))}
            </div>

            {selectedFilho && (
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <div>
                  <span className="font-semibold text-gray-700">Turma: </span>
                  {selectedFilho.turmaNome || 'Não alocado'}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Série: </span>
                  {selectedFilho.serieNome || 'N/A'}
                </div>
              </div>
            )}
          </div>
        ) : (
          !loading && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center space-y-3">
              <User className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="text-base font-bold text-gray-800">Nenhum filho vinculado</h3>
              <p className="text-xs text-gray-500">
                Seus dados de responsável ainda não possuem vínculos com alunos ativos. Entre em contato com a secretaria do Santa Mônica para regularizar.
              </p>
            </div>
          )
        )}

        {selectedFilho && (
          <>
            {/* Navegação por Abas (Mural, Horários, Boletim) */}
            <div className="grid grid-cols-3 bg-white border border-gray-200 rounded-xl p-1 shadow-sm font-medium">
              <button
                onClick={() => setActiveTab('avisos')}
                className={`flex flex-col items-center gap-1 py-2 text-xs rounded-lg transition-all ${
                  activeTab === 'avisos'
                    ? 'bg-[var(--color-csm-red)] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Megaphone size={16} />
                Mural
              </button>
              <button
                onClick={() => setActiveTab('horario')}
                className={`flex flex-col items-center gap-1 py-2 text-xs rounded-lg transition-all ${
                  activeTab === 'horario'
                    ? 'bg-[var(--color-csm-red)] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Calendar size={16} />
                Horários
              </button>
              <button
                onClick={() => setActiveTab('boletim')}
                className={`flex flex-col items-center gap-1 py-2 text-xs rounded-lg transition-all ${
                  activeTab === 'boletim'
                    ? 'bg-[var(--color-csm-red)] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Award size={16} />
                Pedagógico
              </button>
            </div>

            {/* Conteúdo Carregando */}
            {loadingChildData ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-csm-red)]"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* ABA 1: MURAL DE AVISOS */}
                {activeTab === 'avisos' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Comunicados da Escola</h2>
                      <span className="text-xs bg-red-50 text-[var(--color-csm-red)] px-2 py-0.5 rounded-full font-bold">
                        {avisos.filter(a => !a.ciente).length} Novos
                      </span>
                    </div>

                    {avisos.map((av) => (
                      <div key={av.id} className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${
                        av.ciente ? 'border-gray-200' : 'border-red-200 ring-1 ring-red-100'
                      }`}>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <h3 className="text-base font-bold text-gray-900 leading-tight">{av.titulo}</h3>
                          {av.ciente && (
                            <span className="flex items-center gap-0.5 text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                              <CheckCircle2 size={10} />
                              Lido
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap leading-relaxed">{av.conteudo}</p>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-50 pt-3">
                          <span className="text-[10px] text-gray-400 font-medium">
                            Publicado em {new Date(av.dataPublicacao).toLocaleDateString('pt-BR')}
                          </span>
                          
                          {!av.ciente ? (
                            <button
                              onClick={() => handleCiente(av.id)}
                              disabled={isCienteLoading === av.id}
                              className="w-full sm:w-auto px-4 py-2 bg-[var(--color-csm-red)] hover:opacity-95 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/10 flex items-center justify-center gap-1.5 transition-all"
                            >
                              {isCienteLoading === av.id ? (
                                <RefreshCw size={14} className="animate-spin" />
                              ) : (
                                <>Confirmar Ciente</>
                              )}
                            </button>
                          ) : (
                            <div className="text-[10px] text-gray-400 font-semibold italic text-right">
                              Ciente dado em: {new Date(av.cienteEm).toLocaleString('pt-BR')}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {avisos.length === 0 && (
                      <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500">
                        <Megaphone className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                        Não há comunicados no momento.
                      </div>
                    )}
                  </div>
                )}

                {/* ABA 2: QUADRO DE HORÁRIOS */}
                {activeTab === 'horario' && (
                  <div className="space-y-4">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Cronograma de Aulas</h2>

                    {/* Filtro do Dia */}
                    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                      {diasSemana.slice(0, 5).map((dia) => (
                        <button
                          key={dia}
                          onClick={() => setSelectedDiaSemana(dia)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                            selectedDiaSemana === dia
                              ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {diasLabels[dia].split('-')[0]}
                        </button>
                      ))}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                          Aulas da {diasLabels[selectedDiaSemana]}
                        </span>
                        <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-semibold uppercase">
                          {horariosDoDia.length} Aulas
                        </span>
                      </div>

                      <div className="divide-y divide-gray-100">
                        {horariosDoDia.map((hor: any) => (
                          <div key={hor.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50">
                            <div>
                              <div className="font-bold text-sm text-gray-900">{hor.disciplinaNome}</div>
                              <div className="text-xs text-gray-400 font-semibold mt-0.5">Sigla: {hor.disciplinaSigla}</div>
                            </div>
                            <div className="text-right">
                              <span className="text-xs bg-red-50 text-[var(--color-csm-red)] px-2.5 py-1 rounded-md font-bold">
                                {hor.quantidadeAulas} {hor.quantidadeAulas === 1 ? 'aula' : 'aulas'}
                              </span>
                            </div>
                          </div>
                        ))}

                        {horariosDoDia.length === 0 && (
                          <div className="p-8 text-center text-gray-400 text-sm">
                            Nenhuma aula cadastrada para este dia da semana.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ABA 3: PEDAGÓGICO / BOLETIM / OCORRÊNCIAS */}
                {activeTab === 'boletim' && (
                  <div className="space-y-5">
                    {/* Ocorrências */}
                    <div className="space-y-3">
                      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ocorrências Disciplinares</h2>
                      
                      {pedagogicoData.ocorrencias.map((oc: any) => {
                        return (
                          <div key={oc.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm flex gap-3 items-start">
                            <div className="p-2 bg-red-50 text-red-600 rounded-xl mt-0.5">
                              <AlertTriangle size={18} />
                            </div>
                            <div className="space-y-1 flex-1">
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold text-sm text-gray-900">{oc.titulo}</h4>
                                <span className="text-[10px] text-gray-400 font-medium">
                                  {new Date(oc.data).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">{oc.descricao}</p>
                              {oc.providencia && (
                                <div className="mt-2 p-2 bg-gray-50 rounded-lg text-[10px] text-gray-500">
                                  <span className="font-bold text-gray-700">Providência: </span>
                                  {oc.providencia}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}

                      {pedagogicoData.ocorrencias.length === 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center text-gray-400 text-xs">
                          Nenhuma ocorrência registrada. Excelente conduta!
                        </div>
                      )}
                    </div>

                    {/* Boletim Escolar */}
                    <div className="space-y-3">
                      <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Boletim Escolar</h2>
                      
                      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-150">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">Matéria</th>
                                <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Notas</th>
                                <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Faltas</th>
                                <th className="px-3 py-3 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider">Média Anual</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {pedagogicoData.boletim.map((item: any) => (
                                <tr key={item.disciplinaId} className="hover:bg-gray-50/50">
                                  <td className="px-4 py-3 whitespace-nowrap text-xs font-bold text-gray-900">
                                    {item.disciplinaNome}
                                  </td>
                                  <td className="px-3 py-3 text-center whitespace-nowrap">
                                    <div className="flex justify-center gap-1.5">
                                      {item.mediasPeriodo.length > 0 ? item.mediasPeriodo.map((mp: any, idx: number) => (
                                        <div key={idx} className="flex flex-col items-center">
                                          <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">{mp.periodo.split('º')[0] || idx+1}B</span>
                                          <span className="text-xs font-semibold text-gray-700">{mp.media}</span>
                                        </div>
                                      )) : (
                                        <span className="text-[10px] text-gray-400">-</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-3 py-3 text-center whitespace-nowrap text-xs font-semibold text-gray-600">
                                    {item.totalFaltas}
                                    <span className="text-[9px] text-gray-400 block font-normal">Freq: {item.presencaPerc}%</span>
                                  </td>
                                  <td className="px-3 py-3 text-center whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${
                                      item.mediaFinal === null 
                                        ? 'bg-gray-50 text-gray-400' 
                                        : item.mediaFinal >= 7.0 
                                          ? 'bg-green-50 text-green-700' 
                                          : 'bg-red-50 text-red-700'
                                    }`}>
                                      {item.mediaFinal !== null ? item.mediaFinal : 'N/A'}
                                    </span>
                                  </td>
                                </tr>
                              ))}

                              {pedagogicoData.boletim.length === 0 && (
                                <tr>
                                  <td colSpan={4} className="px-4 py-8 text-center text-xs text-gray-400">
                                    Nenhuma nota lançada para este aluno.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

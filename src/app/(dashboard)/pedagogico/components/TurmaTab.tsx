'use client'

import { useState, useEffect } from 'react'
import { getTurmas, createTurma, updateTurma, getSeries, getSalas } from '@/actions/pedagogico'
import { getAnosLetivos } from '@/actions/secretaria'
import { LucidePlus, LucideEdit, LucideSave, LucideX, LucideLoader2, LucideUsers, LucideCalendar } from 'lucide-react'
import { TurmaProfessoresModal } from './TurmaProfessoresModal'
import { QuadroHorarioModal } from './QuadroHorarioModal'

type Turma = {
  id: string;
  nome: string;
  anoLetivoId: string;
  serieId: string | null;
  turno: 'manha' | 'tarde' | 'noite' | 'integral';
  capacidadeMaxima: number | null;
  situacao: 'aberta' | 'em_andamento' | 'encerrada' | 'cancelada';
  salaId: string | null;
}

type Serie = {
  id: string;
  nome: string;
}

type AnoLetivo = {
  id: string;
  ano: number;
  ativo: boolean;
}

type Sala = {
  id: string;
  nome: string;
  capacidade: number;
}

export function TurmaTab() {
  const [items, setItems] = useState<Turma[]>([])
  const [series, setSeries] = useState<Serie[]>([])
  const [anosLetivos, setAnosLetivos] = useState<AnoLetivo[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<{
    id: string;
    nome: string;
    anoLetivoId: string;
    serieId: string;
    turno: 'manha' | 'tarde' | 'noite' | 'integral';
    capacidadeMaxima: number;
    situacao: 'aberta' | 'em_andamento' | 'encerrada' | 'cancelada';
    salaId: string;
  }>({
    id: '',
    nome: '',
    anoLetivoId: '',
    serieId: '',
    turno: 'manha',
    capacidadeMaxima: 30,
    situacao: 'aberta',
    salaId: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [selectedTurmaForModal, setSelectedTurmaForModal] = useState<Turma | null>(null)
  const [selectedTurmaForHorario, setSelectedTurmaForHorario] = useState<Turma | null>(null)

  const loadData = async () => {
    setLoading(true)
    const [resTurmas, resSeries, resAnos, resSalas] = await Promise.all([
      getTurmas(), 
      getSeries(), 
      getAnosLetivos(),
      getSalas()
    ])
    if (resTurmas.success && resTurmas.data) setItems(resTurmas.data as any[])
    if (resSeries.success && resSeries.data) setSeries(resSeries.data)
    if (resAnos) setAnosLetivos(resAnos as any[])
    if (resSalas.success && resSalas.data) setSalas(resSalas.data as any[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const payload = {
      nome: formData.nome,
      anoLetivoId: formData.anoLetivoId,
      serieId: formData.serieId || null,
      turno: formData.turno,
      capacidadeMaxima: Number(formData.capacidadeMaxima),
      situacao: formData.situacao,
      salaId: formData.salaId || null
    }

    let result;
    if (isEditing && formData.id) {
      result = await updateTurma(formData.id, payload)
    } else {
      result = await createTurma(payload)
    }

    setIsSubmitting(false)

    if (result.success) {
      setShowForm(false)
      loadData()
    } else {
      setError(result.error || 'Erro ao salvar.')
    }
  }

  const handleEdit = (item: Turma) => {
    setFormData({
      id: item.id,
      nome: item.nome,
      anoLetivoId: item.anoLetivoId,
      serieId: item.serieId || '',
      turno: item.turno,
      capacidadeMaxima: item.capacidadeMaxima || 30,
      situacao: item.situacao,
      salaId: item.salaId || ''
    })
    setIsEditing(true)
    setShowForm(true)
  }

  const handleNew = () => {
    const defaultAno = anosLetivos.find(a => a.ativo)?.id || (anosLetivos.length > 0 ? anosLetivos[0].id : '')
    setFormData({
      id: '',
      nome: '',
      anoLetivoId: defaultAno,
      serieId: series.length > 0 ? series[0].id : '',
      turno: 'manha',
      capacidadeMaxima: 30,
      situacao: 'aberta',
      salaId: ''
    })
    setIsEditing(false)
    setShowForm(true)
  }

  const getSerieNome = (id: string | null) => {
    if (!id) return '-'
    return series.find(s => s.id === id)?.nome || 'Desconhecida'
  }

  const getSalaNome = (id: string | null) => {
    if (!id) return '-'
    return salas.find(s => s.id === id)?.nome || 'Desconhecida'
  }

  const getTurnoLabel = (turno: string) => {
    const map: Record<string, string> = {
      'manha': 'Manhã',
      'tarde': 'Tarde',
      'noite': 'Noite',
      'integral': 'Integral'
    }
    return map[turno] || turno
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Turmas</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie as turmas e suas capacidades.</p>
        </div>
        {!showForm && (
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
          >
            <LucidePlus size={16} /> Nova Turma
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-slate-900 dark:text-slate-100">{isEditing ? 'Editar Turma' : 'Nova Turma'}</h4>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
              <LucideX size={20} />
            </button>
          </div>
          
          {error && <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/35 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/50">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ano Letivo *</label>
              <select
                required
                value={formData.anoLetivoId}
                onChange={e => setFormData({...formData, anoLetivoId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none bg-white"
              >
                <option value="" disabled>Selecione um ano letivo</option>
                {anosLetivos.map(a => (
                  <option key={a.id} value={a.id}>{a.ano} {a.ativo ? '(Ativo)' : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Série *</label>
              <select
                required
                value={formData.serieId}
                onChange={e => setFormData({...formData, serieId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none bg-white"
              >
                <option value="" disabled>Selecione uma série</option>
                {series.map(s => (
                  <option key={s.id} value={s.id}>{s.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Turma *</label>
              <input
                required
                type="text"
                value={formData.nome}
                onChange={e => setFormData({...formData, nome: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none"
                placeholder="Ex: Turma A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Turno *</label>
              <select
                required
                value={formData.turno}
                onChange={e => setFormData({...formData, turno: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none bg-white"
              >
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
                <option value="integral">Integral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Capacidade Máxima</label>
              <input
                type="number"
                value={formData.capacidadeMaxima}
                onChange={e => setFormData({...formData, capacidadeMaxima: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sala Física</label>
              <select
                value={formData.salaId}
                onChange={e => setFormData({...formData, salaId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none bg-white text-sm"
              >
                <option value="">Sem Sala / Alocação Temporária</option>
                {salas.map(s => (
                  <option key={s.id} value={s.id}>{s.nome} (Capacidade: {s.capacidade})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Situação da Turma *</label>
              <select
                required
                value={formData.situacao}
                onChange={e => setFormData({...formData, situacao: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:text-slate-100 outline-none bg-white"
              >
                <option value="aberta">Aberta (Matrículas)</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="encerrada">Encerrada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? <LucideLoader2 size={16} className="animate-spin" /> : <LucideSave size={16} />}
              Salvar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 flex justify-center text-slate-400 dark:text-slate-500">
          <LucideLoader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-lg">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="px-6 py-3 font-semibold">Nome</th>
                <th className="px-6 py-3 font-semibold">Série</th>
                <th className="px-6 py-3 font-semibold">Ano Letivo</th>
                <th className="px-6 py-3 font-semibold">Sala</th>
                <th className="px-6 py-3 font-semibold">Turno</th>
                <th className="px-6 py-3 font-semibold">Capacidade</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhuma turma cadastrada.
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">{item.nome}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{getSerieNome(item.serieId)}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {anosLetivos.find(a => a.id === item.anoLetivoId)?.ano || '-'}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{getSalaNome(item.salaId)}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{getTurnoLabel(item.turno)}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{item.capacidadeMaxima} vagas</td>
                    <td className="px-6 py-4">
                      {item.situacao === 'aberta' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Aberta</span>
                      )}
                      {item.situacao === 'em_andamento' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Em Andamento</span>
                      )}
                      {item.situacao === 'encerrada' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300">Encerrada</span>
                      )}
                      {item.situacao === 'cancelada' && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Cancelada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button
                        onClick={() => setSelectedTurmaForHorario(item)}
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
                        title="Quadro de Horário"
                      >
                        <LucideCalendar size={18} />
                      </button>
                      <button
                        onClick={() => setSelectedTurmaForModal(item)}
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors"
                        title="Professores"
                      >
                        <LucideUsers size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        title="Editar"
                      >
                        <LucideEdit size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedTurmaForModal && (
        <TurmaProfessoresModal 
          turma={{ id: selectedTurmaForModal.id, nome: selectedTurmaForModal.nome }} 
          onClose={() => setSelectedTurmaForModal(null)} 
        />
      )}

      {selectedTurmaForHorario && (
        <QuadroHorarioModal
          turma={{ id: selectedTurmaForHorario.id, nome: selectedTurmaForHorario.nome }}
          onClose={() => setSelectedTurmaForHorario(null)}
        />
      )}
    </div>
  )
}

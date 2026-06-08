'use client'

import { useState, useEffect } from 'react'
import { getAnosLetivos } from '@/actions/secretaria'
import { getEventosCalendario, upsertEventoCalendario, deleteEventoCalendario } from '@/actions/coordenacao'
import { LucideLoader2, LucideCalendarDays, LucidePlus, LucideTrash2, LucideEdit } from 'lucide-react'

export function CalendarioPedagogicoTab() {
  const [anosLetivos, setAnosLetivos] = useState<any[]>([])
  const [selectedAnoId, setSelectedAnoId] = useState<string>('')
  
  const [eventos, setEventos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    id: '',
    titulo: '',
    descricao: '',
    dataInicio: '',
    dataFim: '',
    tipoEvento: 'feriado',
    corHex: '#4A90E2'
  })

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (selectedAnoId) {
      loadEventos()
    } else {
      setEventos([])
    }
  }, [selectedAnoId])

  const loadInitialData = async () => {
    const resAnos = await getAnosLetivos()
    if (resAnos && Array.isArray(resAnos)) {
      setAnosLetivos(resAnos)
      if (resAnos.length > 0) {
        setSelectedAnoId(resAnos[0].id)
      }
    }
  }

  const loadEventos = async () => {
    setLoading(true)
    const res = await getEventosCalendario(selectedAnoId)
    if (res.success && res.data) {
      setEventos(res.data)
    }
    setLoading(false)
  }

  const handleOpenModal = (evento: any = null) => {
    if (evento) {
      setFormData({
        id: evento.id,
        titulo: evento.titulo,
        descricao: evento.descricao || '',
        dataInicio: new Date(evento.dataInicio).toISOString().slice(0, 16),
        dataFim: new Date(evento.dataFim).toISOString().slice(0, 16),
        tipoEvento: evento.tipoEvento,
        corHex: evento.corHex || '#4A90E2'
      })
    } else {
      setFormData({
        id: '',
        titulo: '',
        descricao: '',
        dataInicio: new Date().toISOString().slice(0, 16),
        dataFim: new Date().toISOString().slice(0, 16),
        tipoEvento: 'feriado',
        corHex: '#4A90E2'
      })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    const payload = {
      ...formData,
      anoLetivoId: selectedAnoId,
    }

    const res = await upsertEventoCalendario(payload)
    if (res.success) {
      setIsModalOpen(false)
      loadEventos()
    } else {
      alert(res.error || 'Erro ao salvar evento')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      const res = await deleteEventoCalendario(id)
      if (res.success) {
        loadEventos()
      } else {
        alert(res.error || 'Erro ao excluir')
      }
    }
  }

  // Agrupando eventos por mês
  const groupedEventos = eventos.reduce((acc: any, ev: any) => {
    const d = new Date(ev.dataInicio)
    const mesAno = `${d.toLocaleString('pt-BR', { month: 'long' }).toUpperCase()} ${d.getFullYear()}`
    if (!acc[mesAno]) acc[mesAno] = []
    acc[mesAno].push(ev)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
            <LucideCalendarDays className="text-blue-600 dark:text-blue-400" />
            Calendário Pedagógico
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gerencie datas importantes, reuniões, conselhos de classe e feriados acadêmicos.
          </p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          disabled={!selectedAnoId}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
        >
          <LucidePlus size={16} /> Novo Evento
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 w-full md:w-1/3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ano Letivo</label>
        <select
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
          value={selectedAnoId}
          onChange={e => setSelectedAnoId(e.target.value)}
        >
          <option value="">Selecione...</option>
          {anosLetivos.map(a => (
            <option key={a.id} value={a.id}>{a.ano}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <LucideLoader2 className="animate-spin text-blue-600 h-8 w-8" />
        </div>
      ) : eventos.length === 0 ? (
        <div className="text-center p-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          Nenhum evento acadêmico agendado para este ano.
        </div>
      ) : (
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {Object.entries(groupedEventos).map(([mesAno, evs]: any) => (
            <div key={mesAno} className="relative z-10 space-y-4">
              <div className="flex items-center justify-center -mb-2">
                <span className="bg-white dark:bg-slate-900 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm">
                  {mesAno}
                </span>
              </div>
              
              <div className="space-y-4 pt-4">
                {evs.map((ev: any) => (
                  <div key={ev.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2" style={{ backgroundColor: ev.corHex }}></div>
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group/card">
                      <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: ev.corHex }}></div>
                      
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{ev.titulo}</div>
                          <div className="text-xs font-semibold uppercase tracking-wider mt-1 opacity-70" style={{ color: ev.corHex }}>
                            {ev.tipoEvento.replace('_', ' ')}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(ev)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <LucideEdit size={14} />
                          </button>
                          <button onClick={() => handleDelete(ev.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                            <LucideTrash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        {new Date(ev.dataInicio).toLocaleDateString('pt-BR')} às {new Date(ev.dataInicio).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                        {' - '}
                        {new Date(ev.dataFim).toLocaleDateString('pt-BR')} às {new Date(ev.dataFim).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      
                      {ev.descricao && (
                        <div className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-2 rounded border border-slate-100 dark:border-slate-800">
                          {ev.descricao}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {formData.id ? 'Editar Evento' : 'Novo Evento Pedagógico'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg">
                <LucideTrash2 className="hidden" /> {/* just for padding balance */}
                X
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Título</label>
                <input
                  required
                  type="text"
                  value={formData.titulo}
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Início</label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.dataInicio}
                    onChange={e => setFormData({...formData, dataInicio: e.target.value})}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Fim</label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.dataFim}
                    onChange={e => setFormData({...formData, dataFim: e.target.value})}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Tipo de Evento</label>
                  <select
                    value={formData.tipoEvento}
                    onChange={e => setFormData({...formData, tipoEvento: e.target.value})}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
                  >
                    <option value="feriado">Feriado/Recesso</option>
                    <option value="reuniao_pais">Reunião de Pais</option>
                    <option value="conselho_classe">Conselho de Classe</option>
                    <option value="prova">Avaliação/Prova</option>
                    <option value="evento_escolar">Evento Escolar</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Cor</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.corHex}
                      onChange={e => setFormData({...formData, corHex: e.target.value})}
                      className="h-9 w-9 rounded cursor-pointer border border-slate-300 dark:border-slate-700"
                    />
                    <input 
                      type="text" 
                      value={formData.corHex} 
                      onChange={e => setFormData({...formData, corHex: e.target.value})}
                      className="flex-1 p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Descrição (Opcional)</label>
                <textarea
                  rows={3}
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                  {saving && <LucideLoader2 className="animate-spin" size={14} />}
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

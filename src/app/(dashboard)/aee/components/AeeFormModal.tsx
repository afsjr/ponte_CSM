'use client';

import { useState, useEffect } from 'react';
import { 
  LucideX, 
  LucideSave, 
  LucideLoader2, 
  LucidePlus, 
  LucideTrash2, 
  LucideCheck, 
  LucideClock, 
  LucideFileText, 
  LucideCalendar,
  LucideFile,
  LucidePlusCircle,
  LucideAlertCircle,
  LucideActivity
} from 'lucide-react';
import { 
  getProntuarioAee, 
  upsertProntuarioAee, 
  toggleNecessidadeEspecial,
  getAnosLetivos,
  getPeiAluno,
  upsertPei,
  addMetaPei,
  updateMetaPeiStatus,
  deleteMetaPei,
  getAtendimentosAluno,
  saveAtendimento,
  getDocumentosAluno,
  saveDocumento,
  getAeeEvolucoes,
  addAeeEvolucao
} from '@/actions/aee';

interface AeeFormModalProps {
  alunoId: string;
  onClose: () => void;
}

type TabType = 'ficha' | 'pei' | 'atendimentos' | 'documentos' | 'evolucao';

export default function AeeFormModal({ alunoId, onClose }: AeeFormModalProps) {
  // Configurações e estados gerais
  const [activeTab, setActiveTab] = useState<TabType>('ficha');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // 1. Dados do Prontuário (Aba Ficha Geral)
  const [formData, setFormData] = useState({
    diagnostico: '',
    medicacoesEmUso: '',
    aspectosPositivos: '',
    dificuldades: '',
    adaptacoesAtividades: '',
    relatoriosTexto: '',
    horarioAtendimento: 'Segunda a Sexta, das 7:30h às 12:00h',
    feedbackReunioes: ''
  });

  // 2. Dados de Anos Letivos e PEI (Aba PEI)
  const [anosLetivos, setAnosLetivos] = useState<any[]>([]);
  const [selectedAnoLetivoId, setSelectedAnoLetivoId] = useState<string>('');
  const [pei, setPei] = useState<any>(null);
  const [loadingPei, setLoadingPei] = useState(false);
  const [peiFormData, setPeiFormData] = useState({
    objetivosGerais: '',
    recursosNecessarios: '',
    adaptacoesLaboratorio: '', // Campo específico de laboratório para Ensino Técnico
    dataInicio: '',
    dataFim: ''
  });
  const [metas, setMetas] = useState<any[]>([]);
  const [newMeta, setNewMeta] = useState({
    area: 'pedagogica' as 'pedagogica' | 'social' | 'motora' | 'tecnica' | 'autonomia',
    descricaoMeta: '',
    estrategiasPedagogicas: ''
  });
  const [isAddingMeta, setIsAddingMeta] = useState(false);

  // 3. Dados dos Atendimentos (Aba Atendimentos)
  const [atendimentos, setAtendimentos] = useState<any[]>([]);
  const [loadingAtendimentos, setLoadingAtendimentos] = useState(false);
  const [atendimentoFormData, setAtendimentoFormData] = useState({
    dataAtendimento: new Date().toISOString().slice(0, 16), // datetime-local format
    duracaoMinutos: 50,
    registroSessao: '',
    recursosUtilizados: ''
  });
  const [savingAtendimento, setSavingAtendimento] = useState(false);

  // 4. Dados de Documentos/Laudos (Aba Documentos)
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loadingDocumentos, setLoadingDocumentos] = useState(false);
  const [documentoFormData, setDocumentoFormData] = useState({
    tipoDocumento: 'laudo_medico',
    profissionalEmissor: '',
    registroProfissional: '',
    urlArquivo: '',
    dataEmissao: ''
  });
  const [savingDocumento, setSavingDocumento] = useState(false);

  // 5. Histórico Evolutivo
  const [prontuarioId, setProntuarioId] = useState<string | null>(null);
  const [evolucoes, setEvolucoes] = useState<any[]>([]);
  const [loadingEvolucoes, setLoadingEvolucoes] = useState(false);
  const [evolucaoFormData, setEvolucaoFormData] = useState({
    papel: 'Professor' as 'Professor' | 'Equipe AEE' | 'Família' | 'Profissional de Saúde' | 'Coordenação' | 'Outros',
    descricao: ''
  });
  const [savingEvolucao, setSavingEvolucao] = useState(false);

  // Carregamento Inicial
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Carrega prontuário geral
      const prontRes = await getProntuarioAee(alunoId);
      if (prontRes) {
        setProntuarioId(prontRes.id);
        setFormData({
          diagnostico: prontRes.diagnostico || '',
          medicacoesEmUso: prontRes.medicacoesEmUso || '',
          aspectosPositivos: prontRes.aspectosPositivos || '',
          dificuldades: prontRes.dificuldades || '',
          adaptacoesAtividades: prontRes.adaptacoesAtividades || '',
          relatoriosTexto: prontRes.relatoriosTexto || '',
          horarioAtendimento: prontRes.horarioAtendimento || 'Segunda a Sexta, das 7:30h às 12:00h',
          feedbackReunioes: prontRes.feedbackReunioes || ''
        });
      }

      // Carrega anos letivos
      const anosRes = await getAnosLetivos();
      if (anosRes.success && anosRes.data && anosRes.data.length > 0) {
        setAnosLetivos(anosRes.data);
        // Seleciona o primeiro (geralmente mais recente ordenado por desc)
        setSelectedAnoLetivoId(anosRes.data[0].id);
      }
      setLoading(false);
    }
    loadData();
  }, [alunoId]);

  // Carrega o PEI do aluno toda vez que altera o Ano Letivo
  useEffect(() => {
    if (selectedAnoLetivoId) {
      loadPei();
    }
  }, [selectedAnoLetivoId, alunoId]);

  async function loadPei() {
    if (!selectedAnoLetivoId) return;
    setLoadingPei(true);
    try {
      const res = await getPeiAluno(alunoId, selectedAnoLetivoId);
      if (res.success && res.data) {
        setPei(res.data);
        setPeiFormData({
          objetivosGerais: res.data.objetivosGerais || '',
          recursosNecessarios: res.data.recursosNecessarios || '',
          adaptacoesLaboratorio: res.data.adaptacoesLaboratorio || '',
          dataInicio: res.data.dataInicio ? new Date(res.data.dataInicio).toISOString().split('T')[0] : '',
          dataFim: res.data.dataFim ? new Date(res.data.dataFim).toISOString().split('T')[0] : ''
        });
        setMetas(res.data.metas || []);
      } else {
        setPei(null);
        setPeiFormData({
          objetivosGerais: '',
          recursosNecessarios: '',
          adaptacoesLaboratorio: '',
          dataInicio: '',
          dataFim: ''
        });
        setMetas([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPei(false);
    }
  }

  async function loadAtendimentos() {
    setLoadingAtendimentos(true);
    try {
      const res = await getAtendimentosAluno(alunoId);
      if (res.success && res.data) {
        setAtendimentos(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAtendimentos(false);
    }
  }

  async function loadDocumentos() {
    setLoadingDocumentos(true);
    try {
      const res = await getDocumentosAluno(alunoId);
      if (res.success && res.data) {
        setDocumentos(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDocumentos(false);
    }
  }

  async function loadEvolucoes() {
    if (!prontuarioId) return;
    setLoadingEvolucoes(true);
    try {
      const res = await getAeeEvolucoes(prontuarioId);
      if (res.success && res.data) {
        setEvolucoes(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvolucoes(false);
    }
  }

  // Monitora a troca de abas para carregar dados sob demanda
  useEffect(() => {
    if (activeTab === 'atendimentos') {
      loadAtendimentos();
    } else if (activeTab === 'documentos') {
      loadDocumentos();
    } else if (activeTab === 'pei') {
      loadPei();
    } else if (activeTab === 'evolucao') {
      loadEvolucoes();
    }
  }, [activeTab, prontuarioId]);

  // Manipuladores de Input
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Salvar Prontuário Geral (Aba 1)
  const handleSaveProntuario = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await upsertProntuarioAee(alunoId, formData);
      if (res.success) {
        setMessageType('success');
        setMessage('Prontuário salvo com sucesso!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessageType('error');
        setMessage('Erro ao salvar prontuário.');
      }
    } catch (error: any) {
      setMessageType('error');
      setMessage('Erro: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Salvar/Criar PEI (Aba 2)
  const handleSavePei = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnoLetivoId) {
      alert('Selecione um ano letivo!');
      return;
    }
    if (!peiFormData.dataInicio || !peiFormData.dataFim) {
      alert('Selecione as datas de início e fim da vigência!');
      return;
    }
    setSaving(true);
    try {
      const res = await upsertPei(alunoId, selectedAnoLetivoId, peiFormData);
      if (res.success) {
        setMessageType('success');
        setMessage('Plano PEI salvo com sucesso!');
        loadPei();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessageType('error');
        setMessage('Erro ao salvar plano PEI.');
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar PEI');
    } finally {
      setSaving(false);
    }
  };

  // Metas do PEI
  const handleAddMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pei) {
      alert('Salve o cabeçalho do plano PEI antes de adicionar metas!');
      return;
    }
    if (!newMeta.descricaoMeta.trim()) {
      alert('Descreva a meta a ser atingida!');
      return;
    }

    try {
      const res = await addMetaPei({
        peiId: pei.id,
        area: newMeta.area,
        descricaoMeta: newMeta.descricaoMeta,
        estrategiasPedagogicas: newMeta.estrategiasPedagogicas
      });

      if (res.success && res.data) {
        setMetas(prev => [...prev, res.data]);
        setNewMeta({
          area: 'pedagogica',
          descricaoMeta: '',
          estrategiasPedagogicas: ''
        });
        setIsAddingMeta(false);
      } else {
        alert(res.error || 'Erro ao adicionar meta');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateMetaStatus = async (metaId: string, status: any) => {
    try {
      const res = await updateMetaPeiStatus(metaId, status);
      if (res.success && res.data) {
        setMetas(prev => prev.map(m => m.id === metaId ? { ...m, status: res.data.status } : m));
      } else {
        alert(res.error || 'Erro ao atualizar status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMeta = async (metaId: string) => {
    if (!confirm('Deseja realmente remover esta meta pedagógica?')) return;
    try {
      const res = await deleteMetaPei(metaId);
      if (res.success) {
        setMetas(prev => prev.filter(m => m.id !== metaId));
      } else {
        alert(res.error || 'Erro ao remover meta');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Salvar Atendimento (Aba 3)
  const handleSaveAtendimento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!atendimentoFormData.registroSessao.trim()) {
      alert('Descreva o registro do atendimento!');
      return;
    }
    setSavingAtendimento(true);
    try {
      const res = await saveAtendimento({
        alunoId,
        dataAtendimento: atendimentoFormData.dataAtendimento,
        duracaoMinutos: Number(atendimentoFormData.duracaoMinutos),
        registroSessao: atendimentoFormData.registroSessao,
        recursosUtilizados: atendimentoFormData.recursosUtilizados
      });

      if (res.success && res.data) {
        setAtendimentoFormData({
          dataAtendimento: new Date().toISOString().slice(0, 16),
          duracaoMinutos: 50,
          registroSessao: '',
          recursosUtilizados: ''
        });
        loadAtendimentos();
      } else {
        alert(res.error || 'Erro ao salvar atendimento');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAtendimento(false);
    }
  };

  // Salvar Documento / Laudo (Aba 4)
  const handleSaveDocumento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentoFormData.profissionalEmissor.trim() || !documentoFormData.urlArquivo.trim()) {
      alert('Preencha o emissor e o link/URL do arquivo!');
      return;
    }
    setSavingDocumento(true);
    try {
      const res = await saveDocumento({
        alunoId,
        tipoDocumento: documentoFormData.tipoDocumento,
        profissionalEmissor: documentoFormData.profissionalEmissor,
        registroProfissional: documentoFormData.registroProfissional,
        urlArquivo: documentoFormData.urlArquivo,
        dataEmissao: documentoFormData.dataEmissao || undefined
      });

      if (res.success && res.data) {
        setDocumentoFormData({
          tipoDocumento: 'laudo_medico',
          profissionalEmissor: '',
          registroProfissional: '',
          urlArquivo: '',
          dataEmissao: ''
        });
        loadDocumentos();
      } else {
        alert(res.error || 'Erro ao salvar documento');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingDocumento(false);
    }
  };

  // Salvar Evolução (Aba 5)
  const handleSaveEvolucao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prontuarioId) {
      alert('Salve o prontuário geral primeiro!');
      return;
    }
    if (!evolucaoFormData.descricao.trim()) {
      alert('Preencha a descrição da evolução!');
      return;
    }
    setSavingEvolucao(true);
    try {
      const res = await addAeeEvolucao({
        prontuarioId,
        papel: evolucaoFormData.papel,
        descricao: evolucaoFormData.descricao
      });

      if (res.success && res.data) {
        setEvolucaoFormData(prev => ({ ...prev, descricao: '' }));
        loadEvolucoes();
      } else {
        alert(res.error || 'Erro ao salvar evolução');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEvolucao(false);
    }
  };

  const handleRemoverDoAee = async () => {
    if (confirm("Tem certeza que deseja desvincular este aluno do AEE? O histórico não será apagado, mas ele deixará de aparecer na lista principal.")) {
      setSaving(true);
      await toggleNecessidadeEspecial(alunoId, false);
      onClose();
    }
  };

  // Mapeamentos Estilizados de Metas
  const areaLabels: Record<string, string> = {
    pedagogica: 'Pedagógica',
    social: 'Socialização',
    motora: 'Psicomotora',
    tecnica: 'Ensino Técnico',
    autonomia: 'Autonomia'
  };

  const areaColors: Record<string, string> = {
    pedagogica: 'bg-blue-50 text-blue-700 border-blue-200',
    social: 'bg-purple-50 text-purple-700 border-purple-200',
    motora: 'bg-amber-50 text-amber-700 border-amber-200',
    tecnica: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    autonomia: 'bg-teal-50 text-teal-700 border-teal-200'
  };

  const statusLabels: Record<string, string> = {
    nao_iniciado: 'Não Iniciado',
    em_progresso: 'Em Progresso',
    alcancada: 'Alcançada',
    nao_alcancada: 'Não Alcançada'
  };

  const statusColors: Record<string, string> = {
    nao_iniciado: 'bg-gray-100 text-gray-700',
    em_progresso: 'bg-blue-100 text-blue-700',
    alcancada: 'bg-green-100 text-green-700',
    nao_alcancada: 'bg-red-100 text-red-700'
  };

  const tabClass = (tabId: TabType) => `flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
    activeTab === tabId 
      ? 'border-[var(--color-csm-green)] text-[var(--color-csm-green)]' 
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-950">Ficha de Inclusão AEE</h3>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Acompanhamento e Prontuários Multidisciplinares</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <LucideX size={20} />
          </button>
        </div>

        {/* Abas */}
        <div className="flex border-b border-gray-150 overflow-x-auto bg-gray-50/20 scrollbar-none">
          <button type="button" onClick={() => setActiveTab('ficha')} className={tabClass('ficha')}>
            <LucideFileText size={16} /> Ficha Geral
          </button>
          <button type="button" onClick={() => setActiveTab('pei')} className={tabClass('pei')}>
            <LucideActivity size={16} /> Plano Pedagógico (PEI)
          </button>
          <button type="button" onClick={() => setActiveTab('atendimentos')} className={tabClass('atendimentos')}>
            <LucideClock size={16} /> Registro de Atendimentos
          </button>
          <button type="button" onClick={() => setActiveTab('documentos')} className={tabClass('documentos')}>
            <LucideFile size={16} /> Laudos & Anexos
          </button>
          <button type="button" onClick={() => setActiveTab('evolucao')} className={tabClass('evolucao')}>
            <LucideFileText size={16} /> Evolução
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <LucideLoader2 className="animate-spin mb-4" size={32} />
              <p className="text-sm font-medium">Carregando dados do AEE...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* TAB 1: FICHA GERAL */}
              {activeTab === 'ficha' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in-50 duration-150">
                  
                  {/* Diagnóstico e Medicação */}
                  <div className="space-y-4 md:col-span-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Diagnóstico Geral</label>
                      <input 
                        name="diagnostico"
                        value={formData.diagnostico}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-250 rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-csm-green)] focus:border-[var(--color-csm-green)] outline-none"
                        placeholder="Ex: Transtorno do Espectro Autista (TEA), TDAH, Deficiência Auditiva..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Medicações em Uso</label>
                      <input 
                        name="medicacoesEmUso"
                        value={formData.medicacoesEmUso}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-250 rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-csm-green)] focus:border-[var(--color-csm-green)] outline-none"
                        placeholder="Ex: Ritalina 10mg, Risperidona (ou 'Nenhuma')"
                      />
                    </div>
                  </div>

                  {/* Habilidades e Dificuldades */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Aspectos Positivos (Habilidades desenvolvidas)</label>
                    <textarea 
                      name="aspectosPositivos"
                      value={formData.aspectosPositivos}
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-2.5 border border-gray-250 rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-csm-green)] focus:border-[var(--color-csm-green)] outline-none resize-none"
                      placeholder="Descreva pontos fortes, habilidades cognitivas, artísticas, interesses..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Dificuldades (Necessidade de desenvolvimento)</label>
                    <textarea 
                      name="dificuldades"
                      value={formData.dificuldades}
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-2.5 border border-gray-250 rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-csm-green)] focus:border-[var(--color-csm-green)] outline-none resize-none"
                      placeholder="Descreva as principais dificuldades escolares, de convívio ou barreiras motoras..."
                    />
                  </div>

                  {/* Adaptações e Horários */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Adaptações Recomendadas (Sala de Aula Comum)</label>
                      <textarea 
                        name="adaptacoesAtividades"
                        value={formData.adaptacoesAtividades}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2.5 border border-gray-250 rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-csm-green)] focus:border-[var(--color-csm-green)] outline-none resize-none"
                        placeholder="Ex: Tempo adicional para provas, auxílio de ledor, provas com letras ampliadas..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Horário de Atendimentos no AEE</label>
                      <input 
                        name="horarioAtendimento"
                        value={formData.horarioAtendimento}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-250 rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-csm-green)] focus:border-[var(--color-csm-green)] outline-none"
                      />
                    </div>
                  </div>

                  {/* Relatórios e Reuniões */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Transcrições / Resumos Clínicos (Histórico)</label>
                      <textarea 
                        name="relatoriosTexto"
                        value={formData.relatoriosTexto}
                        onChange={handleChange}
                        rows={5}
                        className="w-full p-2.5 border border-gray-250 rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-csm-green)] focus:border-[var(--color-csm-green)] outline-none"
                        placeholder="Cole resumos de relatórios psicopedagógicos anteriores ou pareceres..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Feedbacks e Alinhamento Familiar</label>
                      <textarea 
                        name="feedbackReunioes"
                        value={formData.feedbackReunioes}
                        onChange={handleChange}
                        rows={3}
                        className="w-full p-2.5 border border-gray-250 rounded-lg text-sm focus:ring-1 focus:ring-[var(--color-csm-green)] focus:border-[var(--color-csm-green)] outline-none"
                        placeholder="Anotações de reuniões com pais ou parecer de terapeutas parceiros externos..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PEI (PLANO INDIVIDUALIZADO E METAS) */}
              {activeTab === 'pei' && (
                <div className="space-y-6 animate-in fade-in-50 duration-150">
                  {/* Seletor de Ano Letivo do PEI */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Ano Letivo do Planejamento</label>
                      <select
                        value={selectedAnoLetivoId}
                        onChange={(e) => setSelectedAnoLetivoId(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white"
                      >
                        {anosLetivos.map(a => (
                          <option key={a.id} value={a.id}>{a.ano} (Letivo)</option>
                        ))}
                      </select>
                    </div>
                    <div className="text-xs text-gray-400 font-medium max-w-sm">
                      Cada aluno especial possui um PEI (Plano de Desenvolvimento Individualizado) anual focado no seu nível escolar.
                    </div>
                  </div>

                  {loadingPei ? (
                    <div className="flex justify-center py-12">
                      <LucideLoader2 className="animate-spin text-[var(--color-csm-green)]" size={24} />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Coluna 1: Formulário PEI */}
                      <form onSubmit={handleSavePei} className="bg-white border border-gray-250 p-4 rounded-xl space-y-4 h-fit">
                        <h4 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3">Parâmetros do Plano</h4>
                        
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Objetivos Gerais</label>
                          <textarea
                            value={peiFormData.objetivosGerais}
                            onChange={(e) => setPeiFormData({ ...peiFormData, objetivosGerais: e.target.value })}
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[var(--color-csm-green)]"
                            placeholder="Metas gerais do ano..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Recursos Necessários</label>
                          <textarea
                            value={peiFormData.recursosNecessarios}
                            onChange={(e) => setPeiFormData({ ...peiFormData, recursosNecessarios: e.target.value })}
                            rows={2}
                            className="w-full p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[var(--color-csm-green)]"
                            placeholder="Recursos visuais, táteis, tempo adicional..."
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Adaptações de Laboratório (Ensino Técnico)</label>
                          <textarea
                            value={peiFormData.adaptacoesLaboratorio}
                            onChange={(e) => setPeiFormData({ ...peiFormData, adaptacoesLaboratorio: e.target.value })}
                            rows={2}
                            className="w-full p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[var(--color-csm-green)]"
                            placeholder="Ex: Acessibilidade em IDE, comandos por voz..."
                          />
                          <p className="text-[10px] text-gray-400 mt-1 font-semibold">Exclusivo para alunos dos níveis de Ensino Técnico.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Início Vigência</label>
                            <input
                              type="date"
                              required
                              value={peiFormData.dataInicio}
                              onChange={(e) => setPeiFormData({ ...peiFormData, dataInicio: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-lg text-xs outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Fim Vigência</label>
                            <input
                              type="date"
                              required
                              value={peiFormData.dataFim}
                              onChange={(e) => setPeiFormData({ ...peiFormData, dataFim: e.target.value })}
                              className="w-full p-2 border border-gray-300 rounded-lg text-xs outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full py-2 bg-[var(--color-csm-green)] hover:opacity-90 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-opacity"
                        >
                          {saving ? <LucideLoader2 className="animate-spin" size={14} /> : <LucideSave size={14} />}
                          Salvar Parâmetros do PEI
                        </button>
                      </form>

                      {/* Coluna 2 e 3: Metas do PEI */}
                      <div className="lg:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-bold text-gray-800">Objetivos e Metas Educacionais</h4>
                          {pei && (
                            <button
                              onClick={() => setIsAddingMeta(!isAddingMeta)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <LucidePlus size={14} /> Nova Meta
                            </button>
                          )}
                        </div>

                        {!pei ? (
                          <div className="bg-yellow-50 text-yellow-700 text-xs border border-yellow-200 p-4 rounded-xl flex items-center gap-2">
                            <LucideAlertCircle size={18} />
                            Salve os parâmetros gerais do PEI na coluna lateral para liberar o cadastro de metas personalizadas por disciplina.
                          </div>
                        ) : (
                          <>
                            {/* Formulário Nova Meta */}
                            {isAddingMeta && (
                              <form onSubmit={handleAddMeta} className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3 animate-in slide-in-from-top-4 duration-150">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div className="sm:col-span-1">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Área / Foco</label>
                                    <select
                                      value={newMeta.area}
                                      onChange={(e: any) => setNewMeta({ ...newMeta, area: e.target.value })}
                                      className="w-full border border-gray-300 rounded-md p-2 text-xs bg-white"
                                    >
                                      <option value="pedagogica">Pedagógica</option>
                                      <option value="social">Socialização</option>
                                      <option value="motora">Psicomotora</option>
                                      <option value="tecnica">Ensino Técnico</option>
                                      <option value="autonomia">Autonomia</option>
                                    </select>
                                  </div>
                                  <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Descrição do Objetivo/Meta</label>
                                    <input
                                      type="text"
                                      required
                                      value={newMeta.descricaoMeta}
                                      onChange={(e) => setNewMeta({ ...newMeta, descricaoMeta: e.target.value })}
                                      className="w-full border border-gray-300 rounded-md p-2 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                      placeholder="Ex: Alfabetizar foneticamente até o fim do semestre"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Estratégias de Apoio do AEE</label>
                                  <input
                                    type="text"
                                    value={newMeta.estrategiasPedagogicas}
                                    onChange={(e) => setNewMeta({ ...newMeta, estrategiasPedagogicas: e.target.value })}
                                    className="w-full border border-gray-300 rounded-md p-2 text-xs outline-none"
                                    placeholder="Ex: Uso de blocos lógicos táteis 3 vezes por semana..."
                                  />
                                </div>
                                <div className="flex justify-end gap-2 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => setIsAddingMeta(false)}
                                    className="px-3 py-1.5 text-gray-500 hover:bg-gray-200 rounded-lg font-medium"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    type="submit"
                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm"
                                  >
                                    Confirmar Meta
                                  </button>
                                </div>
                              </form>
                            )}

                            {/* Listagem de Metas */}
                            {metas.length > 0 ? (
                              <div className="space-y-3">
                                {metas.map((meta) => (
                                  <div key={meta.id} className="bg-white border border-gray-250 p-4 rounded-xl flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="space-y-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${areaColors[meta.area] || ''}`}>
                                          {areaLabels[meta.area] || meta.area}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[meta.status] || ''}`}>
                                          {statusLabels[meta.status] || meta.status}
                                        </span>
                                      </div>
                                      <div className="text-sm font-semibold text-gray-800">{meta.descricaoMeta}</div>
                                      {meta.estrategiasPedagogicas && (
                                        <div className="text-xs text-gray-500">
                                          <span className="font-bold text-gray-600">Estratégia: </span>
                                          {meta.estrategiasPedagogicas}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 justify-end self-end sm:self-start">
                                      {/* Controles de Status rápidos */}
                                      <select
                                        value={meta.status}
                                        onChange={(e) => handleUpdateMetaStatus(meta.id, e.target.value as any)}
                                        className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-gray-50 focus:outline-none"
                                      >
                                        <option value="nao_iniciado">Não Iniciado</option>
                                        <option value="em_progresso">Em Progresso</option>
                                        <option value="alcancada">Alcançada</option>
                                        <option value="nao_alcancada">Não Alcançada</option>
                                      </select>
                                      <button
                                        onClick={() => handleDeleteMeta(meta.id)}
                                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                      >
                                        <LucideTrash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-500 text-xs font-semibold">
                                Nenhuma meta de inclusão cadastrada para o PEI deste ano letivo.
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: REGISTRO DE ATENDIMENTOS */}
              {activeTab === 'atendimentos' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-150">
                  
                  {/* Formulário Novo Atendimento */}
                  <form onSubmit={handleSaveAtendimento} className="bg-white border border-gray-250 p-4 rounded-xl space-y-4 h-fit">
                    <h4 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3">Registrar Sessão de AEE</h4>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Data e Hora</label>
                      <input
                        type="datetime-local"
                        required
                        value={atendimentoFormData.dataAtendimento}
                        onChange={(e) => setAtendimentoFormData({ ...atendimentoFormData, dataAtendimento: e.target.value })}
                        className="w-full p-2 border border-gray-350 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[var(--color-csm-green)]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Duração (Minutos)</label>
                      <input
                        type="number"
                        required
                        value={atendimentoFormData.duracaoMinutos}
                        onChange={(e) => setAtendimentoFormData({ ...atendimentoFormData, duracaoMinutos: Number(e.target.value) })}
                        className="w-full p-2 border border-gray-350 rounded-lg text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Recursos Utilizados</label>
                      <input
                        type="text"
                        value={atendimentoFormData.recursosUtilizados}
                        onChange={(e) => setAtendimentoFormData({ ...atendimentoFormData, recursosUtilizados: e.target.value })}
                        className="w-full p-2 border border-gray-350 rounded-lg text-xs outline-none"
                        placeholder="Ex: Lego, cartões com figuras, blocos lógicos..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Registro / Parecer da Sessão</label>
                      <textarea
                        required
                        value={atendimentoFormData.registroSessao}
                        onChange={(e) => setAtendimentoFormData({ ...atendimentoFormData, registroSessao: e.target.value })}
                        rows={4}
                        className="w-full p-2 border border-gray-350 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[var(--color-csm-green)]"
                        placeholder="Descreva o andamento do atendimento e a evolução observada..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingAtendimento}
                      className="w-full py-2 bg-[var(--color-csm-green)] hover:opacity-90 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-opacity"
                    >
                      {savingAtendimento ? <LucideLoader2 className="animate-spin" size={14} /> : <LucidePlusCircle size={14} />}
                      Registrar Atendimento AEE
                    </button>
                  </form>

                  {/* Histórico / Timeline */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-sm font-bold text-gray-800">Linha do Tempo de Atendimentos</h4>

                    {loadingAtendimentos ? (
                      <div className="flex justify-center py-12">
                        <LucideLoader2 className="animate-spin text-[var(--color-csm-green)]" size={24} />
                      </div>
                    ) : atendimentos.length > 0 ? (
                      <div className="relative border-l border-gray-200 pl-4 ml-2 space-y-6">
                        {atendimentos.map((at) => (
                          <div key={at.id} className="relative bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow transition-shadow">
                            {/* Marcador na linha */}
                            <span className="absolute -left-[22px] top-4 bg-white border-2 border-[var(--color-csm-green)] rounded-full h-3.5 w-3.5 flex items-center justify-center">
                              <span className="h-1.5 w-1.5 bg-[var(--color-csm-green)] rounded-full"></span>
                            </span>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-500 font-semibold mb-2">
                              <span className="flex items-center gap-1">
                                <LucideCalendar size={14} />
                                {new Date(at.dataAtendimento).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <LucideClock size={14} />
                                {at.duracaoMinutos} min
                              </span>
                            </div>

                            <p className="text-sm text-gray-800 leading-relaxed font-medium mb-3">
                              {at.registroSessao}
                            </p>

                            <div className="border-t pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-gray-400">
                              {at.recursosUtilizados && (
                                <div>
                                  <span className="font-bold text-gray-500">Recursos: </span>
                                  {at.recursosUtilizados}
                                </div>
                              )}
                              <div className="text-right">
                                <span className="font-bold text-gray-500">Responsável: </span>
                                {at.profissionalNome}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-500 text-xs font-semibold">
                        Nenhum atendimento registrado para este aluno ainda.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: LAUDOS E DOCUMENTOS CLÍNICOS */}
              {activeTab === 'documentos' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-150">
                  
                  {/* Formulário Novo Documento */}
                  <form onSubmit={handleSaveDocumento} className="bg-white border border-gray-250 p-4 rounded-xl space-y-4 h-fit">
                    <h4 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3">Anexar Laudo / Parecer</h4>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Tipo de Documento</label>
                      <select
                        value={documentoFormData.tipoDocumento}
                        onChange={(e) => setDocumentoFormData({ ...documentoFormData, tipoDocumento: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 text-xs bg-white"
                      >
                        <option value="laudo_medico">Laudo Médico (Neurologista/Psiquiatra)</option>
                        <option value="parecer_psicologico">Parecer Psicológico / Psicopedagógico</option>
                        <option value="relatorio_fonoaudiologia">Parecer de Fonoaudiologia</option>
                        <option value="terapia_ocupacional">Parecer de Terapia Ocupacional</option>
                        <option value="relatorio_escola_anterior">Relatório da Escola Anterior</option>
                        <option value="outro">Outros Documentos de Inclusão</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Profissional Emissor</label>
                      <input
                        type="text"
                        required
                        value={documentoFormData.profissionalEmissor}
                        onChange={(e) => setDocumentoFormData({ ...documentoFormData, profissionalEmissor: e.target.value })}
                        className="w-full p-2 border border-gray-350 rounded-lg text-xs outline-none"
                        placeholder="Ex: Dra. Ana Paula Silva"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Registro de Conselho (CRM/CRP/CREFITO)</label>
                      <input
                        type="text"
                        value={documentoFormData.registroProfissional}
                        onChange={(e) => setDocumentoFormData({ ...documentoFormData, registroProfissional: e.target.value })}
                        className="w-full p-2 border border-gray-350 rounded-lg text-xs outline-none"
                        placeholder="Ex: CRM 45214"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Data de Emissão</label>
                      <input
                        type="date"
                        value={documentoFormData.dataEmissao}
                        onChange={(e) => setDocumentoFormData({ ...documentoFormData, dataEmissao: e.target.value })}
                        className="w-full p-2 border border-gray-350 rounded-lg text-xs outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Link do Arquivo (URL Supabase Storage)</label>
                      <input
                        type="url"
                        required
                        value={documentoFormData.urlArquivo}
                        onChange={(e) => setDocumentoFormData({ ...documentoFormData, urlArquivo: e.target.value })}
                        className="w-full p-2 border border-gray-350 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[var(--color-csm-green)]"
                        placeholder="Cole a URL do documento anexado..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingDocumento}
                      className="w-full py-2 bg-[var(--color-csm-green)] hover:opacity-90 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-opacity"
                    >
                      {savingDocumento ? <LucideLoader2 className="animate-spin" size={14} /> : <LucidePlusCircle size={14} />}
                      Salvar Documento Clínico
                    </button>
                  </form>

                  {/* Listagem de Laudos */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-sm font-bold text-gray-800">Repositório de Laudos Anexados</h4>

                    {loadingDocumentos ? (
                      <div className="flex justify-center py-12">
                        <LucideLoader2 className="animate-spin text-[var(--color-csm-green)]" size={24} />
                      </div>
                    ) : documentos.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {documentos.map((doc) => (
                          <div key={doc.id} className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between gap-4 shadow-sm hover:shadow transition-shadow">
                            <div className="flex items-start gap-3">
                              <div className="h-10 w-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                                <LucideFileText size={20} />
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm font-bold text-gray-800">
                                  {doc.tipoDocumento === 'laudo_medico' ? 'Laudo Médico' :
                                   doc.tipoDocumento === 'parecer_psicologico' ? 'Parecer Psicológico' :
                                   doc.tipoDocumento === 'relatorio_fonoaudiologia' ? 'Parecer de Fonoaudiologia' :
                                   doc.tipoDocumento === 'terapia_ocupacional' ? 'Parecer de Terapia Ocupacional' :
                                   doc.tipoDocumento === 'relatorio_escola_anterior' ? 'Relatório de Escola Anterior' :
                                   'Documento de Inclusão'}
                                </div>
                                <div className="text-xs text-gray-500 font-semibold">
                                  {doc.profissionalEmissor} {doc.registroProfissional ? `(${doc.registroProfissional})` : ''}
                                </div>
                                {doc.dataEmissao && (
                                  <div className="text-[10px] text-gray-400 font-medium">
                                    Emissão: {new Date(doc.dataEmissao).toLocaleDateString('pt-BR')}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <a
                                href={doc.urlArquivo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                Abrir Documento
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-500 text-xs font-semibold">
                        Nenhum laudo clínico ou documento anexado para este prontuário.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: HISTÓRICO EVOLUTIVO */}
              {activeTab === 'evolucao' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in-50 duration-150">
                  {/* Formulário Nova Evolução */}
                  <form onSubmit={handleSaveEvolucao} className="bg-white border border-gray-250 p-4 rounded-xl space-y-4 h-fit">
                    <h4 className="text-sm font-bold text-gray-800 border-b pb-2 mb-3">Registrar Evolução</h4>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Qual é o seu papel?</label>
                      <select
                        value={evolucaoFormData.papel}
                        onChange={(e: any) => setEvolucaoFormData({ ...evolucaoFormData, papel: e.target.value })}
                        className="w-full border border-gray-300 rounded-md p-2 text-xs bg-white"
                      >
                        <option value="Professor">Professor(a) Comum</option>
                        <option value="Equipe AEE">Equipe AEE</option>
                        <option value="Coordenação">Coordenação Pedagógica</option>
                        <option value="Família">Responsável / Família</option>
                        <option value="Profissional de Saúde">Profissional de Saúde Externo</option>
                        <option value="Outros">Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Nota Evolutiva / Observação</label>
                      <textarea
                        required
                        value={evolucaoFormData.descricao}
                        onChange={(e) => setEvolucaoFormData({ ...evolucaoFormData, descricao: e.target.value })}
                        rows={4}
                        className="w-full p-2 border border-gray-350 rounded-lg text-xs outline-none focus:ring-1 focus:ring-[var(--color-csm-green)]"
                        placeholder="Descreva o avanço, dificuldade ou feedback presenciado..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingEvolucao}
                      className="w-full py-2 bg-[var(--color-csm-green)] hover:opacity-90 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-opacity"
                    >
                      {savingEvolucao ? <LucideLoader2 className="animate-spin" size={14} /> : <LucidePlusCircle size={14} />}
                      Salvar Evolução
                    </button>
                  </form>

                  {/* Listagem de Evoluções */}
                  <div className="lg:col-span-2 space-y-4">
                    <h4 className="text-sm font-bold text-gray-800">Timeline de Evolução do Prontuário</h4>

                    {loadingEvolucoes ? (
                      <div className="flex justify-center py-12">
                        <LucideLoader2 className="animate-spin text-[var(--color-csm-green)]" size={24} />
                      </div>
                    ) : evolucoes.length > 0 ? (
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                        {evolucoes.map((evo) => (
                          <div key={evo.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-[var(--color-csm-green)] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                              <LucideFileText size={16} />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                              <div className="flex items-center justify-between space-x-2 mb-1">
                                <div className="font-bold text-gray-900 text-sm">{evo.papel}</div>
                                <time className="font-semibold text-gray-500 text-[10px]">{new Date(evo.createdAt).toLocaleString('pt-BR')}</time>
                              </div>
                              <div className="text-gray-600 text-xs mb-2">
                                Por: <span className="font-semibold">{evo.autorNome || 'Usuário Sistema'}</span>
                              </div>
                              <div className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-line">
                                {evo.descricao}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 py-12 text-center text-gray-500 text-xs font-semibold">
                        Nenhuma nota evolutiva registrada.
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <button 
            onClick={handleRemoverDoAee}
            disabled={saving || loading}
            className="text-red-500 hover:text-red-700 text-sm font-medium px-4 py-2"
          >
            Remover Aluno do AEE
          </button>
          
          <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
            {message && (
              <span className={`text-sm font-medium ${messageType === 'success' ? 'text-[var(--color-csm-green)]' : 'text-red-600'}`}>
                {message}
              </span>
            )}
            <button 
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors text-sm"
            >
              Fechar
            </button>
            {activeTab === 'ficha' && (
              <button 
                onClick={handleSaveProntuario}
                disabled={saving || loading}
                className="flex items-center gap-2 bg-[var(--color-csm-green)] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
              >
                {saving ? <LucideLoader2 className="animate-spin" size={18} /> : <LucideSave size={18} />}
                Salvar Prontuário
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

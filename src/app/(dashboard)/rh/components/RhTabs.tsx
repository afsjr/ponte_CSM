'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Award, 
  FileText, 
  Plus, 
  Briefcase, 
  DollarSign, 
  Clock, 
  Search,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { 
  getColaboradoresRh, 
  getDossieColaborador, 
  upsertDossieColaborador,
  saveDocumentoColaborador,
  getFeriasColaborador,
  saveFeriasColaborador,
  getOcorrenciasColaborador,
  saveOcorrenciaColaborador,
  getFolhaPagamentoRelatorio
} from '@/actions/rh';

export function RhTabs() {
  const [activeTab, setActiveTab] = useState<'colaboradores' | 'ferias' | 'ocorrencias' | 'folha'>('colaboradores');

  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState<any | null>(null);
  const [feriasList, setFeriasList] = useState<any[]>([]);
  const [ocorrenciasList, setOcorrenciasList] = useState<any[]>([]);
  const [folhaList, setFolhaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modais
  const [modalDossie, setModalDossie] = useState(false);
  const [modalFerias, setModalFerias] = useState(false);
  const [modalOcorrencia, setModalOcorrencia] = useState(false);

  // Formulários
  const [formDossie, setFormDossie] = useState({
    cargo: '',
    salarioBaseReais: '',
    jornadaSemanalHoras: '40',
    dataAdmissao: '',
  });

  const [formFerias, setFormFerias] = useState({
    periodoInicio: '',
    periodoFim: '',
    dataInicioGozo: '',
    dataFimGozo: '',
  });

  const [formOcorrencia, setFormOcorrencia] = useState({
    tipo: 'elogio' as any,
    descricao: '',
    valorImpactoReais: '',
  });

  const carregarColaboradores = async () => {
    setLoading(true);
    try {
      const data = await getColaboradoresRh();
      setColaboradores(data);
      if (data.length > 0 && !colaboradorSelecionado) {
        setColaboradorSelecionado(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarColaboradores();
  }, []);

  useEffect(() => {
    if (colaboradorSelecionado) {
      getFeriasColaborador(colaboradorSelecionado.pessoaId).then(setFeriasList);
      getOcorrenciasColaborador(colaboradorSelecionado.pessoaId).then(setOcorrenciasList);
    }
  }, [colaboradorSelecionado]);

  useEffect(() => {
    if (activeTab === 'folha') {
      getFolhaPagamentoRelatorio().then(setFolhaList);
    }
  }, [activeTab]);

  const handleSaveDossie = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboradorSelecionado || !formDossie.cargo || !formDossie.salarioBaseReais || !formDossie.dataAdmissao) return;

    const salarioCentavos = Math.round(parseFloat(formDossie.salarioBaseReais.replace(',', '.')) * 100);

    await upsertDossieColaborador({
      pessoaId: colaboradorSelecionado.pessoaId,
      cargo: formDossie.cargo,
      salarioBaseCentavos: salarioCentavos,
      jornadaSemanalHoras: parseInt(formDossie.jornadaSemanalHoras),
      dataAdmissao: new Date(formDossie.dataAdmissao),
    });

    setModalDossie(false);
    await carregarColaboradores();
  };

  const handleSaveFerias = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboradorSelecionado) return;

    await saveFeriasColaborador({
      pessoaId: colaboradorSelecionado.pessoaId,
      periodoAquisitivoInicio: new Date(formFerias.periodoInicio),
      periodoAquisitivoFim: new Date(formFerias.periodoFim),
      dataInicioGozo: new Date(formFerias.dataInicioGozo),
      dataFimGozo: new Date(formFerias.dataFimGozo),
    });

    setModalFerias(false);
    const updated = await getFeriasColaborador(colaboradorSelecionado.pessoaId);
    setFeriasList(updated);
  };

  const handleSaveOcorrencia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!colaboradorSelecionado || !formOcorrencia.descricao) return;

    const impactoCentavos = formOcorrencia.valorImpactoReais 
      ? Math.round(parseFloat(formOcorrencia.valorImpactoReais.replace(',', '.')) * 100)
      : undefined;

    await saveOcorrenciaColaborador({
      pessoaId: colaboradorSelecionado.pessoaId,
      tipo: formOcorrencia.tipo,
      descricao: formOcorrencia.descricao,
      valorImpactoCentavos: impactoCentavos,
    });

    setModalOcorrencia(false);
    setFormOcorrencia({ tipo: 'elogio', descricao: '', valorImpactoReais: '' });
    const updated = await getOcorrenciasColaborador(colaboradorSelecionado.pessoaId);
    setOcorrenciasList(updated);
  };

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('colaboradores')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'colaboradores'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          Dossiê dos Colaboradores
        </button>
        <button
          onClick={() => setActiveTab('ferias')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'ferias'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Férias & Programação
        </button>
        <button
          onClick={() => setActiveTab('ocorrencias')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'ocorrencias'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Award className="w-4 h-4" />
          Ocorrências & Histórico
        </button>
        <button
          onClick={() => setActiveTab('folha')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'folha'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          Conferência de Folha
        </button>
      </div>

      {/* Conteúdo Aba: Colaboradores */}
      {activeTab === 'colaboradores' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-3">Lista de Pessoal</h4>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {colaboradores.map(c => (
                <div
                  key={c.pessoaId}
                  onClick={() => setColaboradorSelecionado(c)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                    colaboradorSelecionado?.pessoaId === c.pessoaId
                      ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950/50 dark:border-indigo-800'
                      : 'bg-slate-50 border-transparent hover:bg-slate-100 dark:bg-slate-800/40'
                  }`}
                >
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{c.nomeCompleto}</p>
                  <p className="text-xs text-slate-500">{c.cargo || 'Sem cargo cadastrado'}</p>
                </div>
              ))}
            </div>
          </div>

          {colaboradorSelecionado && (
            <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{colaboradorSelecionado.nomeCompleto}</h3>
                  <p className="text-xs text-slate-500">CPF: {colaboradorSelecionado.cpf || 'Não informado'}</p>
                </div>
                <button
                  onClick={() => {
                    setFormDossie({
                      cargo: colaboradorSelecionado.cargo || '',
                      salarioBaseReais: colaboradorSelecionado.salarioBase ? (colaboradorSelecionado.salarioBase / 100).toString() : '',
                      jornadaSemanalHoras: colaboradorSelecionado.jornadaSemanalHoras?.toString() || '40',
                      dataAdmissao: colaboradorSelecionado.dataAdmissao ? new Date(colaboradorSelecionado.dataAdmissao).toISOString().split('T')[0] : '',
                    });
                    setModalDossie(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  {colaboradorSelecionado.cargo ? 'Editar Dossiê' : 'Cadastrar Dossiê RH'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500">Cargo</p>
                  <p className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {colaboradorSelecionado.cargo || 'Não cadastrado'}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-xs font-semibold text-slate-500">Salário Base</p>
                  <p className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {colaboradorSelecionado.salarioBase
                      ? `R$ ${(colaboradorSelecionado.salarioBase / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : 'Não cadastrado'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo Aba: Férias */}
      {activeTab === 'ferias' && colaboradorSelecionado && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Histórico de Férias — {colaboradorSelecionado.nomeCompleto}
            </h3>
            <button
              onClick={() => setModalFerias(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Programar Férias
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="p-4">Período Aquisitivo</th>
                  <th className="p-4">Período de Gozo</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {feriasList.map(f => (
                  <tr key={f.id}>
                    <td className="p-4">
                      {new Date(f.periodoAquisitivoInicio).toLocaleDateString('pt-BR')} a {new Date(f.periodoAquisitivoFim).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      {new Date(f.dataInicioGozo).toLocaleDateString('pt-BR')} a {new Date(f.dataFimGozo).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                        {f.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {feriasList.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-slate-500">Nenhuma programação de férias registrada.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo Aba: Ocorrências */}
      {activeTab === 'ocorrencias' && colaboradorSelecionado && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Histórico Funcional — {colaboradorSelecionado.nomeCompleto}
            </h3>
            <button
              onClick={() => setModalOcorrencia(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Registrar Ocorrência / Alteração
            </button>
          </div>

          <div className="space-y-3">
            {ocorrenciasList.map(o => (
              <div key={o.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                    {o.tipo.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 mt-2">{o.descricao}</p>
              </div>
            ))}
            {ocorrenciasList.length === 0 && (
              <p className="text-center text-slate-500 p-8">Nenhuma ocorrência registrada para este colaborador.</p>
            )}
          </div>
        </div>
      )}

      {/* Conteúdo Aba: Folha */}
      {activeTab === 'folha' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Relatório de Conferência de Folha Salarial
          </h3>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="p-4">Colaborador</th>
                  <th className="p-4">Cargo</th>
                  <th className="p-4">Salário Base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {folhaList.map(f => (
                  <tr key={f.pessoaId}>
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{f.nomeCompleto}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">{f.cargo}</td>
                    <td className="p-4 font-bold text-indigo-600 dark:text-indigo-400">
                      R$ {(f.salarioBaseCentavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dossiê */}
      {modalDossie && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Dados de RH do Colaborador</h3>
            <form onSubmit={handleSaveDossie} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cargo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Professor de Matemática, Coordenador"
                  value={formDossie.cargo}
                  onChange={e => setFormDossie({ ...formDossie, cargo: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Salário Base (R$)</label>
                <input
                  type="text"
                  required
                  placeholder="3500.00"
                  value={formDossie.salarioBaseReais}
                  onChange={e => setFormDossie({ ...formDossie, salarioBaseReais: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Admissão</label>
                <input
                  type="date"
                  required
                  value={formDossie.dataAdmissao}
                  onChange={e => setFormDossie({ ...formDossie, dataAdmissao: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalDossie(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm"
                >
                  Salvar Dossiê
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Férias */}
      {modalFerias && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Programação de Férias</h3>
            <form onSubmit={handleSaveFerias} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Início Período Aquisitivo</label>
                <input
                  type="date"
                  required
                  value={formFerias.periodoInicio}
                  onChange={e => setFormFerias({ ...formFerias, periodoInicio: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Fim Período Aquisitivo</label>
                <input
                  type="date"
                  required
                  value={formFerias.periodoFim}
                  onChange={e => setFormFerias({ ...formFerias, periodoFim: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data Início do Gozo</label>
                <input
                  type="date"
                  required
                  value={formFerias.dataInicioGozo}
                  onChange={e => setFormFerias({ ...formFerias, dataInicioGozo: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data Fim do Gozo</label>
                <input
                  type="date"
                  required
                  value={formFerias.dataFimGozo}
                  onChange={e => setFormFerias({ ...formFerias, dataFimGozo: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalFerias(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm"
                >
                  Salvar Férias
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ocorrência */}
      {modalOcorrencia && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Nova Ocorrência / Registro RH</h3>
            <form onSubmit={handleSaveOcorrencia} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo de Registro</label>
                <select
                  value={formOcorrencia.tipo}
                  onChange={e => setFormOcorrencia({ ...formOcorrencia, tipo: e.target.value as any })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="elogio">Elogio / Reconhecimento</option>
                  <option value="promocao">Promoção de Cargo</option>
                  <option value="gratificacao">Gratificação Financeira</option>
                  <option value="advertencia_verbal">Advertência Verbal</option>
                  <option value="advertencia_escrita">Advertência Escrita</option>
                  <option value="suspensao">Suspensão</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detalhamento do registro funcional..."
                  value={formOcorrencia.descricao}
                  onChange={e => setFormOcorrencia({ ...formOcorrencia, descricao: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOcorrencia(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm"
                >
                  Salvar Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

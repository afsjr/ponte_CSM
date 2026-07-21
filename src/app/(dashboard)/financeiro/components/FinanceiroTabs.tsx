'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Calendar as CalendarIcon, 
  PieChart, 
  Layers, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  ArrowDownLeft 
} from 'lucide-react';
import { 
  getTitulosFinanceiros, 
  createTituloFinanceiro, 
  baixarTituloFinanceiro,
  getDreRelatorio, 
  getAlertasCalendarioFinanceiro,
  getPlanoContas,
  createPlanoConta,
  getCentrosCusto,
  createCentroCusto
} from '@/actions/financeiro';

export function FinanceiroTabs() {
  const [activeTab, setActiveTab] = useState<'titulos' | 'calendario' | 'dre' | 'config'>('titulos');

  // Estados de dados
  const [titulos, setTitulos] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<{ proximos7Dias: any[]; atrasados: any[] }>({ proximos7Dias: [], atrasados: [] });
  const [dre, setDre] = useState<any>(null);
  const [planos, setPlanos] = useState<any[]>([]);
  const [centros, setCentros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de formulário
  const [modalNovoTitulo, setModalNovoTitulo] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState({
    tipo: 'despesa' as 'receita' | 'despesa',
    descricao: '',
    valorOriginalReais: '',
    dataVencimento: '',
  });

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [tList, aData, dData, pList, cList] = await Promise.all([
        getTitulosFinanceiros(),
        getAlertasCalendarioFinanceiro(),
        getDreRelatorio(),
        getPlanoContas(),
        getCentrosCusto(),
      ]);
      setTitulos(tList);
      setAlertas(aData);
      setDre(dData);
      setPlanos(pList);
      setCentros(cList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const handleCreateTitulo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.descricao || !novoTitulo.valorOriginalReais || !novoTitulo.dataVencimento) return;

    const valorCentavos = Math.round(parseFloat(novoTitulo.valorOriginalReais.replace(',', '.')) * 100);

    await createTituloFinanceiro({
      tipo: novoTitulo.tipo,
      descricao: novoTitulo.descricao,
      valorOriginalCentavos: valorCentavos,
      dataVencimento: new Date(novoTitulo.dataVencimento),
    });

    setModalNovoTitulo(false);
    setNovoTitulo({ tipo: 'despesa', descricao: '', valorOriginalReais: '', dataVencimento: '' });
    await carregarDados();
  };

  const handleBaixa = async (id: string, valorOriginal: number) => {
    await baixarTituloFinanceiro(id, {
      valorPagoCentavos: valorOriginal,
      dataPagamento: new Date(),
      formaPagamento: 'PIX/Transferência',
    });
    await carregarDados();
  };

  return (
    <div className="space-y-6">
      {/* Abas */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('titulos')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'titulos'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Contas a Pagar / Receber
        </button>
        <button
          onClick={() => setActiveTab('calendario')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'calendario'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Calendário & Alertas ({alertas.atrasados.length + alertas.proximos7Dias.length})
        </button>
        <button
          onClick={() => setActiveTab('dre')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'dre'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <PieChart className="w-4 h-4" />
          DRE & Margens
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'config'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          Plano de Contas & Centros
        </button>
      </div>

      {/* Conteúdo Aba: Títulos */}
      {activeTab === 'titulos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              Lançamentos Financeiros
            </h3>
            <button
              onClick={() => setModalNovoTitulo(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Novo Lançamento
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 shadow rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Descrição</th>
                  <th className="p-4">Vencimento</th>
                  <th className="p-4">Valor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {titulos.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-4">
                      {t.tipo === 'receita' ? (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <ArrowDownLeft className="w-4 h-4" /> Receita
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-600 font-medium">
                          <ArrowUpRight className="w-4 h-4" /> Despesa
                        </span>
                      )}
                    </td>
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{t.descricao}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      {new Date(t.dataVencimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                      R$ {(t.valorOriginal / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        t.status === 'pago' || t.status === 'recebido'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {(t.status === 'pendente' || t.status === 'atrasado') && (
                        <button
                          onClick={() => handleBaixa(t.id, t.valorOriginal)}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                        >
                          Confirmar Baixa
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {titulos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      Nenhum lançamento cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Conteúdo Aba: Calendário & Alertas */}
      {activeTab === 'calendario' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-4 rounded-xl">
              <h4 className="font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-amber-600" /> A Vencer nos Próximos 7 Dias ({alertas.proximos7Dias.length})
              </h4>
              <div className="space-y-2">
                {alertas.proximos7Dias.map(a => (
                  <div key={a.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{a.descricao}</p>
                      <p className="text-xs text-slate-500">Vence em: {new Date(a.dataVencimento).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      R$ {(a.valorOriginal / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                {alertas.proximos7Dias.length === 0 && (
                  <p className="text-xs text-amber-700 dark:text-amber-400">Nenhum compromisso para os próximos 7 dias.</p>
                )}
              </div>
            </div>

            <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 p-4 rounded-xl">
              <h4 className="font-semibold text-rose-900 dark:text-rose-300 flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-rose-600" /> Títulos em Atraso ({alertas.atrasados.length})
              </h4>
              <div className="space-y-2">
                {alertas.atrasados.map(a => (
                  <div key={a.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg flex justify-between items-center shadow-sm">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{a.descricao}</p>
                      <p className="text-xs text-rose-500 font-medium">Venceu em: {new Date(a.dataVencimento).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className="font-bold text-rose-600 text-sm">
                      R$ {(a.valorOriginal / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
                {alertas.atrasados.length === 0 && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">Excelente! Nenhum título em atraso.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Aba: DRE & Margens */}
      {activeTab === 'dre' && dre && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase">Total de Receitas</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                R$ {(dre.totalReceitasCentavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase">Total de Despesas</p>
              <p className="text-2xl font-bold text-rose-600 mt-1">
                R$ {(dre.totalDespesasCentavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase">Resultado Líquido</p>
              <p className={`text-2xl font-bold mt-1 ${dre.resultadoLiquidoCentavos >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                R$ {(dre.resultadoLiquidoCentavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase">Margem Operacional</p>
              <p className={`text-2xl font-bold mt-1 ${dre.margemPercentual >= 15 ? 'text-emerald-600' : 'text-amber-500'}`}>
                {dre.margemPercentual}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Novo Lançamento */}
      {modalNovoTitulo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Novo Lançamento Financeiro</h3>
            <form onSubmit={handleCreateTitulo} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                <select
                  value={novoTitulo.tipo}
                  onChange={e => setNovoTitulo({ ...novoTitulo, tipo: e.target.value as any })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                >
                  <option value="despesa">Despesa (Conta a Pagar)</option>
                  <option value="receita">Receita (Conta a Receber)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fornecedor de Papelaria, Imposto DAS, Salários"
                  value={novoTitulo.descricao}
                  onChange={e => setNovoTitulo({ ...novoTitulo, descricao: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor (R$)</label>
                <input
                  type="text"
                  required
                  placeholder="1500.00"
                  value={novoTitulo.valorOriginalReais}
                  onChange={e => setNovoTitulo({ ...novoTitulo, valorOriginalReais: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Data de Vencimento</label>
                <input
                  type="date"
                  required
                  value={novoTitulo.dataVencimento}
                  onChange={e => setNovoTitulo({ ...novoTitulo, dataVencimento: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovoTitulo(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm"
                >
                  Salvar Título
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

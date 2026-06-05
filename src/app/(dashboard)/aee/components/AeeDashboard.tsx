'use client';

import { useState, useEffect } from 'react';
import { getAlunosAee } from '@/actions/aee';
import { LucideSearch, LucideFileText, LucidePlus, LucideX } from 'lucide-react';
import AeeFormModal from './AeeFormModal';
import { getPessoas } from '@/actions/pessoa'; // Para adicionar novos alunos ao AEE

export default function AeeDashboard() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAlunoId, setSelectedAlunoId] = useState<string | null>(null);

  // Estados para inclusão de novo aluno no AEE
  const [allAlunos, setAllAlunos] = useState<any[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await getAlunosAee();
    setAlunos(data);
    setLoading(false);
  }

  async function handleAddNewClick() {
    if (allAlunos.length === 0) {
      const res = await getPessoas({ limit: 1000 }); // Pega todos para filtrar no select
      if (res.success && res.data) {
        // Idealmente pegaríamos apenas alunos ativos que não estão no AEE
        const candidatos = res.data.filter((p: any) => p.situacao === 'ativo' && !p.necessidadeEspecial);
        setAllAlunos(candidatos);
      }
    }
    setIsAddingNew(true);
  }

  function handleEditProntuario(id: string) {
    setSelectedAlunoId(id);
    setModalOpen(true);
  }

  const filteredAlunos = alunos.filter(a => 
    a.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.cpf && a.cpf.includes(searchTerm))
  );

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="relative w-full md:w-96">
          <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Buscar aluno por nome ou CPF..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-csm-green)] text-slate-900 dark:text-slate-100 text-sm"
          />
        </div>

        <button 
          onClick={handleAddNewClick}
          className="flex items-center gap-2 bg-[var(--color-csm-green)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium shadow-sm w-full md:w-auto justify-center"
        >
          <LucidePlus size={18} />
          Incluir Aluno no AEE
        </button>
      </div>

      {/* Select Box for Adding New (Simple Dropdown inline for MVP) */}
      {isAddingNew && (
        <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/50 p-4 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <select 
            className="flex-1 p-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm"
            onChange={(e) => {
              if (e.target.value) {
                setSelectedAlunoId(e.target.value);
                setModalOpen(true);
                setIsAddingNew(false);
              }
            }}
          >
            <option value="" className="dark:bg-slate-800">Selecione um aluno para criar o prontuário AEE...</option>
            {allAlunos.map(a => (
              <option key={a.id} value={a.id} className="dark:bg-slate-800">{a.nomeCompleto} - CPF: {a.cpf || 'N/A'}</option>
            ))}
          </select>
          <button onClick={() => setIsAddingNew(false)} className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-350">
            <LucideX size={20} />
          </button>
        </div>
      )}

      {/* Tabela de Alunos */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">Carregando alunos AEE...</div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-305">
            <thead className="bg-gray-50 dark:bg-slate-800 text-slate-705 dark:text-slate-200 font-semibold border-b border-gray-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Nome do Aluno</th>
                <th className="p-4">CPF</th>
                <th className="p-4">Data Nascimento</th>
                <th className="p-4">Situação</th>
                <th className="p-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredAlunos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Nenhum aluno cadastrado no programa AEE.
                  </td>
                </tr>
              ) : (
                filteredAlunos.map(aluno => (
                  <tr key={aluno.id} className="hover:bg-gray-50 dark:hover:bg-slate-850/50 transition-colors">
                    <td className="p-4 font-medium text-slate-900 dark:text-slate-100">{aluno.nomeCompleto}</td>
                    <td className="p-4">{aluno.cpf || 'Não informado'}</td>
                    <td className="p-4">
                      {aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="p-4 capitalize">{aluno.situacao}</td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleEditProntuario(aluno.id)}
                        className="text-[var(--color-csm-green)] hover:opacity-85 font-medium flex items-center justify-center gap-1 w-full"
                      >
                        <LucideFileText size={16} />
                        Ver Prontuário
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal / Slide-over */}
      {modalOpen && selectedAlunoId && (
        <AeeFormModal 
          alunoId={selectedAlunoId} 
          onClose={() => {
            setModalOpen(false);
            setSelectedAlunoId(null);
            loadData(); // Recarrega lista
          }} 
        />
      )}
    </div>
  );
}

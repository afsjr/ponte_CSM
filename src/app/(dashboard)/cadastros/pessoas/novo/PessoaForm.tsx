"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPessoa } from '@/actions/pessoa'
import { LucideUser, LucideTags, LucideMapPin, LucidePhone, LucideSave, LucideLoader2, LucideBookOpen } from 'lucide-react'
import { DadosPessoaisTab, ClassificacaoTab, EnderecoTab, ContatoTab, HabilitacaoTab, DadosAlunoTab, DadosFuncionarioTab } from './PessoaFormTabs'

export function PessoaForm({ disciplinas = [], turmas = [] }: { disciplinas?: { id: string, nome: string }[], turmas?: { id: string, nome: string }[] }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dados_pessoais')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    rg: '',
    genero: 'nao_informado',
    estadoCivil: 'solteiro',
    situacao: 'ativo',
    classificacoes: [] as string[],
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: ''
    },
    contatos: [
      { tipo: 'celular', valor: '', principal: true }
    ],
    habilitacoes: [] as string[],
    dadosAluno: {
      numeroMatricula: '',
      ra: '',
      codigoBarras: '',
      loginPortal: '',
      senhaPortalHash: '',
      cartaoCatraca: '',
      permitirBiblioteca: true,
      turmaAtualId: ''
    },
    dadosFuncionario: {
      cargo: '',
      departamento: '',
      dataAdmissao: '',
      dataDemissao: '',
      salario: '',
      cargaHoraria: '',
      registroProfissional: ''
    }
  })

  const handleClassificacaoChange = (tipo: string) => {
    setFormData(prev => {
      const isSelected = prev.classificacoes.includes(tipo)
      let newClassificacoes = []
      if (isSelected) {
        newClassificacoes = prev.classificacoes.filter(c => c !== tipo)
      } else {
        newClassificacoes = [...prev.classificacoes, tipo]
      }
      
      let newHabilitacoes = prev.habilitacoes
      if (isSelected && tipo === 'funcionario') {
        newHabilitacoes = []
      }
      
      return { ...prev, classificacoes: newClassificacoes, habilitacoes: newHabilitacoes }
    })
  }

  const handleHabilitacaoChange = (id: string) => {
    setFormData(prev => {
      const isSelected = prev.habilitacoes.includes(id)
      if (isSelected) {
        return { ...prev, habilitacoes: prev.habilitacoes.filter(h => h !== id) }
      } else {
        return { ...prev, habilitacoes: [...prev.habilitacoes, id] }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const payload = {
      ...formData,
      genero: formData.genero as 'masculino' | 'feminino' | 'outro' | 'nao_informado',
      estadoCivil: formData.estadoCivil as 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel' | 'separado',
      situacao: formData.situacao as 'ativo' | 'inativo' | 'suspenso' | 'transferido' | 'formado' | 'desistente',
      contatos: formData.contatos.map(c => ({
        tipo: c.tipo as 'celular' | 'telefone_fixo' | 'email' | 'whatsapp',
        valor: c.valor,
        principal: c.principal
      })),
      classificacoes: formData.classificacoes as any,
      dadosAluno: formData.classificacoes.includes('aluno') ? {
        numeroMatricula: formData.dadosAluno.numeroMatricula || undefined,
        ra: formData.dadosAluno.ra || undefined,
        codigoBarras: formData.dadosAluno.codigoBarras || undefined,
        loginPortal: formData.dadosAluno.loginPortal || undefined,
        senhaPortalHash: formData.dadosAluno.senhaPortalHash || undefined,
        cartaoCatraca: formData.dadosAluno.cartaoCatraca || undefined,
        permitirBiblioteca: formData.dadosAluno.permitirBiblioteca,
        turmaAtualId: formData.dadosAluno.turmaAtualId || undefined
      } : undefined,
      dadosFuncionario: formData.classificacoes.includes('funcionario') ? {
        cargo: formData.dadosFuncionario.cargo || undefined,
        departamento: formData.dadosFuncionario.departamento || undefined,
        dataAdmissao: formData.dadosFuncionario.dataAdmissao ? new Date(formData.dadosFuncionario.dataAdmissao) : undefined,
        dataDemissao: formData.dadosFuncionario.dataDemissao ? new Date(formData.dadosFuncionario.dataDemissao) : undefined,
        salario: formData.dadosFuncionario.salario ? Math.round(parseFloat(formData.dadosFuncionario.salario) * 100) : undefined,
        cargaHoraria: formData.dadosFuncionario.cargaHoraria ? parseInt(formData.dadosFuncionario.cargaHoraria) : undefined,
        registroProfissional: formData.dadosFuncionario.registroProfissional || undefined
      } : undefined
    }

    const result = await createPessoa(payload)

    if (result.success) {
      router.push('/cadastros/pessoas')
      router.refresh()
    } else {
      setError(result.error || 'Erro desconhecido ao salvar.')
      setIsSubmitting(false)
    }
  }

  const tabClass = (tabId: string) => `flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
    activeTab === tabId 
      ? 'border-blue-600 text-blue-600' 
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
  }`

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button type="button" onClick={() => setActiveTab('dados_pessoais')} className={tabClass('dados_pessoais')}>
          <LucideUser size={18} /> Dados Pessoais
        </button>
        <button type="button" onClick={() => setActiveTab('classificacao')} className={tabClass('classificacao')}>
          <LucideTags size={18} /> Classificação
        </button>
        {formData.classificacoes.includes('aluno') && (
          <button type="button" onClick={() => setActiveTab('dados_aluno')} className={tabClass('dados_aluno')}>
            <LucideUser size={18} className="text-blue-500" /> Dados do Aluno
          </button>
        )}
        {formData.classificacoes.includes('funcionario') && (
          <button type="button" onClick={() => setActiveTab('dados_funcionario')} className={tabClass('dados_funcionario')}>
            <LucideUser size={18} className="text-green-500" /> Dados do Funcionário
          </button>
        )}
        {formData.classificacoes.includes('funcionario') && (
          <button type="button" onClick={() => setActiveTab('habilitacao')} className={tabClass('habilitacao')}>
            <LucideBookOpen size={18} /> Habilitações
          </button>
        )}
        <button type="button" onClick={() => setActiveTab('endereco')} className={tabClass('endereco')}>
          <LucideMapPin size={18} /> Endereço
        </button>
        <button type="button" onClick={() => setActiveTab('contato')} className={tabClass('contato')}>
          <LucidePhone size={18} /> Contato
        </button>
      </div>

      <div className="p-6 min-h-[300px]">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {activeTab === 'dados_pessoais' && (
          <DadosPessoaisTab formData={formData} setFormData={setFormData} />
        )}
        {activeTab === 'classificacao' && (
          <ClassificacaoTab formData={formData} handleClassificacaoChange={handleClassificacaoChange} />
        )}
        {activeTab === 'dados_aluno' && formData.classificacoes.includes('aluno') && (
          <DadosAlunoTab formData={formData} setFormData={setFormData} turmas={turmas} />
        )}
        {activeTab === 'dados_funcionario' && formData.classificacoes.includes('funcionario') && (
          <DadosFuncionarioTab formData={formData} setFormData={setFormData} />
        )}
        {activeTab === 'endereco' && (
          <EnderecoTab formData={formData} setFormData={setFormData} />
        )}
        {activeTab === 'contato' && (
          <ContatoTab formData={formData} setFormData={setFormData} />
        )}
        {activeTab === 'habilitacao' && formData.classificacoes.includes('funcionario') && (
          <HabilitacaoTab formData={formData} disciplinas={disciplinas} handleHabilitacaoChange={handleHabilitacaoChange} />
        )}
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between rounded-b-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? <LucideLoader2 size={18} className="animate-spin" /> : <LucideSave size={18} />}
          Salvar Pessoa
        </button>
      </div>
    </form>
  )
}

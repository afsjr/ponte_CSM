"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePessoa } from '@/actions/pessoa'
import {
  LucideUser, LucideTags, LucideMapPin, LucidePhone,
  LucideSave, LucideLoader2, LucideBookOpen
} from 'lucide-react'
import {
  DadosPessoaisTab, ClassificacaoTab, EnderecoTab,
  ContatoTab, HabilitacaoTab, DadosAlunoTab, DadosFuncionarioTab
} from '../../novo/PessoaFormTabs'

type PessoaCompleta = {
  id: string
  nomeCompleto: string
  cpf?: string | null
  rg?: string | null
  genero?: string | null
  estadoCivil?: string | null
  situacao?: string | null
  dataNascimento?: Date | null
  classificacoes: string[]
  endereco?: {
    cep: string; logradouro: string; numero: string
    complemento?: string | null; bairro: string; cidade: string; uf: string
  } | null
  contatos?: { tipo: string; valor: string; principal?: boolean | null }[]
  habilitacoes?: string[]
  dadosAluno?: {
    numeroMatricula?: string | null; ra?: string | null; codigoBarras?: string | null
    loginPortal?: string | null; senhaPortalHash?: string | null
    cartaoCatraca?: string | null; permitirBiblioteca?: boolean | null; turmaAtualId?: string | null
  } | null
  dadosFuncionario?: {
    cargo?: string | null; departamento?: string | null; dataAdmissao?: Date | null
    dataDemissao?: Date | null; salario?: number | null; cargaHoraria?: number | null
    registroProfissional?: string | null
    observacoes?: string | null
    banco?: string | null
    agencia?: string | null
    conta?: string | null
    tipoConta?: string | null
    chavePix?: string | null
    tipoChavePix?: string | null
    feriasProximasInicio?: Date | null
    feriasProximasFim?: Date | null
    feriasUltimoPeriodo?: string | null
  } | null
}

export function PessoaEditForm({
  pessoa,
  disciplinas = [],
  turmas = [],
}: {
  pessoa: PessoaCompleta
  disciplinas?: { id: string; nome: string }[]
  turmas?: { id: string; nome: string }[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dados_pessoais')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const toDateStr = (d?: Date | string | null) => {
    if (!d) return ''
    try {
      const dt = new Date(d)
      return isNaN(dt.getTime()) ? '' : dt.toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  const [formData, setFormData] = useState({
    nomeCompleto: pessoa.nomeCompleto || '',
    cpf: pessoa.cpf || '',
    rg: pessoa.rg || '',
    genero: pessoa.genero || 'nao_informado',
    estadoCivil: pessoa.estadoCivil || 'solteiro',
    situacao: pessoa.situacao || 'ativo',
    dataNascimento: toDateStr(pessoa.dataNascimento),
    classificacoes: (pessoa.classificacoes || []) as string[],
    endereco: {
      cep: pessoa.endereco?.cep || '',
      logradouro: pessoa.endereco?.logradouro || '',
      numero: pessoa.endereco?.numero || '',
      complemento: pessoa.endereco?.complemento || '',
      bairro: pessoa.endereco?.bairro || '',
      cidade: pessoa.endereco?.cidade || '',
      uf: pessoa.endereco?.uf || '',
    },
    contatos: pessoa.contatos && pessoa.contatos.length > 0
      ? pessoa.contatos.map(c => ({ tipo: c.tipo, valor: c.valor, principal: c.principal ?? false }))
      : [{ tipo: 'celular', valor: '', principal: true }],
    habilitacoes: (pessoa.habilitacoes || []) as string[],
    dadosAluno: {
      numeroMatricula: pessoa.dadosAluno?.numeroMatricula || '',
      ra: pessoa.dadosAluno?.ra || '',
      codigoBarras: pessoa.dadosAluno?.codigoBarras || '',
      loginPortal: pessoa.dadosAluno?.loginPortal || '',
      senhaPortalHash: pessoa.dadosAluno?.senhaPortalHash || '',
      cartaoCatraca: pessoa.dadosAluno?.cartaoCatraca || '',
      permitirBiblioteca: pessoa.dadosAluno?.permitirBiblioteca ?? true,
      turmaAtualId: pessoa.dadosAluno?.turmaAtualId || '',
      vinculos: (pessoa.dadosAluno as any)?.vinculos || [],
    },
    dadosFuncionario: {
      cargo: pessoa.dadosFuncionario?.cargo || '',
      departamento: pessoa.dadosFuncionario?.departamento || '',
      dataAdmissao: toDateStr(pessoa.dadosFuncionario?.dataAdmissao),
      dataDemissao: toDateStr(pessoa.dadosFuncionario?.dataDemissao),
      salario: pessoa.dadosFuncionario?.salario ? String(pessoa.dadosFuncionario.salario / 100) : '',
      cargaHoraria: pessoa.dadosFuncionario?.cargaHoraria ? String(pessoa.dadosFuncionario.cargaHoraria) : '',
      registroProfissional: pessoa.dadosFuncionario?.registroProfissional || '',
      observacoes: pessoa.dadosFuncionario?.observacoes || '',
      banco: pessoa.dadosFuncionario?.banco || '',
      agencia: pessoa.dadosFuncionario?.agencia || '',
      conta: pessoa.dadosFuncionario?.conta || '',
      tipoConta: (pessoa.dadosFuncionario?.tipoConta || 'corrente') as 'corrente' | 'poupanca' | 'salario',
      chavePix: pessoa.dadosFuncionario?.chavePix || '',
      tipoChavePix: (pessoa.dadosFuncionario?.tipoChavePix || 'cpf') as 'cpf' | 'cnpj' | 'email' | 'celular' | 'aleatoria',
      feriasProximasInicio: toDateStr(pessoa.dadosFuncionario?.feriasProximasInicio),
      feriasProximasFim: toDateStr(pessoa.dadosFuncionario?.feriasProximasFim),
      feriasUltimoPeriodo: pessoa.dadosFuncionario?.feriasUltimoPeriodo || ''
    },
  })

  const handleClassificacaoChange = (tipo: string) => {
    setFormData(prev => {
      const isSelected = prev.classificacoes.includes(tipo)
      const newClassificacoes = isSelected
        ? prev.classificacoes.filter(c => c !== tipo)
        : [...prev.classificacoes, tipo]
      const newHabilitacoes = isSelected && tipo === 'funcionario' ? [] : prev.habilitacoes
      return { ...prev, classificacoes: newClassificacoes, habilitacoes: newHabilitacoes }
    })
  }

  const handleHabilitacaoChange = (id: string) => {
    setFormData(prev => {
      const isSelected = prev.habilitacoes.includes(id)
      return {
        ...prev,
        habilitacoes: isSelected
          ? prev.habilitacoes.filter(h => h !== id)
          : [...prev.habilitacoes, id],
      }
    })
  }

  const safeDate = (dateStr: string) => {
    if (!dateStr || dateStr.trim() === '') return undefined;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    const payload = {
      ...formData,
      dataNascimento: safeDate(formData.dataNascimento),
      genero: formData.genero as any,
      estadoCivil: formData.estadoCivil as any,
      situacao: formData.situacao as any,
      contatos: formData.contatos.map(c => ({
        tipo: c.tipo as any,
        valor: c.valor,
        principal: c.principal,
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
        turmaAtualId: formData.dadosAluno.turmaAtualId || undefined,
        vinculos: formData.dadosAluno.vinculos ? formData.dadosAluno.vinculos.map((v: any) => ({
          responsavelId: v.responsavelId,
          grauParentesco: v.grauParentesco,
          responsavelFinanceiro: v.responsavelFinanceiro,
          responsavelPedagogico: v.responsavelPedagogico,
          autorizadoRetirada: v.autorizadoRetirada,
        })) : undefined,
      } : undefined,
      dadosFuncionario: formData.classificacoes.includes('funcionario') ? {
        cargo: formData.dadosFuncionario.cargo || undefined,
        departamento: formData.dadosFuncionario.departamento || undefined,
        dataAdmissao: safeDate(formData.dadosFuncionario.dataAdmissao),
        dataDemissao: safeDate(formData.dadosFuncionario.dataDemissao),
        salario: formData.dadosFuncionario.salario ? Math.round(parseFloat(formData.dadosFuncionario.salario) * 100) : undefined,
        cargaHoraria: formData.dadosFuncionario.cargaHoraria ? parseInt(formData.dadosFuncionario.cargaHoraria) : undefined,
        registroProfissional: formData.dadosFuncionario.registroProfissional || undefined,
        observacoes: formData.dadosFuncionario.observacoes || undefined,
        banco: formData.dadosFuncionario.banco || undefined,
        agencia: formData.dadosFuncionario.agencia || undefined,
        conta: formData.dadosFuncionario.conta || undefined,
        tipoConta: formData.dadosFuncionario.tipoConta || undefined,
        chavePix: formData.dadosFuncionario.chavePix || undefined,
        tipoChavePix: formData.dadosFuncionario.tipoChavePix || undefined,
        feriasProximasInicio: safeDate(formData.dadosFuncionario.feriasProximasInicio),
        feriasProximasFim: safeDate(formData.dadosFuncionario.feriasProximasFim),
        feriasUltimoPeriodo: formData.dadosFuncionario.feriasUltimoPeriodo || undefined
      } : undefined,
    }

    try {
      const result = await updatePessoa(pessoa.id, payload)

      setIsSubmitting(false)
      if (result.success) {
        setSuccessMsg('Dados salvos com sucesso!')
        router.refresh()
      } else {
        setError(result.error || 'Erro desconhecido ao salvar.')
      }
    } catch (err: any) {
      console.error('Erro ao salvar:', err)
      setError(err.message || 'Ocorreu um erro ao salvar os dados. Por favor, tente novamente.')
      setIsSubmitting(false)
    }
  }

  const tabClass = (tabId: string) =>
    `flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
            ✅ {successMsg}
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
          onClick={() => router.push('/cadastros/pessoas')}
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
          Salvar Alterações
        </button>
      </div>
    </form>
  )
}

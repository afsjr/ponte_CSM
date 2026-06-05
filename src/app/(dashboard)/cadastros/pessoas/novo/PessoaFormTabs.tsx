'use client'

import React from 'react'

export function DadosPessoaisTab({ formData, setFormData }: { formData: any, setFormData: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
        <input
          type="text"
          required
          value={formData.nomeCompleto}
          onChange={e => setFormData({...formData, nomeCompleto: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          placeholder="Nome completo da pessoa"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
        <input
          type="text"
          value={formData.cpf}
          onChange={e => setFormData({...formData, cpf: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="000.000.000-00"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">RG</label>
        <input
          type="text"
          value={formData.rg}
          onChange={e => setFormData({...formData, rg: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
        <select
          value={formData.genero}
          onChange={e => setFormData({...formData, genero: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="nao_informado">Não Informado</option>
          <option value="masculino">Masculino</option>
          <option value="feminino">Feminino</option>
          <option value="outro">Outro</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Estado Civil</label>
        <select
          value={formData.estadoCivil}
          onChange={e => setFormData({...formData, estadoCivil: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="solteiro">Solteiro(a)</option>
          <option value="casado">Casado(a)</option>
          <option value="divorciado">Divorciado(a)</option>
          <option value="viuvo">Viúvo(a)</option>
        </select>
      </div>
    </div>
  )
}

export function ClassificacaoTab({ formData, handleClassificacaoChange }: { formData: any, handleClassificacaoChange: (t: string) => void }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-4">Qual é o vínculo desta pessoa com a instituição?</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { id: 'aluno', label: 'Aluno', desc: 'Estudante matriculado' },
          { id: 'funcionario', label: 'Funcionário', desc: 'Corpo docente ou administrativo' },
          { id: 'responsavel', label: 'Responsável', desc: 'Responsável legal ou financeiro' },
          { id: 'interessado', label: 'Interessado', desc: 'Lead / Prospecto' },
          { id: 'fornecedor', label: 'Fornecedor', desc: 'Empresa ou serviço parceiro' },
        ].map(tipo => (
          <label 
            key={tipo.id} 
            className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
              formData.classificacoes.includes(tipo.id) 
                ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex h-5 items-center">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                checked={formData.classificacoes.includes(tipo.id)}
                onChange={() => handleClassificacaoChange(tipo.id)}
              />
            </div>
            <div className="ml-3 text-sm">
              <span className="font-medium text-gray-900 block">{tipo.label}</span>
              <span className="text-gray-500 text-xs">{tipo.desc}</span>
            </div>
          </label>
        ))}
      </div>
      
      {formData.classificacoes.length === 0 && (
        <p className="mt-4 text-sm text-amber-600">
          ⚠️ É altamente recomendado selecionar ao menos uma classificação.
        </p>
      )}
    </div>
  )
}

export function EnderecoTab({ formData, setFormData }: { formData: any, setFormData: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
        <input
          type="text"
          value={formData.endereco.cep}
          onChange={e => setFormData({...formData, endereco: {...formData.endereco, cep: e.target.value}})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="00000-000"
        />
      </div>
      <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
        <input
          type="text"
          value={formData.endereco.logradouro}
          onChange={e => setFormData({...formData, endereco: {...formData.endereco, logradouro: e.target.value}})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Rua, Avenida, etc"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Número</label>
        <input
          type="text"
          value={formData.endereco.numero}
          onChange={e => setFormData({...formData, endereco: {...formData.endereco, numero: e.target.value}})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
        <input
          type="text"
          value={formData.endereco.complemento}
          onChange={e => setFormData({...formData, endereco: {...formData.endereco, complemento: e.target.value}})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
        <input
          type="text"
          value={formData.endereco.bairro}
          onChange={e => setFormData({...formData, endereco: {...formData.endereco, bairro: e.target.value}})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
        <input
          type="text"
          value={formData.endereco.cidade}
          onChange={e => setFormData({...formData, endereco: {...formData.endereco, cidade: e.target.value}})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">UF</label>
        <input
          type="text"
          maxLength={2}
          value={formData.endereco.uf}
          onChange={e => setFormData({...formData, endereco: {...formData.endereco, uf: e.target.value}})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase"
          placeholder="SP"
        />
      </div>
    </div>
  )
}

export function ContatoTab({ formData, setFormData }: { formData: any, setFormData: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone Principal (Celular)</label>
        <input
          type="text"
          value={formData.contatos[0].valor}
          onChange={e => {
            const newContatos = [...formData.contatos];
            newContatos[0].valor = e.target.value;
            setFormData({...formData, contatos: newContatos})
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="(00) 00000-0000"
        />
      </div>
    </div>
  )
}

export function HabilitacaoTab({ formData, disciplinas, handleHabilitacaoChange }: { formData: any, disciplinas: any[], handleHabilitacaoChange: (id: string) => void }) {
  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-4">Selecione as disciplinas que este professor está habilitado a lecionar:</h3>
      {disciplinas.length === 0 ? (
        <p className="text-sm text-gray-500">Nenhuma disciplina cadastrada no sistema.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {disciplinas.map(disciplina => (
            <label 
              key={disciplina.id} 
              className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${
                formData.habilitacoes.includes(disciplina.id) 
                  ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex h-5 items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  checked={formData.habilitacoes.includes(disciplina.id)}
                  onChange={() => handleHabilitacaoChange(disciplina.id)}
                />
              </div>
              <div className="ml-3 text-sm">
                <span className="font-medium text-gray-900 block">{disciplina.nome}</span>
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export function DadosAlunoTab({ formData, setFormData, turmas = [] }: { formData: any, setFormData: any, turmas: any[] }) {
  const updateDadosAluno = (key: string, value: any) => {
    setFormData({
      ...formData,
      dadosAluno: {
        ...formData.dadosAluno,
        [key]: value
      }
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Matrícula</label>
        <input
          type="text"
          value={formData.dadosAluno.numeroMatricula}
          onChange={e => updateDadosAluno('numeroMatricula', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ex: MAT-2026-001"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">RA (Registro do Aluno)</label>
        <input
          type="text"
          value={formData.dadosAluno.ra}
          onChange={e => updateDadosAluno('ra', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ex: RA-123456"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Turma Atual</label>
        <select
          value={formData.dadosAluno.turmaAtualId}
          onChange={e => updateDadosAluno('turmaAtualId', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">Sem Turma / Selecionar...</option>
          {turmas.map((t: any) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
        <input
          type="text"
          value={formData.dadosAluno.codigoBarras}
          onChange={e => updateDadosAluno('codigoBarras', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cartão da Catraca</label>
        <input
          type="text"
          value={formData.dadosAluno.cartaoCatraca}
          onChange={e => updateDadosAluno('cartaoCatraca', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Login do Portal</label>
        <input
          type="text"
          value={formData.dadosAluno.loginPortal}
          onChange={e => updateDadosAluno('loginPortal', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Senha Provisória do Portal</label>
        <input
          type="password"
          value={formData.dadosAluno.senhaPortalHash}
          onChange={e => updateDadosAluno('senhaPortalHash', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Definir senha inicial"
        />
      </div>
      <div className="flex items-center pt-8">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={formData.dadosAluno.permitirBiblioteca}
            onChange={e => updateDadosAluno('permitirBiblioteca', e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
          />
          <span className="ml-3 text-sm font-medium text-gray-700">Permitir Empréstimo na Biblioteca</span>
        </label>
      </div>
    </div>
  )
}

export function DadosFuncionarioTab({ formData, setFormData }: { formData: any, setFormData: any }) {
  const updateDadosFuncionario = (key: string, value: any) => {
    setFormData({
      ...formData,
      dadosFuncionario: {
        ...formData.dadosFuncionario,
        [key]: value
      }
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
        <input
          type="text"
          value={formData.dadosFuncionario.cargo}
          onChange={e => updateDadosFuncionario('cargo', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ex: Professor de Matemática"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
        <input
          type="text"
          value={formData.dadosFuncionario.departamento}
          onChange={e => updateDadosFuncionario('departamento', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ex: Pedagógico"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Registro Profissional</label>
        <input
          type="text"
          value={formData.dadosFuncionario.registroProfissional}
          onChange={e => updateDadosFuncionario('registroProfissional', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ex: CRM, MEC, OAB..."
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Salário Mensal (R$)</label>
        <input
          type="number"
          step="0.01"
          value={formData.dadosFuncionario.salario}
          onChange={e => updateDadosFuncionario('salario', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ex: 3500.00"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Carga Horária Semanal (Horas)</label>
        <input
          type="number"
          value={formData.dadosFuncionario.cargaHoraria}
          onChange={e => updateDadosFuncionario('cargaHoraria', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Ex: 40"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão</label>
        <input
          type="date"
          value={formData.dadosFuncionario.dataAdmissao}
          onChange={e => updateDadosFuncionario('dataAdmissao', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Demissão (se houver)</label>
        <input
          type="date"
          value={formData.dadosFuncionario.dataDemissao}
          onChange={e => updateDadosFuncionario('dataDemissao', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
    </div>
  )
}

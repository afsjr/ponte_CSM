'use client'

import React, { useState } from 'react'
import { LucideTrash2 } from 'lucide-react'
import { ResponsavelSelector } from '@/components/ui/ResponsavelSelector'

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
        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
        <input
          type="date"
          value={formData.dataNascimento || ''}
          onChange={e => setFormData({...formData, dataNascimento: e.target.value})}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
          value={formData.contatos[0]?.valor || ''}
          onChange={e => {
            const newContatos = [...formData.contatos];
            if (!newContatos[0]) newContatos[0] = { tipo: 'celular', valor: '', principal: true };
            newContatos[0].valor = e.target.value;
            setFormData({...formData, contatos: newContatos})
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="(00) 00000-0000"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail Principal</label>
        <input
          type="email"
          value={formData.contatos[1]?.valor || ''}
          onChange={e => {
            const newContatos = [...formData.contatos];
            if (!newContatos[1]) {
              newContatos[1] = { tipo: 'email', valor: '', principal: false };
            }
            newContatos[1].valor = e.target.value;
            setFormData({...formData, contatos: newContatos})
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="email@exemplo.com"
        />
      </div>
    </div>
  )
}

export function HabilitacaoTab({ formData, disciplinas, handleHabilitacaoChange }: { formData: any, disciplinas: any[], handleHabilitacaoChange: (id: string) => void }) {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 flex items-start gap-3 shadow-sm">
        <span className="text-lg leading-none">💡</span>
        <div>
          <strong className="font-semibold block mb-0.5">Nota de Habilitação do Docente:</strong>
          A vinculação de disciplinas é opcional e aplicável especificamente para professores/docentes. Se o funcionário desempenhar funções administrativas ou gerais, este passo não é obrigatório.
        </div>
      </div>

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

      <div className="md:col-span-2 lg:col-span-3 pt-6 mt-6 border-t border-gray-200">
        <h3 className="text-base font-medium text-gray-900 mb-4">Responsáveis do Aluno</h3>
        
        <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Vincular Novo Responsável</label>
          <ResponsavelSelector 
            onSelect={(r) => {
              const currentVinculos = formData.dadosAluno.vinculos || [];
              if (currentVinculos.find((v: any) => v.responsavelId === r.id)) {
                return; // já adicionado
              }
              const novoVinculo = {
                responsavelId: r.id,
                responsavelNome: r.nomeCompleto,
                responsavelCpf: r.cpf,
                grauParentesco: 'Pai/Mãe',
                responsavelFinanceiro: false,
                responsavelPedagogico: true,
                autorizadoRetirada: true
              }
              updateDadosAluno('vinculos', [...currentVinculos, novoVinculo])
            }} 
          />
          <p className="mt-2 text-xs text-gray-500">
            Atenção: A pessoa já deve estar cadastrada no sistema com a classificação "Responsável".
          </p>
        </div>

        {formData.dadosAluno.vinculos && formData.dadosAluno.vinculos.length > 0 ? (
          <div className="space-y-4">
            {formData.dadosAluno.vinculos.map((vinculo: any, index: number) => (
              <div key={vinculo.responsavelId} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{vinculo.responsavelNome}</p>
                  <p className="text-xs text-gray-500">CPF: {vinculo.responsavelCpf || 'Não informado'}</p>
                </div>
                
                <div className="flex-1 w-full sm:w-auto">
                  <label className="block text-xs text-gray-500 mb-1">Parentesco</label>
                  <input 
                    type="text" 
                    value={vinculo.grauParentesco}
                    onChange={(e) => {
                      const newVinculos = [...formData.dadosAluno.vinculos]
                      newVinculos[index].grauParentesco = e.target.value
                      updateDadosAluno('vinculos', newVinculos)
                    }}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="Ex: Pai, Mãe, Avó..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={vinculo.responsavelFinanceiro}
                      onChange={(e) => {
                        const newVinculos = [...formData.dadosAluno.vinculos]
                        newVinculos[index].responsavelFinanceiro = e.target.checked
                        updateDadosAluno('vinculos', newVinculos)
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 mr-2"
                    />
                    Financeiro
                  </label>
                  <label className="flex items-center cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={vinculo.responsavelPedagogico}
                      onChange={(e) => {
                        const newVinculos = [...formData.dadosAluno.vinculos]
                        newVinculos[index].responsavelPedagogico = e.target.checked
                        updateDadosAluno('vinculos', newVinculos)
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 mr-2"
                    />
                    Pedagógico
                  </label>
                  <label className="flex items-center cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={vinculo.autorizadoRetirada}
                      onChange={(e) => {
                        const newVinculos = [...formData.dadosAluno.vinculos]
                        newVinculos[index].autorizadoRetirada = e.target.checked
                        updateDadosAluno('vinculos', newVinculos)
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 mr-2"
                    />
                    Autorizado a retirar
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const newVinculos = [...formData.dadosAluno.vinculos]
                    newVinculos.splice(index, 1)
                    updateDadosAluno('vinculos', newVinculos)
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-auto sm:ml-0"
                  title="Remover vínculo"
                >
                  <LucideTrash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500 text-sm">Nenhum responsável vinculado a este aluno.</p>
          </div>
        )}
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
    <div className="space-y-8">
      {/* 1. Informações Contratuais */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <h4 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <span className="text-xl">💼</span> Informações Contratuais
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
            <input
              type="text"
              value={formData.dadosFuncionario.cargo || ''}
              onChange={e => updateDadosFuncionario('cargo', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: Auxiliar de Secretaria"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
            <input
              type="text"
              value={formData.dadosFuncionario.departamento || ''}
              onChange={e => updateDadosFuncionario('departamento', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: Administrativo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registro Profissional</label>
            <input
              type="text"
              value={formData.dadosFuncionario.registroProfissional || ''}
              onChange={e => updateDadosFuncionario('registroProfissional', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: MEC, OAB, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salário Mensal (R$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.dadosFuncionario.salario || ''}
              onChange={e => updateDadosFuncionario('salario', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: 3500.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Carga Horária Semanal (Horas)</label>
            <input
              type="number"
              value={formData.dadosFuncionario.cargaHoraria || ''}
              onChange={e => updateDadosFuncionario('cargaHoraria', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: 40"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão</label>
            <input
              type="date"
              value={formData.dadosFuncionario.dataAdmissao || ''}
              onChange={e => updateDadosFuncionario('dataAdmissao', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Demissão (se houver)</label>
            <input
              type="date"
              value={formData.dadosFuncionario.dataDemissao || ''}
              onChange={e => updateDadosFuncionario('dataDemissao', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Dados de Pagamento & Bancários */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <h4 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <span className="text-xl">💳</span> Dados de Pagamento & Bancários
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
            <input
              type="text"
              value={formData.dadosFuncionario.banco || ''}
              onChange={e => updateDadosFuncionario('banco', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: Banco do Brasil"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Agência</label>
            <input
              type="text"
              value={formData.dadosFuncionario.agencia || ''}
              onChange={e => updateDadosFuncionario('agencia', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: 1234-5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conta Bancária</label>
            <input
              type="text"
              value={formData.dadosFuncionario.conta || ''}
              onChange={e => updateDadosFuncionario('conta', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: 56789-0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Conta</label>
            <select
              value={formData.dadosFuncionario.tipoConta || 'corrente'}
              onChange={e => updateDadosFuncionario('tipoConta', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="corrente">Conta Corrente</option>
              <option value="poupanca">Conta Poupança</option>
              <option value="salario">Conta Salário</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Chave Pix</label>
            <select
              value={formData.dadosFuncionario.tipoChavePix || 'cpf'}
              onChange={e => updateDadosFuncionario('tipoChavePix', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="email">E-mail</option>
              <option value="celular">Celular</option>
              <option value="aleatoria">Chave Aleatória</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chave Pix</label>
            <input
              type="text"
              value={formData.dadosFuncionario.chavePix || ''}
              onChange={e => updateDadosFuncionario('chavePix', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: pix@csm.edu.br"
            />
          </div>
        </div>
      </div>

      {/* 3. Controle de Férias & Observações */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <h4 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
          <span className="text-xl">📅</span> Controle de Férias & Observações
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Início das Férias Programadas</label>
            <input
              type="date"
              value={formData.dadosFuncionario.feriasProximasInicio || ''}
              onChange={e => updateDadosFuncionario('feriasProximasInicio', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fim das Férias Programadas</label>
            <input
              type="date"
              value={formData.dadosFuncionario.feriasProximasFim || ''}
              onChange={e => updateDadosFuncionario('feriasProximasFim', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Último Período Aquisitivo de Férias</label>
            <input
              type="text"
              value={formData.dadosFuncionario.feriasUltimoPeriodo || ''}
              onChange={e => updateDadosFuncionario('feriasUltimoPeriodo', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Ex: 2024/2025"
            />
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações do Departamento Pessoal</label>
            <textarea
              value={formData.dadosFuncionario.observacoes || ''}
              onChange={e => updateDadosFuncionario('observacoes', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
              placeholder="Registro livre para observações internas, anotações de ocorrências ou feedback."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

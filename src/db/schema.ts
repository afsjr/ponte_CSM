import { pgTable, uuid, varchar, text, timestamp, pgEnum, boolean, integer, jsonb } from "drizzle-orm/pg-core";

// --- ENUMS ---
export const situacaoPessoaEnum = pgEnum('situacao_pessoa', ['ativo', 'inativo', 'suspenso', 'transferido', 'formado', 'desistente']);
export const generoEnum = pgEnum('genero', ['masculino', 'feminino', 'outro', 'nao_informado']);
export const estadoCivilEnum = pgEnum('estado_civil', ['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel', 'separado']);
export const tipoClassificacaoEnum = pgEnum('tipo_classificacao', ['aluno', 'funcionario', 'responsavel', 'interessado', 'fornecedor']);
export const tipoContatoEnum = pgEnum('tipo_contato', ['celular', 'telefone_fixo', 'email', 'whatsapp']);
export const tipoContaBancariaEnum = pgEnum('tipo_conta_bancaria', ['corrente', 'poupanca', 'salario']);
export const tipoChavePixEnum = pgEnum('tipo_chave_pix', ['cpf', 'cnpj', 'email', 'celular', 'aleatoria']);
export const turnoEnum = pgEnum('turno', ['manha', 'tarde', 'noite', 'integral']);
export const statusMatriculaEnum = pgEnum('status_matricula', ['ativo', 'trancado', 'cancelado', 'concluido', 'transferido']);
export const motivoSaidaEnum = pgEnum('motivo_saida', ['desistencia', 'inadimplencia', 'transferencia', 'conclusao', 'expulsao', 'outro']);
export const tipoPeriodoEnum = pgEnum('tipo_periodo', ['bimestre', 'trimestre', 'semestre', 'modulo']);
export const tipoAvaliacaoEnum = pgEnum('tipo_avaliacao', ['prova', 'trabalho', 'seminario', 'recuperacao', 'participacao', 'outro']);
export const situacaoPeriodoEnum = pgEnum('situacao_periodo', ['aprovado', 'reprovado', 'recuperacao', 'em_andamento']);
export const statusContratoEnum = pgEnum('status_contrato', ['rascunho', 'ativo', 'encerrado', 'cancelado', 'renovado']);
export const tipoDocumentoGeradoEnum = pgEnum('tipo_documento_gerado', ['declaracao_matricula', 'boletim', 'historico_escolar', 'declaracao_transferencia', 'declaracao_conclusao']);
export const acaoAuditEnum = pgEnum('acao_audit', ['insert', 'update', 'delete']);
export const situacaoTurmaEnum = pgEnum('situacao_turma', ['aberta', 'em_andamento', 'encerrada', 'cancelada']);

// --- ENUMS BNCC e HORÁRIOS ---
export const tipoBaseEnum = pgEnum('tipo_base', ['basica', 'complementar', 'tecnica', 'livre']);
export const formaAvaliacaoEnum = pgEnum('forma_avaliacao', ['numerica', 'conceitual', 'mista', 'sem_avaliacao']);
export const diaSemanaEnum = pgEnum('dia_semana', ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']);
export const tipoEventoCalendarioEnum = pgEnum('tipo_evento_calendario', ['feriado', 'reuniao_pais', 'conselho_classe', 'prova', 'evento_escolar', 'outro']);

// --- CORE TABLES ---
export const pessoa = pgTable('pessoa', {
  id: uuid('id').defaultRandom().primaryKey(),
  nomeCompleto: varchar('nome_completo', { length: 255 }).notNull(),
  cpf: varchar('cpf', { length: 14 }).unique(),
  rg: varchar('rg', { length: 20 }),
  orgaoExpedidorRg: varchar('orgao_expedidor_rg', { length: 20 }),
  dataExpedicaoRg: timestamp('data_expedicao_rg', { mode: 'date' }),
  dataNascimento: timestamp('data_nascimento', { mode: 'date' }),
  cidadeNatal: varchar('cidade_natal', { length: 100 }),
  nacionalidade: varchar('nacionalidade', { length: 100 }).default('Brasileira'),
  estrangeiro: boolean('estrangeiro').default(false),
  genero: generoEnum('genero').default('nao_informado'),
  estadoCivil: estadoCivilEnum('estado_civil').default('solteiro'),
  situacao: situacaoPessoaEnum('situacao').default('ativo').notNull(),
  necessidadeEspecial: boolean('necessidade_especial').default(false),
  
  // Auditoria
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pessoaClassificacao = pgTable('pessoa_classificacao', {
  id: uuid('id').defaultRandom().primaryKey(),
  pessoaId: uuid('pessoa_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull(),
  tipo: tipoClassificacaoEnum('tipo').notNull(),
  
  // Auditoria
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const anexo = pgTable('anexo', {
  id: uuid('id').defaultRandom().primaryKey(),
  pessoaId: uuid('pessoa_id').references(() => pessoa.id, { onDelete: 'cascade' }),
  entidadeRefId: uuid('entidade_ref_id'), // ID genérico para usar com outras tabelas
  entidadeRefTipo: varchar('entidade_ref_tipo', { length: 50 }),
  titulo: varchar('titulo', { length: 150 }).notNull(),
  descricao: text('descricao'),
  urlArquivo: varchar('url_arquivo', { length: 500 }).notNull(),
  tipoArquivo: varchar('tipo_arquivo', { length: 50 }),
  tamanhoBytes: integer('tamanho_bytes'),
  
  // Auditoria
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: uuid('created_by'), // referenciaria auth.users se estivéssemos usando RLS completo com auth
});

export const contato = pgTable('contato', {
  id: uuid('id').defaultRandom().primaryKey(),
  pessoaId: uuid('pessoa_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull(),
  tipo: tipoContatoEnum('tipo').notNull(),
  valor: varchar('valor', { length: 150 }).notNull(),
  principal: boolean('principal').default(false),
  observacao: text('observacao'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const endereco = pgTable('endereco', {
  id: uuid('id').defaultRandom().primaryKey(),
  pessoaId: uuid('pessoa_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull(),
  cep: varchar('cep', { length: 9 }).notNull(),
  logradouro: varchar('logradouro', { length: 255 }).notNull(),
  numero: varchar('numero', { length: 20 }).notNull(),
  complemento: varchar('complemento', { length: 100 }),
  bairro: varchar('bairro', { length: 100 }).notNull(),
  cidade: varchar('cidade', { length: 100 }).notNull(),
  uf: varchar('uf', { length: 2 }).notNull(),
  principal: boolean('principal').default(true),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- DADOS COMPLEMENTARES ---
export const dadosAluno = pgTable('dados_aluno', {
  id: uuid('id').defaultRandom().primaryKey(),
  pessoaId: uuid('pessoa_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull().unique(),
  numeroMatricula: varchar('numero_matricula', { length: 50 }),
  ra: varchar('ra', { length: 50 }),
  codigoBarras: varchar('codigo_barras', { length: 100 }),
  loginPortal: varchar('login_portal', { length: 100 }),
  senhaPortalHash: varchar('senha_portal_hash', { length: 255 }),
  cartaoCatraca: varchar('cartao_catraca', { length: 100 }),
  permitirBiblioteca: boolean('permitir_biblioteca').default(true).notNull(),
  turmaAtualId: uuid('turma_atual_id').references(() => turma.id, { onDelete: 'set null' }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const dadosFuncionario = pgTable('dados_funcionario', {
  id: uuid('id').defaultRandom().primaryKey(),
  pessoaId: uuid('pessoa_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull().unique(),
  cargo: varchar('cargo', { length: 100 }),
  departamento: varchar('departamento', { length: 100 }),
  dataAdmissao: timestamp('data_admissao', { mode: 'date' }),
  dataDemissao: timestamp('data_demissao', { mode: 'date' }),
  salario: integer('salario'), // em centavos (ex: 350000 para R$ 3.500,00)
  cargaHoraria: integer('carga_horaria'), // em horas semanais/mensais
  registroProfissional: varchar('registro_profissional', { length: 100 }),
  
  // Novos Campos Contratuais, Bancários, Férias e Observações
  observacoes: text('observacoes'),
  banco: varchar('banco', { length: 100 }),
  agencia: varchar('agencia', { length: 20 }),
  conta: varchar('conta', { length: 50 }),
  tipoConta: tipoContaBancariaEnum('tipo_conta'),
  chavePix: varchar('chave_pix', { length: 150 }),
  tipoChavePix: tipoChavePixEnum('tipo_chave_pix'),
  feriasProximasInicio: timestamp('ferias_proximas_inicio', { mode: 'date' }),
  feriasProximasFim: timestamp('ferias_proximas_fim', { mode: 'date' }),
  feriasUltimoPeriodo: varchar('ferias_ultimo_periodo', { length: 50 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});


// --- PEDAGÓGICO ---
export const nivelEnsino = pgTable('nivel_ensino', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull(),
  descricao: text('descricao'),
  ehInfantil: boolean('eh_infantil').default(false),
  icone: varchar('icone', { length: 50 }),
  ordemExibicao: integer('ordem_exibicao').default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const serie = pgTable('serie', {
  id: uuid('id').defaultRandom().primaryKey(),
  nivelEnsinoId: uuid('nivel_ensino_id').references(() => nivelEnsino.id, { onDelete: 'cascade' }).notNull(),
  nome: varchar('nome', { length: 100 }).notNull(),
  ordemExibicao: integer('ordem_exibicao').default(0),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const disciplina = pgTable('disciplina', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull(),
  sigla: varchar('sigla', { length: 20 }),
  descricao: text('descricao'),
  tipoBase: tipoBaseEnum('tipo_base').default('basica').notNull(),
  formaAvaliacao: formaAvaliacaoEnum('forma_avaliacao').default('numerica').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const gradeCurricular = pgTable('grade_curricular', {
  id: uuid('id').defaultRandom().primaryKey(),
  serieId: uuid('serie_id').references(() => serie.id, { onDelete: 'cascade' }).notNull(),
  disciplinaId: uuid('disciplina_id').references(() => disciplina.id, { onDelete: 'cascade' }).notNull(),
  cargaHorariaSemanal: integer('carga_horaria_semanal').default(1).notNull(),
  aulasPorSemana: integer('aulas_por_semana').default(1).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const funcionarioHabilitacao = pgTable('funcionario_habilitacao', {
  id: uuid('id').defaultRandom().primaryKey(),
  funcionarioId: uuid('funcionario_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull(),
  disciplinaId: uuid('disciplina_id').references(() => disciplina.id, { onDelete: 'cascade' }).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const anoLetivo = pgTable('ano_letivo', {
  id: uuid('id').defaultRandom().primaryKey(),
  ano: integer('ano').notNull(),
  dataInicio: timestamp('data_inicio', { mode: 'date' }).notNull(),
  dataFim: timestamp('data_fim', { mode: 'date' }).notNull(),
  ativo: boolean('ativo').default(true),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const sala = pgTable('sala', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull(),
  capacidade: integer('capacidade').notNull(),
  localizacao: varchar('localizacao', { length: 255 }),
  observacoes: text('observacoes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const turma = pgTable('turma', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull(),
  anoLetivoId: uuid('ano_letivo_id').references(() => anoLetivo.id, { onDelete: 'restrict' }).notNull(),
  serieId: uuid('serie_id').references(() => serie.id, { onDelete: 'restrict' }),
  turno: turnoEnum('turno').notNull(),
  capacidadeMaxima: integer('capacidade_maxima').default(30),
  situacao: situacaoTurmaEnum('situacao').default('aberta').notNull(),
  salaId: uuid('sala_id').references(() => sala.id, { onDelete: 'set null' }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const quadroHorario = pgTable('quadro_horario', {
  id: uuid('id').defaultRandom().primaryKey(),
  turmaId: uuid('turma_id').references(() => turma.id, { onDelete: 'cascade' }).notNull(),
  disciplinaId: uuid('disciplina_id').references(() => disciplina.id, { onDelete: 'cascade' }).notNull(),
  diaSemana: diaSemanaEnum('dia_semana').notNull(),
  quantidadeAulas: integer('quantidade_aulas').default(1).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const turmaDocente = pgTable('turma_docente', {
  id: uuid('id').defaultRandom().primaryKey(),
  turmaId: uuid('turma_id').references(() => turma.id, { onDelete: 'cascade' }).notNull(),
  disciplinaId: uuid('disciplina_id').references(() => disciplina.id, { onDelete: 'restrict' }).notNull(),
  funcionarioId: uuid('funcionario_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
  titular: boolean('titular').default(true),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- SECRETARIA ---

export const matricula = pgTable('matricula', {
  id: uuid('id').defaultRandom().primaryKey(),
  alunoId: uuid('aluno_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
  turmaId: uuid('turma_id').references(() => turma.id, { onDelete: 'restrict' }).notNull(),
  anoLetivoId: uuid('ano_letivo_id').references(() => anoLetivo.id, { onDelete: 'restrict' }).notNull(),
  numeroMatricula: varchar('numero_matricula', { length: 50 }).notNull().unique(),
  dataMatricula: timestamp('data_matricula', { mode: 'date' }).defaultNow().notNull(),
  status: statusMatriculaEnum('status').default('ativo').notNull(),
  dataSaida: timestamp('data_saida', { mode: 'date' }),
  motivoSaida: motivoSaidaEnum('motivo_saida'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ocorrenciaAluno = pgTable('ocorrencia_aluno', {
  id: uuid('id').defaultRandom().primaryKey(),
  alunoId: uuid('aluno_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
  data: timestamp('data', { mode: 'date' }).defaultNow().notNull(),
  titulo: varchar('titulo', { length: 150 }).notNull(),
  descricao: text('descricao').notNull(),
  providencia: text('providencia'),
  cadastradoPorId: uuid('cadastrado_por_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const historicoEscolar = pgTable('historico_escolar', {
  id: uuid('id').defaultRandom().primaryKey(),
  alunoId: uuid('aluno_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
  anoLetivoId: uuid('ano_letivo_id').references(() => anoLetivo.id, { onDelete: 'restrict' }).notNull(),
  serieId: uuid('serie_id').references(() => serie.id, { onDelete: 'restrict' }).notNull(),
  mediaFinal: integer('media_final').notNull(),
  frequenciaFinal: integer('frequencia_final').notNull(),
  resultado: varchar('resultado', { length: 50 }).notNull(),
  disciplinasNotas: jsonb('disciplinas_notas').notNull(),
  observacoes: text('observacoes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- AVALIAÇÃO E NOTAS ---
export const periodoAvaliativo = pgTable('periodo_avaliativo', {
  id: uuid('id').defaultRandom().primaryKey(),
  anoLetivoId: uuid('ano_letivo_id').references(() => anoLetivo.id, { onDelete: 'restrict' }).notNull(),
  nome: varchar('nome', { length: 100 }).notNull(),
  numero: integer('numero').notNull(),
  dataInicio: timestamp('data_inicio', { mode: 'date' }).notNull(),
  dataFim: timestamp('data_fim', { mode: 'date' }).notNull(),
  tipo: tipoPeriodoEnum('tipo').notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const avaliacao = pgTable('avaliacao', {
  id: uuid('id').defaultRandom().primaryKey(),
  turmaId: uuid('turma_id').references(() => turma.id, { onDelete: 'restrict' }).notNull(),
  disciplinaId: uuid('disciplina_id').references(() => disciplina.id, { onDelete: 'restrict' }).notNull(),
  periodoAvaliativoId: uuid('periodo_avaliativo_id').references(() => periodoAvaliativo.id, { onDelete: 'restrict' }).notNull(),
  descricao: varchar('descricao', { length: 255 }).notNull(),
  peso: integer('peso').default(1).notNull(), // Em inteiros (1, 2) ou decimal? Drizzle decimal exige precision/scale
  valorMaximo: integer('valor_maximo').notNull(), // Salvaremos valores * 10 ou * 100 para evitar float se possível. O SDD diz Decimal, usarei integer e divideremos por 10 no app, ou usaremos real/numeric
  dataAplicacao: timestamp('data_aplicacao', { mode: 'date' }).notNull(),
  tipo: tipoAvaliacaoEnum('tipo').notNull(),
  ehRecuperacao: boolean('eh_recuperacao').default(false),
  ehRecuperacaoFinal: boolean('eh_recuperacao_final').default(false),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const nota = pgTable('nota', {
  id: uuid('id').defaultRandom().primaryKey(),
  avaliacaoId: uuid('avaliacao_id').references(() => avaliacao.id, { onDelete: 'cascade' }).notNull(),
  matriculaId: uuid('matricula_id').references(() => matricula.id, { onDelete: 'cascade' }).notNull(),
  valor: integer('valor'), // Valor real * 100. Opcional para Educação Infantil (Avaliação Conceitual)
  observacao: text('observacao'),
  lancadaEm: timestamp('lancada_em').defaultNow().notNull(),
  lancadaPorId: uuid('lancada_por_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- DIÁRIO E FREQUÊNCIA ---
export const diarioClasse = pgTable('diario_classe', {
  id: uuid('id').defaultRandom().primaryKey(),
  turmaId: uuid('turma_id').references(() => turma.id, { onDelete: 'restrict' }).notNull(),
  disciplinaId: uuid('disciplina_id').references(() => disciplina.id, { onDelete: 'restrict' }).notNull(),
  docenteId: uuid('docente_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
  data: timestamp('data', { mode: 'date' }).notNull(),
  conteudoMinistrado: text('conteudo_ministrado').notNull(),
  observacoes: text('observacoes'),
  aulasDadas: integer('aulas_dadas').default(1).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const frequenciaAluno = pgTable('frequencia_aluno', {
  id: uuid('id').defaultRandom().primaryKey(),
  diarioClasseId: uuid('diario_classe_id').references(() => diarioClasse.id, { onDelete: 'cascade' }).notNull(),
  matriculaId: uuid('matricula_id').references(() => matricula.id, { onDelete: 'cascade' }).notNull(),
  presente: boolean('presente').default(true).notNull(),
  justificativa: text('justificativa'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// --- NOVAS TABELAS (CONTRATOS, DOCUMENTOS, AUDITORIA) ---
export const contratoEscolar = pgTable('contrato_escolar', {
  id: uuid('id').defaultRandom().primaryKey(),
  alunoId: uuid('aluno_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
  responsavelFinanceiroId: uuid('responsavel_financeiro_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
  anoLetivoId: uuid('ano_letivo_id').references(() => anoLetivo.id, { onDelete: 'restrict' }).notNull(),
  dataAssinatura: timestamp('data_assinatura', { mode: 'date' }),
  dataVigenciaInicio: timestamp('data_vigencia_inicio', { mode: 'date' }).notNull(),
  dataVigenciaFim: timestamp('data_vigencia_fim', { mode: 'date' }).notNull(),
  status: statusContratoEnum('status').default('rascunho').notNull(),
  valorMensalidade: integer('valor_mensalidade').notNull(), // em centavos (ex: 75000 para R$ 750,00)
  percentualDesconto: integer('percentual_desconto').default(0).notNull(), // valor de 0 a 100
  observacoes: text('observacoes'),
  urlDocumentoAssinado: varchar('url_documento_assinado', { length: 500 }),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documentoGerado = pgTable('documento_gerado', {
  id: uuid('id').defaultRandom().primaryKey(),
  pessoaId: uuid('pessoa_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
  tipo: tipoDocumentoGeradoEnum('tipo').notNull(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  urlArquivo: varchar('url_arquivo', { length: 500 }).notNull(),
  hashVerificacao: varchar('hash_verificacao', { length: 64 }).notNull(), // hash SHA256 único
  geradoEm: timestamp('gerado_em').defaultNow().notNull(),
  geradoPorId: uuid('gerado_por_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
});

export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  usuarioId: uuid('usuario_id').references(() => pessoa.id, { onDelete: 'restrict' }), // null se for sistema/anonimo
  acao: acaoAuditEnum('acao').notNull(),
  tabela: varchar('tabela', { length: 100 }).notNull(),
  registroId: uuid('registro_id').notNull(),
  dadosAntigos: jsonb('dados_antigos'),
  motivo: text('motivo'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- MÓDULO AEE (Atendimento Educacional Especializado) ---
export const aeeProntuario = pgTable('aee_prontuario', {
  id: uuid('id').defaultRandom().primaryKey(),
  alunoId: uuid('aluno_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull().unique(),
  diagnostico: text('diagnostico'),
  medicacoesEmUso: text('medicacoes_em_uso'),
  aspectosPositivos: text('aspectos_positivos'),
  dificuldades: text('dificuldades'),
  adaptacoesAtividades: text('adaptacoes_atividades'),
  relatoriosTexto: text('relatorios_texto'), // Campo longo solicitado
  horarioAtendimento: varchar('horario_atendimento', { length: 255 }).default('Segunda a Sexta, das 7:30h às 12:00h'), // Default solicitado
  feedbackReunioes: text('feedback_reunioes'),
  
  // Auditoria
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Enums para AEE
export const papelEvolucaoAeeEnum = pgEnum('papel_evolucao_aee', ['Professor', 'Equipe AEE', 'Família', 'Profissional de Saúde', 'Coordenação', 'Outros']);
export const statusMetaPeiEnum = pgEnum('status_meta_pei', ['nao_iniciado', 'em_progresso', 'alcancada', 'nao_alcancada']);
export const areaMetaPeiEnum = pgEnum('area_meta_pei', ['pedagogica', 'social', 'motora', 'tecnica', 'autonomia']);

export const aeeProntuarioEvolucao = pgTable('aee_prontuario_evolucao', {
  id: uuid('id').defaultRandom().primaryKey(),
  prontuarioId: uuid('prontuario_id').references(() => aeeProntuario.id, { onDelete: 'cascade' }).notNull(),
  autorId: uuid('autor_id').references(() => pessoa.id, { onDelete: 'set null' }), // set null pq a conta pode ser deletada, mas o prontuario não perde histórico
  papel: papelEvolucaoAeeEnum('papel').notNull(),
  descricao: text('descricao').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const aeePei = pgTable('aee_pei', {
  id: uuid('id').defaultRandom().primaryKey(),
  alunoId: uuid('aluno_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull(),
  anoLetivoId: uuid('ano_letivo_id').references(() => anoLetivo.id, { onDelete: 'restrict' }).notNull(),
  objetivosGerais: text('objetivos_gerais'),
  recursosNecessarios: text('recursos_necessarios'),
  adaptacoesLaboratorio: text('adaptacoes_laboratorio'), // Especifico para Ensino Tecnico
  dataInicio: timestamp('data_inicio').notNull(),
  dataFim: timestamp('data_fim').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const aeePeiMeta = pgTable('aee_pei_meta', {
  id: uuid('id').defaultRandom().primaryKey(),
  peiId: uuid('pei_id').references(() => aeePei.id, { onDelete: 'cascade' }).notNull(),
  area: areaMetaPeiEnum('area').notNull(),
  descricaoMeta: text('descricao_meta').notNull(),
  estrategiasPedagogicas: text('estrategias_pedagogicas'),
  status: statusMetaPeiEnum('status').default('nao_iniciado').notNull(),
  parecerFinal: text('parecer_final'),
});

export const aeeAtendimento = pgTable('aee_atendimento', {
  id: uuid('id').defaultRandom().primaryKey(),
  alunoId: uuid('aluno_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull(),
  profissionalId: uuid('profissional_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
  dataAtendimento: timestamp('data_atendimento').defaultNow().notNull(),
  duracaoMinutos: integer('duracao_minutos').default(50).notNull(),
  registroSessao: text('registro_sessao').notNull(),
  recursosUtilizados: text('recursos_utilizados'),
});

export const aeeDocumento = pgTable('aee_documento', {
  id: uuid('id').defaultRandom().primaryKey(),
  alunoId: uuid('aluno_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull(),
  tipoDocumento: varchar('tipo_documento', { length: 100 }).notNull(),
  profissionalEmissor: varchar('profissional_emissor', { length: 255 }).notNull(),
  registroProfissional: varchar('registro_profissional', { length: 50 }),
  urlArquivo: varchar('url_arquivo', { length: 500 }).notNull(),
  dataEmissao: timestamp('data_emissao'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// --- PORTAL DO RESPONSÁVEL E MURAL DE AVISOS ---
export const vinculoResponsavelAluno = pgTable('vinculo_responsavel_aluno', {
  id: uuid('id').defaultRandom().primaryKey(),
  responsavelId: uuid('responsavel_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
  alunoId: uuid('aluno_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull(),
  grauParentesco: varchar('grau_parentesco', { length: 50 }).notNull(),
  responsavelFinanceiro: boolean('responsavel_financeiro').default(false).notNull(),
  responsavelPedagogico: boolean('responsavel_pedagogico').default(false).notNull(),
  autorizadoRetirada: boolean('autorizado_retirada').default(false).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const muralAviso = pgTable('mural_aviso', {
  id: uuid('id').defaultRandom().primaryKey(),
  titulo: varchar('titulo', { length: 255 }).notNull(),
  conteudo: text('conteudo').notNull(),
  dataPublicacao: timestamp('data_publicacao').defaultNow().notNull(),
  destinatarioTipo: varchar('destinatario_tipo', { length: 50 }).notNull(), // 'geral', 'turma', 'serie', 'individual'
  turmaId: uuid('turma_id').references(() => turma.id, { onDelete: 'cascade' }),
  serieId: uuid('serie_id').references(() => serie.id, { onDelete: 'cascade' }),
  alunoId: uuid('aluno_id').references(() => pessoa.id, { onDelete: 'cascade' }),
  criadoPorId: uuid('criado_por_id').references(() => pessoa.id, { onDelete: 'restrict' }).notNull(),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const avisoCiente = pgTable('aviso_ciente', {
  id: uuid('id').defaultRandom().primaryKey(),
  avisoId: uuid('aviso_id').references(() => muralAviso.id, { onDelete: 'cascade' }).notNull(),
  responsavelId: uuid('responsavel_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull(),
  alunoId: uuid('aluno_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull(),
  cienteEm: timestamp('ciente_em').defaultNow().notNull(),
});

export const notasBoletim = pgTable('notas_boletim', {
  id: uuid('id').defaultRandom().primaryKey(),
  alunoId: uuid('aluno_id').references(() => pessoa.id, { onDelete: 'cascade' }).notNull(),
  anoLetivoId: uuid('ano_letivo_id').references(() => anoLetivo.id, { onDelete: 'cascade' }).notNull(),
  disciplinaId: uuid('disciplina_id').references(() => disciplina.id, { onDelete: 'cascade' }).notNull(),
  trimestre1: integer('trimestre1'), // nota * 100 (ex: 850 para 8.5)
  trimestre2: integer('trimestre2'),
  trimestre3: integer('trimestre3'),
  mediaFinal: integer('media_final'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const calendarioPedagogico = pgTable('calendario_pedagogico', {
  id: uuid('id').defaultRandom().primaryKey(),
  anoLetivoId: uuid('ano_letivo_id').references(() => anoLetivo.id, { onDelete: 'cascade' }).notNull(),
  titulo: text('titulo').notNull(),
  descricao: text('descricao'),
  dataInicio: timestamp('data_inicio').notNull(),
  dataFim: timestamp('data_fim').notNull(),
  tipoEvento: tipoEventoCalendarioEnum('tipo_evento').default('feriado').notNull(),
  corHex: varchar('cor_hex', { length: 7 }).default('#4A90E2'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

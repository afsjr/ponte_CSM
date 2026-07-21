# Delta do Modelo de Dados: Módulos Financeiro e RH

> Identificador: `001-modulos-financeiro-rh`
> Data: `2026-07-20`

## 1. Novos Enums
- `tipo_plano_conta`: `RECEITA`, `DESPESA`
- `status_titulo`: `PENDENTE`, `PAGO`, `RECEBIDO`, `ATRASADO`, `CANCELADO`
- `tipo_ocorrencia_rh`: `ADVERTENCIA_VERBAL`, `ADVERTENCIA_ESCRITA`, `SUSPENSAO`, `PROMOCAO`, `GRATIFICACAO`, `ELOGIO`
- `status_ferias`: `PROGRAMADA`, `EM_GOZO`, `CONCLUIDA`, `CANCELADA`

## 2. Novas Tabelas

### 2.1. `plano_contas`
- `id`: uuid (PK)
- `codigo`: varchar(20) (ex: "1.1.01")
- `descricao`: varchar(255)
- `tipo`: enum `tipo_plano_conta`
- `created_at`: timestamp

### 2.2. `centro_custo`
- `id`: uuid (PK)
- `nome`: varchar(100) (ex: "Educação Infantil", "Ensino Fundamental", "Ensino Técnico", "Administrativo")
- `descricao`: text

### 2.3. `titulo_financeiro`
- `id`: uuid (PK)
- `tipo`: enum `RECEITA` / `DESPESA`
- `descricao`: varchar(255)
- `pessoa_id`: uuid (FK `pessoa.id`, nulo se geral)
- `plano_conta_id`: uuid (FK `plano_contas.id`)
- `centro_custo_id`: uuid (FK `centro_custo.id`)
- `valor_original`: numeric(10,2)
- `valor_pago`: numeric(10,2) (default 0.00)
- `data_vencimento`: date
- `data_pagamento`: date (nullable)
- `status`: enum `status_titulo`
- `forma_pagamento`: varchar(50) (nullable)
- `created_at`: timestamp

### 2.4. `rh_dossie_colaborador`
- `id`: uuid (PK)
- `pessoa_id`: uuid (FK `pessoa.id`, unique)
- `cargo`: varchar(100)
- `salario_base`: numeric(10,2)
- `jornada_semanal_horas`: integer
- `dados_bancarios`: jsonb (banco, agencia, conta, chave_pix)
- `data_admissao`: date
- `created_at`: timestamp

### 2.5. `rh_documento_colaborador`
- `id`: uuid (PK)
- `pessoa_id`: uuid (FK `pessoa.id`)
- `tipo_documento`: varchar(50) (RG, CPF, DIPLOMA, ASO, CONTRATO)
- `url_storage`: text
- `data_validade`: date (nullable)
- `created_at`: timestamp

### 2.6. `rh_ferias`
- `id`: uuid (PK)
- `pessoa_id`: uuid (FK `pessoa.id`)
- `periodo_aquisitivo_inicio`: date
- `periodo_aquisitivo_fim`: date
- `data_inicio_gozo`: date
- `data_fim_gozo`: date
- `status`: enum `status_ferias`
- `created_at`: timestamp

### 2.7. `rh_ocorrencia_funcional`
- `id`: uuid (PK)
- `pessoa_id`: uuid (FK `pessoa.id`)
- `tipo`: enum `tipo_ocorrencia_rh`
- `descricao`: text
- `valor_impacto`: numeric(10,2) (nullable, para gratificação/reajuste)
- `registrado_por`: uuid (FK `auth.users.id`)
- `created_at`: timestamp

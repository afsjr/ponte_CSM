CREATE TYPE "public"."estado_civil" AS ENUM('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel', 'separado');--> statement-breakpoint
CREATE TYPE "public"."genero" AS ENUM('masculino', 'feminino', 'outro', 'nao_informado');--> statement-breakpoint
CREATE TYPE "public"."situacao_pessoa" AS ENUM('ativo', 'inativo', 'suspenso', 'transferido', 'formado', 'desistente');--> statement-breakpoint
CREATE TYPE "public"."tipo_chave_pix" AS ENUM('cpf', 'cnpj', 'email', 'celular', 'aleatoria');--> statement-breakpoint
CREATE TYPE "public"."tipo_classificacao" AS ENUM('aluno', 'funcionario', 'responsavel', 'interessado', 'fornecedor');--> statement-breakpoint
CREATE TYPE "public"."tipo_conta_bancaria" AS ENUM('corrente', 'poupanca', 'salario');--> statement-breakpoint
CREATE TYPE "public"."tipo_contato" AS ENUM('celular', 'telefone_fixo', 'email', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."turno" AS ENUM('manha', 'tarde', 'noite', 'integral');--> statement-breakpoint
CREATE TABLE "anexo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pessoa_id" uuid,
	"entidade_ref_id" uuid,
	"entidade_ref_tipo" varchar(50),
	"titulo" varchar(150) NOT NULL,
	"descricao" text,
	"url_arquivo" varchar(500) NOT NULL,
	"tipo_arquivo" varchar(50),
	"tamanho_bytes" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "contato" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pessoa_id" uuid NOT NULL,
	"tipo" "tipo_contato" NOT NULL,
	"valor" varchar(150) NOT NULL,
	"principal" boolean DEFAULT false,
	"observacao" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disciplina" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(100) NOT NULL,
	"sigla" varchar(20),
	"descricao" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "endereco" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pessoa_id" uuid NOT NULL,
	"cep" varchar(9) NOT NULL,
	"logradouro" varchar(255) NOT NULL,
	"numero" varchar(20) NOT NULL,
	"complemento" varchar(100),
	"bairro" varchar(100) NOT NULL,
	"cidade" varchar(100) NOT NULL,
	"uf" varchar(2) NOT NULL,
	"principal" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nivel_ensino" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(100) NOT NULL,
	"descricao" text,
	"ordem_exibicao" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pessoa" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome_completo" varchar(255) NOT NULL,
	"cpf" varchar(14),
	"rg" varchar(20),
	"orgao_expedidor_rg" varchar(20),
	"data_expedicao_rg" timestamp,
	"data_nascimento" timestamp,
	"cidade_natal" varchar(100),
	"nacionalidade" varchar(100) DEFAULT 'Brasileira',
	"estrangeiro" boolean DEFAULT false,
	"genero" "genero" DEFAULT 'nao_informado',
	"estado_civil" "estado_civil" DEFAULT 'solteiro',
	"situacao" "situacao_pessoa" DEFAULT 'ativo' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pessoa_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "pessoa_classificacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pessoa_id" uuid NOT NULL,
	"tipo" "tipo_classificacao" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "serie" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nivel_ensino_id" uuid NOT NULL,
	"nome" varchar(100) NOT NULL,
	"ordem_exibicao" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "turma" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(100) NOT NULL,
	"serie_id" uuid,
	"turno" "turno" NOT NULL,
	"capacidade_maxima" integer DEFAULT 30,
	"ativa" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "anexo" ADD CONSTRAINT "anexo_pessoa_id_pessoa_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contato" ADD CONSTRAINT "contato_pessoa_id_pessoa_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endereco" ADD CONSTRAINT "endereco_pessoa_id_pessoa_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pessoa_classificacao" ADD CONSTRAINT "pessoa_classificacao_pessoa_id_pessoa_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "serie" ADD CONSTRAINT "serie_nivel_ensino_id_nivel_ensino_id_fk" FOREIGN KEY ("nivel_ensino_id") REFERENCES "public"."nivel_ensino"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turma" ADD CONSTRAINT "turma_serie_id_serie_id_fk" FOREIGN KEY ("serie_id") REFERENCES "public"."serie"("id") ON DELETE restrict ON UPDATE no action;
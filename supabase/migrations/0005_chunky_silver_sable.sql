CREATE TYPE "public"."acao_audit" AS ENUM('insert', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "public"."situacao_turma" AS ENUM('aberta', 'em_andamento', 'encerrada', 'cancelada');--> statement-breakpoint
CREATE TYPE "public"."status_contrato" AS ENUM('rascunho', 'ativo', 'encerrado', 'cancelado', 'renovado');--> statement-breakpoint
CREATE TYPE "public"."tipo_documento_gerado" AS ENUM('declaracao_matricula', 'boletim', 'historico_escolar', 'declaracao_transferencia', 'declaracao_conclusao');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"acao" "acao_audit" NOT NULL,
	"tabela" varchar(100) NOT NULL,
	"registro_id" uuid NOT NULL,
	"dados_antigos" jsonb,
	"motivo" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contrato_escolar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"responsavel_financeiro_id" uuid NOT NULL,
	"ano_letivo_id" uuid NOT NULL,
	"data_assinatura" timestamp,
	"data_vigencia_inicio" timestamp NOT NULL,
	"data_vigencia_fim" timestamp NOT NULL,
	"status" "status_contrato" DEFAULT 'rascunho' NOT NULL,
	"valor_mensalidade" integer NOT NULL,
	"percentual_desconto" integer DEFAULT 0 NOT NULL,
	"observacoes" text,
	"url_documento_assinado" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documento_gerado" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pessoa_id" uuid NOT NULL,
	"tipo" "tipo_documento_gerado" NOT NULL,
	"titulo" varchar(255) NOT NULL,
	"url_arquivo" varchar(500) NOT NULL,
	"hash_verificacao" varchar(64) NOT NULL,
	"gerado_em" timestamp DEFAULT now() NOT NULL,
	"gerado_por_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "turma" ADD COLUMN "ano_letivo_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "turma" ADD COLUMN "situacao" "situacao_turma" DEFAULT 'aberta' NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_usuario_id_pessoa_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrato_escolar" ADD CONSTRAINT "contrato_escolar_aluno_id_pessoa_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrato_escolar" ADD CONSTRAINT "contrato_escolar_responsavel_financeiro_id_pessoa_id_fk" FOREIGN KEY ("responsavel_financeiro_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contrato_escolar" ADD CONSTRAINT "contrato_escolar_ano_letivo_id_ano_letivo_id_fk" FOREIGN KEY ("ano_letivo_id") REFERENCES "public"."ano_letivo"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documento_gerado" ADD CONSTRAINT "documento_gerado_pessoa_id_pessoa_id_fk" FOREIGN KEY ("pessoa_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documento_gerado" ADD CONSTRAINT "documento_gerado_gerado_por_id_pessoa_id_fk" FOREIGN KEY ("gerado_por_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turma" ADD CONSTRAINT "turma_ano_letivo_id_ano_letivo_id_fk" FOREIGN KEY ("ano_letivo_id") REFERENCES "public"."ano_letivo"("id") ON DELETE restrict ON UPDATE no action;
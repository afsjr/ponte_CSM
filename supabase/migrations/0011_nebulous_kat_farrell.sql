CREATE TYPE "public"."area_meta_pei" AS ENUM('pedagogica', 'social', 'motora', 'tecnica', 'autonomia');--> statement-breakpoint
CREATE TYPE "public"."status_meta_pei" AS ENUM('nao_iniciado', 'em_progresso', 'alcancada', 'nao_alcancada');--> statement-breakpoint
CREATE TABLE "aee_atendimento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"profissional_id" uuid NOT NULL,
	"data_atendimento" timestamp DEFAULT now() NOT NULL,
	"duracao_minutos" integer DEFAULT 50 NOT NULL,
	"registro_sessao" text NOT NULL,
	"recursos_utilizados" text
);
--> statement-breakpoint
CREATE TABLE "aee_documento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"tipo_documento" varchar(100) NOT NULL,
	"profissional_emissor" varchar(255) NOT NULL,
	"registro_profissional" varchar(50),
	"url_arquivo" varchar(500) NOT NULL,
	"data_emissao" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aee_pei" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"ano_letivo_id" uuid NOT NULL,
	"objetivos_gerais" text,
	"recursos_necessarios" text,
	"adaptacoes_laboratorio" text,
	"data_inicio" timestamp NOT NULL,
	"data_fim" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aee_pei_meta" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pei_id" uuid NOT NULL,
	"area" "area_meta_pei" NOT NULL,
	"descricao_meta" text NOT NULL,
	"estrategias_pedagogicas" text,
	"status" "status_meta_pei" DEFAULT 'nao_iniciado' NOT NULL,
	"parecer_final" text
);
--> statement-breakpoint
ALTER TABLE "aee_atendimento" ADD CONSTRAINT "aee_atendimento_aluno_id_pessoa_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aee_atendimento" ADD CONSTRAINT "aee_atendimento_profissional_id_pessoa_id_fk" FOREIGN KEY ("profissional_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aee_documento" ADD CONSTRAINT "aee_documento_aluno_id_pessoa_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aee_pei" ADD CONSTRAINT "aee_pei_aluno_id_pessoa_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aee_pei" ADD CONSTRAINT "aee_pei_ano_letivo_id_ano_letivo_id_fk" FOREIGN KEY ("ano_letivo_id") REFERENCES "public"."ano_letivo"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aee_pei_meta" ADD CONSTRAINT "aee_pei_meta_pei_id_aee_pei_id_fk" FOREIGN KEY ("pei_id") REFERENCES "public"."aee_pei"("id") ON DELETE cascade ON UPDATE no action;
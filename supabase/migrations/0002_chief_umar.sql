CREATE TYPE "public"."motivo_saida" AS ENUM('desistencia', 'inadimplencia', 'transferencia', 'conclusao', 'expulsao', 'outro');--> statement-breakpoint
CREATE TYPE "public"."status_matricula" AS ENUM('ativo', 'trancado', 'cancelado', 'concluido', 'transferido');--> statement-breakpoint
CREATE TABLE "ano_letivo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ano" integer NOT NULL,
	"data_inicio" timestamp NOT NULL,
	"data_fim" timestamp NOT NULL,
	"ativo" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matricula" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"turma_id" uuid NOT NULL,
	"ano_letivo_id" uuid NOT NULL,
	"numero_matricula" varchar(50) NOT NULL,
	"data_matricula" timestamp DEFAULT now() NOT NULL,
	"status" "status_matricula" DEFAULT 'ativo' NOT NULL,
	"data_saida" timestamp,
	"motivo_saida" "motivo_saida",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "matricula_numero_matricula_unique" UNIQUE("numero_matricula")
);
--> statement-breakpoint
ALTER TABLE "matricula" ADD CONSTRAINT "matricula_aluno_id_pessoa_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matricula" ADD CONSTRAINT "matricula_turma_id_turma_id_fk" FOREIGN KEY ("turma_id") REFERENCES "public"."turma"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matricula" ADD CONSTRAINT "matricula_ano_letivo_id_ano_letivo_id_fk" FOREIGN KEY ("ano_letivo_id") REFERENCES "public"."ano_letivo"("id") ON DELETE restrict ON UPDATE no action;
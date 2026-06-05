CREATE TYPE "public"."dia_semana" AS ENUM('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo');--> statement-breakpoint
CREATE TYPE "public"."forma_avaliacao" AS ENUM('numerica', 'conceitual', 'mista', 'sem_avaliacao');--> statement-breakpoint
CREATE TYPE "public"."tipo_base" AS ENUM('basica', 'complementar', 'tecnica', 'livre');--> statement-breakpoint
CREATE TABLE "funcionario_habilitacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"funcionario_id" uuid NOT NULL,
	"disciplina_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quadro_horario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"turma_id" uuid NOT NULL,
	"disciplina_id" uuid NOT NULL,
	"dia_semana" "dia_semana" NOT NULL,
	"quantidade_aulas" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "disciplina" ADD COLUMN "tipo_base" "tipo_base" DEFAULT 'basica' NOT NULL;--> statement-breakpoint
ALTER TABLE "disciplina" ADD COLUMN "forma_avaliacao" "forma_avaliacao" DEFAULT 'numerica' NOT NULL;--> statement-breakpoint
ALTER TABLE "funcionario_habilitacao" ADD CONSTRAINT "funcionario_habilitacao_funcionario_id_pessoa_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funcionario_habilitacao" ADD CONSTRAINT "funcionario_habilitacao_disciplina_id_disciplina_id_fk" FOREIGN KEY ("disciplina_id") REFERENCES "public"."disciplina"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quadro_horario" ADD CONSTRAINT "quadro_horario_turma_id_turma_id_fk" FOREIGN KEY ("turma_id") REFERENCES "public"."turma"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quadro_horario" ADD CONSTRAINT "quadro_horario_disciplina_id_disciplina_id_fk" FOREIGN KEY ("disciplina_id") REFERENCES "public"."disciplina"("id") ON DELETE cascade ON UPDATE no action;
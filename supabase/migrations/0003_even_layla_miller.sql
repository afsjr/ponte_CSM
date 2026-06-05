CREATE TYPE "public"."situacao_periodo" AS ENUM('aprovado', 'reprovado', 'recuperacao', 'em_andamento');--> statement-breakpoint
CREATE TYPE "public"."tipo_avaliacao" AS ENUM('prova', 'trabalho', 'seminario', 'recuperacao', 'participacao', 'outro');--> statement-breakpoint
CREATE TYPE "public"."tipo_periodo" AS ENUM('bimestre', 'trimestre', 'semestre', 'modulo');--> statement-breakpoint
CREATE TABLE "avaliacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"turma_id" uuid NOT NULL,
	"disciplina_id" uuid NOT NULL,
	"periodo_avaliativo_id" uuid NOT NULL,
	"descricao" varchar(255) NOT NULL,
	"peso" integer DEFAULT 1 NOT NULL,
	"valor_maximo" integer NOT NULL,
	"data_aplicacao" timestamp NOT NULL,
	"tipo" "tipo_avaliacao" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diario_classe" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"turma_id" uuid NOT NULL,
	"disciplina_id" uuid NOT NULL,
	"docente_id" uuid NOT NULL,
	"data" timestamp NOT NULL,
	"conteudo_ministrado" text NOT NULL,
	"observacoes" text,
	"aulas_dadas" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "frequencia_aluno" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"diario_classe_id" uuid NOT NULL,
	"matricula_id" uuid NOT NULL,
	"presente" boolean DEFAULT true NOT NULL,
	"justificativa" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nota" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"avaliacao_id" uuid NOT NULL,
	"matricula_id" uuid NOT NULL,
	"valor" integer NOT NULL,
	"observacao" text,
	"lancada_em" timestamp DEFAULT now() NOT NULL,
	"lancada_por_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "periodo_avaliativo" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ano_letivo_id" uuid NOT NULL,
	"nome" varchar(100) NOT NULL,
	"numero" integer NOT NULL,
	"data_inicio" timestamp NOT NULL,
	"data_fim" timestamp NOT NULL,
	"tipo" "tipo_periodo" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "avaliacao" ADD CONSTRAINT "avaliacao_turma_id_turma_id_fk" FOREIGN KEY ("turma_id") REFERENCES "public"."turma"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avaliacao" ADD CONSTRAINT "avaliacao_disciplina_id_disciplina_id_fk" FOREIGN KEY ("disciplina_id") REFERENCES "public"."disciplina"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avaliacao" ADD CONSTRAINT "avaliacao_periodo_avaliativo_id_periodo_avaliativo_id_fk" FOREIGN KEY ("periodo_avaliativo_id") REFERENCES "public"."periodo_avaliativo"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diario_classe" ADD CONSTRAINT "diario_classe_turma_id_turma_id_fk" FOREIGN KEY ("turma_id") REFERENCES "public"."turma"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diario_classe" ADD CONSTRAINT "diario_classe_disciplina_id_disciplina_id_fk" FOREIGN KEY ("disciplina_id") REFERENCES "public"."disciplina"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diario_classe" ADD CONSTRAINT "diario_classe_docente_id_pessoa_id_fk" FOREIGN KEY ("docente_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frequencia_aluno" ADD CONSTRAINT "frequencia_aluno_diario_classe_id_diario_classe_id_fk" FOREIGN KEY ("diario_classe_id") REFERENCES "public"."diario_classe"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "frequencia_aluno" ADD CONSTRAINT "frequencia_aluno_matricula_id_matricula_id_fk" FOREIGN KEY ("matricula_id") REFERENCES "public"."matricula"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nota" ADD CONSTRAINT "nota_avaliacao_id_avaliacao_id_fk" FOREIGN KEY ("avaliacao_id") REFERENCES "public"."avaliacao"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nota" ADD CONSTRAINT "nota_matricula_id_matricula_id_fk" FOREIGN KEY ("matricula_id") REFERENCES "public"."matricula"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nota" ADD CONSTRAINT "nota_lancada_por_id_pessoa_id_fk" FOREIGN KEY ("lancada_por_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "periodo_avaliativo" ADD CONSTRAINT "periodo_avaliativo_ano_letivo_id_ano_letivo_id_fk" FOREIGN KEY ("ano_letivo_id") REFERENCES "public"."ano_letivo"("id") ON DELETE restrict ON UPDATE no action;
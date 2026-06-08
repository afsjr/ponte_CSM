CREATE TYPE "public"."tipo_evento_calendario" AS ENUM('feriado', 'reuniao_pais', 'conselho_classe', 'prova', 'evento_escolar', 'outro');--> statement-breakpoint
CREATE TABLE "calendario_pedagogico" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ano_letivo_id" uuid NOT NULL,
	"titulo" text NOT NULL,
	"descricao" text,
	"data_inicio" timestamp NOT NULL,
	"data_fim" timestamp NOT NULL,
	"tipo_evento" "tipo_evento_calendario" DEFAULT 'feriado' NOT NULL,
	"cor_hex" varchar(7) DEFAULT '#4A90E2',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notas_boletim" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"ano_letivo_id" uuid NOT NULL,
	"disciplina_id" uuid NOT NULL,
	"trimestre1" integer,
	"trimestre2" integer,
	"trimestre3" integer,
	"media_final" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "calendario_pedagogico" ADD CONSTRAINT "calendario_pedagogico_ano_letivo_id_ano_letivo_id_fk" FOREIGN KEY ("ano_letivo_id") REFERENCES "public"."ano_letivo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notas_boletim" ADD CONSTRAINT "notas_boletim_aluno_id_pessoa_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."pessoa"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notas_boletim" ADD CONSTRAINT "notas_boletim_ano_letivo_id_ano_letivo_id_fk" FOREIGN KEY ("ano_letivo_id") REFERENCES "public"."ano_letivo"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notas_boletim" ADD CONSTRAINT "notas_boletim_disciplina_id_disciplina_id_fk" FOREIGN KEY ("disciplina_id") REFERENCES "public"."disciplina"("id") ON DELETE cascade ON UPDATE no action;
CREATE TABLE "grade_curricular" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"serie_id" uuid NOT NULL,
	"disciplina_id" uuid NOT NULL,
	"carga_horaria_semanal" integer DEFAULT 1 NOT NULL,
	"aulas_por_semana" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sala" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(100) NOT NULL,
	"capacidade" integer NOT NULL,
	"localizacao" varchar(255),
	"observacoes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "turma" ADD COLUMN "sala_id" uuid;--> statement-breakpoint
ALTER TABLE "grade_curricular" ADD CONSTRAINT "grade_curricular_serie_id_serie_id_fk" FOREIGN KEY ("serie_id") REFERENCES "public"."serie"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grade_curricular" ADD CONSTRAINT "grade_curricular_disciplina_id_disciplina_id_fk" FOREIGN KEY ("disciplina_id") REFERENCES "public"."disciplina"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turma" ADD CONSTRAINT "turma_sala_id_sala_id_fk" FOREIGN KEY ("sala_id") REFERENCES "public"."sala"("id") ON DELETE set null ON UPDATE no action;
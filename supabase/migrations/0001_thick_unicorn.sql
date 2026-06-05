CREATE TABLE "turma_docente" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"turma_id" uuid NOT NULL,
	"disciplina_id" uuid NOT NULL,
	"funcionario_id" uuid NOT NULL,
	"titular" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "turma_docente" ADD CONSTRAINT "turma_docente_turma_id_turma_id_fk" FOREIGN KEY ("turma_id") REFERENCES "public"."turma"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turma_docente" ADD CONSTRAINT "turma_docente_disciplina_id_disciplina_id_fk" FOREIGN KEY ("disciplina_id") REFERENCES "public"."disciplina"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turma_docente" ADD CONSTRAINT "turma_docente_funcionario_id_pessoa_id_fk" FOREIGN KEY ("funcionario_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;
CREATE TYPE "public"."papel_evolucao_aee" AS ENUM('Professor', 'Equipe AEE', 'Família', 'Profissional de Saúde', 'Coordenação', 'Outros');--> statement-breakpoint
CREATE TABLE "aee_prontuario_evolucao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prontuario_id" uuid NOT NULL,
	"autor_id" uuid,
	"papel" "papel_evolucao_aee" NOT NULL,
	"descricao" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aee_prontuario_evolucao" ADD CONSTRAINT "aee_prontuario_evolucao_prontuario_id_aee_prontuario_id_fk" FOREIGN KEY ("prontuario_id") REFERENCES "public"."aee_prontuario"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aee_prontuario_evolucao" ADD CONSTRAINT "aee_prontuario_evolucao_autor_id_pessoa_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."pessoa"("id") ON DELETE set null ON UPDATE no action;
CREATE TABLE "historico_escolar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"ano_letivo_id" uuid NOT NULL,
	"serie_id" uuid NOT NULL,
	"media_final" integer NOT NULL,
	"frequencia_final" integer NOT NULL,
	"resultado" varchar(50) NOT NULL,
	"disciplinas_notas" jsonb NOT NULL,
	"observacoes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ocorrencia_aluno" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"aluno_id" uuid NOT NULL,
	"data" timestamp DEFAULT now() NOT NULL,
	"titulo" varchar(150) NOT NULL,
	"descricao" text NOT NULL,
	"providencia" text,
	"cadastrado_por_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "historico_escolar" ADD CONSTRAINT "historico_escolar_aluno_id_pessoa_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historico_escolar" ADD CONSTRAINT "historico_escolar_ano_letivo_id_ano_letivo_id_fk" FOREIGN KEY ("ano_letivo_id") REFERENCES "public"."ano_letivo"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historico_escolar" ADD CONSTRAINT "historico_escolar_serie_id_serie_id_fk" FOREIGN KEY ("serie_id") REFERENCES "public"."serie"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocorrencia_aluno" ADD CONSTRAINT "ocorrencia_aluno_aluno_id_pessoa_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ocorrencia_aluno" ADD CONSTRAINT "ocorrencia_aluno_cadastrado_por_id_pessoa_id_fk" FOREIGN KEY ("cadastrado_por_id") REFERENCES "public"."pessoa"("id") ON DELETE restrict ON UPDATE no action;
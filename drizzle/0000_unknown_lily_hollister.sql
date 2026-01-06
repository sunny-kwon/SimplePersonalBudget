CREATE TABLE "category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"color" text,
	"icon" text,
	"archived" boolean DEFAULT false NOT NULL,
	CONSTRAINT "category_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	CONSTRAINT "tag_user_id_name_unique" UNIQUE("user_id","name")
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category_id" uuid,
	"amount" numeric(12, 2) NOT NULL,
	"kind" text NOT NULL,
	"occurred_on" date NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	CONSTRAINT "amount_check" CHECK ("transaction"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "transaction_tag" (
	"transaction_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "transaction_tag_transaction_id_tag_id_pk" PRIMARY KEY("transaction_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "user_profile" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"display_name" text,
	"currency" char(3) DEFAULT 'USD' NOT NULL,
	"date_format" text DEFAULT 'MM/DD/YYYY' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_tag" ADD CONSTRAINT "transaction_tag_transaction_id_transaction_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_tag" ADD CONSTRAINT "transaction_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_user_id_idx" ON "category" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "trx_user_date_idx" ON "transaction" USING btree ("user_id","occurred_on");--> statement-breakpoint
CREATE INDEX "trx_user_kind_idx" ON "transaction" USING btree ("user_id","kind");--> statement-breakpoint
CREATE INDEX "trx_user_category_idx" ON "transaction" USING btree ("user_id","category_id");
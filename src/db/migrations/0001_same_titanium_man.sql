CREATE TABLE "pipeline" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"action_type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"user_id" uuid
);
--> statement-breakpoint
ALTER TABLE "job_queue" ADD COLUMN "pipeline_id" uuid;--> statement-breakpoint
ALTER TABLE "pipeline" ADD CONSTRAINT "pipeline_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_queue" ADD CONSTRAINT "job_queue_pipeline_id_pipeline_id_fk" FOREIGN KEY ("pipeline_id") REFERENCES "public"."pipeline"("id") ON DELETE cascade ON UPDATE no action;
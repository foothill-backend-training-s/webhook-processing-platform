CREATE TABLE "job_queue" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"task_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending',
	"attempts" integer DEFAULT 0,
	"run_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"email" varchar(256) NOT NULL,
	"password" varchar DEFAULT 'unset' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

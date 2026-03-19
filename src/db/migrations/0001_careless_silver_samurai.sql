ALTER TABLE "pipelines" ADD COLUMN "webhook_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_webhook_key_unique" UNIQUE("webhook_key");
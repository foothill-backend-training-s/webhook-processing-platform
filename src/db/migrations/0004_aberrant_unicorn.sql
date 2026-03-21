DROP INDEX "webhook_key_user_id_index";--> statement-breakpoint
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_webhook_key_unique" UNIQUE("webhook_key");
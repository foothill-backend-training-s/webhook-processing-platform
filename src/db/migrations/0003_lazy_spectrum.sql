CREATE TABLE "delivery_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"subscriber_id" uuid NOT NULL,
	"attempt_number" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempted_at" timestamp DEFAULT now() NOT NULL,
	"response_status_code" integer,
	"error_message" text,
	"delivered_at" timestamp,
	"next_retry_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "delivery_attempts_status_check" CHECK ("delivery_attempts"."status" in ('pending', 'success', 'failed'))
);
--> statement-breakpoint
ALTER TABLE "pipelines" DROP CONSTRAINT "pipelines_webhook_key_unique";--> statement-breakpoint
ALTER TABLE "delivery_attempts" ADD CONSTRAINT "delivery_attempts_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "delivery_attempts" ADD CONSTRAINT "delivery_attempts_subscriber_id_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "job_subscriber_attempt_number_unique" ON "delivery_attempts" USING btree ("job_id","subscriber_id","attempt_number");--> statement-breakpoint
CREATE UNIQUE INDEX "pipeline_endpoint_unique" ON "subscribers" USING btree ("pipeline_id","endpoint");
import {
  pgTable,
  timestamp,
  varchar,
  uuid,
  text,
  jsonb,
  integer,
  boolean,
  check,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email: varchar("email", { length: 256 }).unique().notNull(),
  password: varchar("password", { length: 256 }).notNull(),
});

export type NewUser = typeof users.$inferInsert;

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    payload: jsonb("payload").notNull(), // Data needed for the task
    status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(5),
    // runAt: timestamp("run_at").defaultNow(), // When the task should run
    createdAt: timestamp("created_at").notNull().defaultNow(),
    lastError: text("last_error"),
    completedAt: timestamp("completed_at"),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    pipelineId: uuid("pipeline_id")
      .notNull()
      .references(() => pipelines.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    check(
      "status_check",
      sql`${table.status} in ('pending', 'processing', 'failed', 'completed')`,
    ),
    index("jobs_status_created_at_index").on(table.status, table.createdAt),
  ],
);

export const pipelines = pgTable(
  "pipelines",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    actionType: text("action_type").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    isActive: boolean("is_active").default(true).notNull(),
    webhookKey: text("webhook_key").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("user_id_index").on(table.userId),
    index("webhook_key_index").on(table.webhookKey),
  ],
);

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    endpoint: text("endpoint").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    pipelineId: uuid("pipeline_id")
      .notNull()
      .references(() => pipelines.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    index("pipeline_id_index").on(table.pipelineId),
    uniqueIndex("pipeline_endpoint_unique").on(
      table.pipelineId,
      table.endpoint,
    ),
  ],
);

export const deliveryAttempts = pgTable(
  "delivery_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    jobId: uuid("job_id")
      .notNull()
      .references(() => jobs.id, {
        onDelete: "cascade",
      }),
    subscriberId: uuid("subscriber_id")
      .notNull()
      .references(() => subscribers.id, {
        onDelete: "cascade",
      }),
    attemptNumber: integer("attempt_number").notNull(),
    status: text("status").notNull().default("pending"), // 'pending', 'success', 'failed'
    attemptedAt: timestamp("attempted_at").notNull().defaultNow(),
    responseStatusCode: integer("response_status_code"),
    errorMessage: text("error_message"),
    deliveredAt: timestamp("delivered_at"),
    nextRetryAt: timestamp("next_retry_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check(
      "delivery_attempts_status_check",
      sql`${table.status} in ('pending', 'success', 'failed')`,
    ),
    uniqueIndex("job_subscriber_attempt_number_unique").on(
      table.jobId,
      table.subscriberId,
      table.attemptNumber,
    ),
  ],
);

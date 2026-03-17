import {
  pgTable,
  timestamp,
  varchar,
  uuid,
  text,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email: varchar("email", { length: 256 }).unique().notNull(),
  password: varchar("password"),
});

export type NewUser = typeof users.$inferInsert;

export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  payload: jsonb("payload").notNull(), // Data needed for the task
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed'
  attempts: integer("attempts").notNull().default(0),
  maxAttempts: integer("max_attempts").notNull().default(5),
  // runAt: timestamp("run_at").defaultNow(), // When the task should run
  createdAt: timestamp("created_at").notNull().defaultNow(),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .references(() => pipelines.id, {
      onDelete: "cascade",
    }),
});

export const pipelines = pgTable("pipelines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  actionType: text("action_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  endpoint: text("endpoint").notNull(),
  pipelineId: uuid("pipeline_id")
    .notNull()
    .references(() => pipelines.id, {
      onDelete: "cascade",
    }),
});

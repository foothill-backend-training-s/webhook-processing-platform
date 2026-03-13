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
  password: varchar("password").notNull().default("unset"),
});

export type NewUser = typeof users.$inferInsert;

export const jobQueue = pgTable("job_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskType: text("task_type").notNull(), // e.g., 'SEND_EMAIL', 'RESIZE_IMAGE'
  payload: jsonb("payload").notNull(), // Data needed for the task
  status: text("status").default("pending"), // 'pending', 'processing', 'completed', 'failed'
  attempts: integer("attempts").default(0),
  runAt: timestamp("run_at").defaultNow(), // When the task should run
  createdAt: timestamp("created_at").notNull().defaultNow(),
  pipelineId: uuid("pipeline_id").references(() => pipeline.id, {
    onDelete: "cascade"
  }),
});

export const pipeline = pgTable("pipeline", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  actionType: text("action_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
});

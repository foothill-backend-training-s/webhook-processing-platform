import { db } from "../../src/db/index.js";
import { users, pipelines, subscribers } from "../../src/db/schema.js";

export async function createTestUser() {
  const [user] = await db
    .insert(users)
    .values({
      email: `user-${crypto.randomUUID()}@test.com`,
      password: "hashed-password-placeholder",
    })
    .returning();

  return user;
}

export async function createTestPipeline(params: {
  userId: string;
  name?: string;
  actionType?: string;
  webhookKey?: string;
  isActive?: boolean;
}) {
  const [pipeline] = await db
    .insert(pipelines)
    .values({
      userId: params.userId,
      name: params.name ?? "Test Pipeline",
      actionType: params.actionType ?? "send_interview_email",
      webhookKey: params.webhookKey ?? `webhook-${Date.now()}`,
      isActive: params.isActive ?? true,
    })
    .returning();

  return pipeline;
}

export async function createTestSubscriber(params: {
  pipelineId: string;
  endpoint: string;
  isActive?: boolean;
}) {
  const [subscriber] = await db
    .insert(subscribers)
    .values({
      pipelineId: params.pipelineId,
      endpoint: params.endpoint,
      isActive: params.isActive ?? true,
    })
    .returning();

  return subscriber;
}

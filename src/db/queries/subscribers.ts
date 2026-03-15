import { subscribers } from "../schema.js";
import { db } from "../index.js";
import { asc, desc, eq } from "drizzle-orm";

export async function creatSubscribers(url: string, pipelineId: string) {
  return await db
    .insert(subscribers)
    .values({ endpoint: url, pipelineId: pipelineId })
    .returning();
};

export async function getSubscribersByPipe(pipelineId: string) {
  return await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.pipelineId, pipelineId))
    .orderBy(desc(subscribers.createdAt));
};

export async function deleteSubscribersByPipe(pipelineId: string) {
  return await db
    .delete(subscribers)
    .where(eq(subscribers.pipelineId, pipelineId));
};


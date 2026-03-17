import { subscribers } from "../schema.js";
import { db } from "../index.js";
import { asc, desc, eq } from "drizzle-orm";

export async function createSubscribers(
  endpoints: string[],
  pipelineId: string,
) {
  const values = endpoints.map((endpoint) => ({
    endpoint,
    pipelineId,
  }));

  return await db.insert(subscribers).values(values).returning();
}

export async function getSubscribersByPipe(pipelineId: string) {
  return await db
    .select()
    .from(subscribers)
    .where(eq(subscribers.pipelineId, pipelineId))
    .orderBy(desc(subscribers.createdAt));
}

export async function deleteSubscribersByPipe(pipelineId: string) {
  return await db
    .delete(subscribers)
    .where(eq(subscribers.pipelineId, pipelineId));
}

export async function updateSubscribersById(
  subId: string,
  url: string,
  pipId: string,
) {
  const updated = await db
    .update(subscribers)
    .set({ endpoint: url, pipelineId: pipId })
    .where(eq(subscribers.id, subId))
    .returning();
  return [updated];
}

import { pipelines, subscribers } from "../schema.js";
import { db } from "../index.js";
import { eq } from "drizzle-orm";

export async function createPipelineWithSubscribers(
  name: string,
  actionType: string,
  userId: string,
  webhookKey: string,
  endPoints: string[],
) {
  return await db.transaction(async (tx) => {
    const [pipeline] = await tx
      .insert(pipelines)
      .values({
        name: name,
        actionType: actionType,
        userId: userId,
        webhookKey: webhookKey,
      })
      .returning();

    if (!pipeline) {
      throw new Error("failed to create pipeline");
    }
    const pipelineId = pipeline.id;

    const values = endPoints.map((endpoint) => ({
      endpoint,
      pipelineId,
    }));

    const subs = await tx.insert(subscribers).values(values).returning();

    if (!subs.length) {
      throw new Error("failed to create subscribers");
    }
    return {
      pipeline,
      subs: subs,
    };
  });
}

export async function getPipeLinesByUser(userId: string) {
  return db.select().from(pipelines).where(eq(pipelines.userId, userId));
}

export async function getPipeLinesById(id: string) {
  return await db.select().from(pipelines).where(eq(pipelines.id, id));
}

export async function getPipeLinesByUrl(url: string) {
  return await db.select().from(pipelines).where(eq(pipelines.webhookKey, url));
}

export async function updatePipeline(
  pipelineId: string,
  name: string,
  actionType: string,
  webhookKey: string,
) {
  return await db
    .update(pipelines)
    .set({
      name: name,
      actionType: actionType,
      webhookKey: webhookKey,
    })
    .where(eq(pipelines.id, pipelineId))
    .returning();
}

export async function deletePipeLine(id: string) {
  return await db.delete(pipelines).where(eq(pipelines.id, id)).returning();
}

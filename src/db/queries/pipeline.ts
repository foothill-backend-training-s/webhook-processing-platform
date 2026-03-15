import { pipelines } from "../schema.js";
import { db } from "../index.js";
import { asc, eq, sql } from "drizzle-orm";

export async function createPipeline(
  name: string,
  actionType: string,
  userId: string,
) {
  const result = await db
    .insert(pipelines)
    .values({ name: name, actionType: actionType, userId: userId })
    .returning();

  return result;
}

export async function getPipeLines(userId: string) {
  return db.select().from(pipelines).where(eq(pipelines.userId, userId));
}

export async function updatePipeline(
  pipelineId: string,
  name: string,
  actionType: string,
) {
  return await db
    .update(pipelines)
    .set({
      name: name,
      actionType: actionType,
    })
    .where(eq(pipelines.id, pipelineId))
    .returning();
}

export async function deletePipeLine(id: string) {
  return await db.delete(pipelines).where(eq(pipelines.id, id)).returning();
}

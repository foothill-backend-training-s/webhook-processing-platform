import { db } from "../index.js";
import { jobs } from "../schema.js";
import { sql, eq } from "drizzle-orm";

export async function createJob(pipeId: string, reqBody: string) {
  return await db
    .insert(jobs)
    .values({ pipelineId: pipeId, payload: reqBody })
    .returning();
}
type ClaimedJob = {
  id: string;
  pipeline_id: string;
  attempts: number;
  status: string;
};
export async function updateJob() {
  const result = await db.execute(sql`
    WITH next_job AS (
      SELECT id
      FROM jobs
      WHERE status = 'pending'
      ORDER BY "created_at" ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE jobs
    SET status = 'processing'
    WHERE id IN (SELECT id FROM next_job)
    RETURNING *;
  `);

  return result as unknown as ClaimedJob[];
  // Why this works
  // You’re basically telling TS:
  // I know db.execute() returns generic unknown records
  // but for this specific SQL, I know the returned rows match ClaimedJob
  // That’s normal when using raw SQL.
}

export async function jobCompleted(id: string) {
  return await db
    .update(jobs)
    .set({ status: "completed" })
    .where(eq(jobs.id, id));
}

export async function retryJob(id: string, attempts: number) {
  const [res] = await db
    .select({ attempts: jobs.attempts, maxAttempts: jobs.maxAttempts })
    .from(jobs)
    .where(eq(jobs.id, id));
  if (res.attempts >= res.maxAttempts) {
    await db.update(jobs).set({ status: "faild" }).where(eq(jobs.id, id));
    console.log("max attempts have reached , set job to faild");
  }
  return await db
    .update(jobs)
    .set({ attempts: attempts + 1, status: "pending" })
    .where(eq(jobs.id, id));
}

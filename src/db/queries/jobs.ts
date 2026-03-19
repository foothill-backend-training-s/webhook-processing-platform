import { db } from "../index.js";
import { jobs } from "../schema.js";
import { sql, eq } from "drizzle-orm";

// type JSONValue = JSONObject | JSONArray;

export async function createJob(pipeId: string, reqBody: object) {
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
  payload:any;
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
    .set({ status: "completed", completedAt: new Date(), lastError: null })
    .where(eq(jobs.id, id));
}

export async function retryJob(id: string) {
  const [res] = await db
    .select({ attempts: jobs.attempts, maxAttempts: jobs.maxAttempts })
    .from(jobs)
    .where(eq(jobs.id, id));
  if (!res) {
    throw new Error("job not found");
  }
  if (res.attempts >= res.maxAttempts) {
    await db
      .update(jobs)
      .set({
        status: "failed",
        lastError: "max attempts have reached , set job to failed",
      })
      .where(eq(jobs.id, id));
    console.log("max attempts have reached , set job to failed");
    return "failed";
  }
  return await db
    .update(jobs)
    .set({
      attempts: res.attempts + 1,
      status: "pending",
      lastError: "job processing failed, retrying",
      })
    .where(eq(jobs.id, id));
}

import { deliveryAttempts } from "../schema.js";
import { db } from "../index.js";
import { eq } from "drizzle-orm";

export async function createDeliveryAttempt(
  jobId: string,
  subId: string,
  attemptNum: number,
) {
  return await db
    .insert(deliveryAttempts)
    .values({ jobId: jobId, subscriberId: subId, attemptNumber: attemptNum })
    .returning();
}

export async function updateDeliveryAttempt(
  attemptNum: number,
  status?: string,
) {
  if (!status)
    return await db.update(deliveryAttempts).set({ attemptNumber: attemptNum });
  else
    return await db
      .update(deliveryAttempts)
      .set({ attemptNumber: attemptNum, status: status });
}

export async function markDeliveryAttemptSuccess(
  attemptId: string,
  responseStatusCode: number,
) {
  const [updated] = await db
    .update(deliveryAttempts)
    .set({
      status: "success",
      responseStatusCode,
      deliveredAt: new Date(),
      updatedAt: new Date(),
      errorMessage: null,
    })
    .where(eq(deliveryAttempts.id, attemptId))
    .returning();

  return updated;
}

export async function markDeliveryAttemptFailed(
  attemptId: string,
  errorMessage: string,
  responseStatusCode?: number,
  nextRetryAt?: Date,
) {
  const [updated] = await db
    .update(deliveryAttempts)
    .set({
      status: "failed",
      errorMessage,
      responseStatusCode,
      nextRetryAt,
      updatedAt: new Date(),
    })
    .where(eq(deliveryAttempts.id, attemptId))
    .returning();

  return updated;
}

export async function getDeliveryAttemptsByJobId(jobId: string) {
  return await db
    .select()
    .from(deliveryAttempts)
    .where(eq(deliveryAttempts.jobId, jobId));
}

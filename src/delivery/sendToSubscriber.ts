import { failJob } from "../db/queries/jobs.js";
import {
  createDeliveryAttempt,
  markDeliveryAttemptFailed,
  markDeliveryAttemptSuccess,
} from "../db/queries/deliveryAttempts.js";
// to be deleted
//“I used fetch as the HTTP client and implemented custom retry logic with AbortController for timeout handling. Each delivery attempt is persisted in the database, including response status and error details, allowing full monitoring and debugging.”
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type Subscriber = {
  id: string;
  endpoint: string;
};

export async function sendToSubscriberWithRetry(
  jobId: string,
  subscriber: Subscriber,
  payload: unknown,
  maxRetries = 3,
): Promise<void> {
  let lastError: Error | null = null;

  for (let attemptNumber = 1; attemptNumber <= maxRetries; attemptNumber++) {
    const [attempt] = await createDeliveryAttempt(
      jobId,
      subscriber.id,
      attemptNumber,
    );
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const delay = Math.pow(2, attemptNumber) * 1000;
    try {
      const response = await fetch(subscriber.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (response.ok) {
        await markDeliveryAttemptSuccess(attempt.id, response.status);
        return;
      }

      const errorMessage = `delivery failed with status ${response.status}`;

      const nextRetryAt =
        attemptNumber < maxRetries ? new Date(Date.now() + delay) : undefined;

      await markDeliveryAttemptFailed(
        attempt.id,
        errorMessage,
        response.status,
        nextRetryAt,
      );

      lastError = new Error(errorMessage);
    } catch (error) {
      clearTimeout(timeout);

      const message =
        error instanceof Error ? error.message : "unknown delivery error";

      const nextRetryAt =
        attemptNumber < maxRetries ? new Date(Date.now() + delay) : undefined;

      await markDeliveryAttemptFailed(
        attempt.id,
        message,
        undefined,
        nextRetryAt,
      );

      lastError = error instanceof Error ? error : new Error(message);
    }

    if (attemptNumber < maxRetries) {
      await sleep(delay);
    }
  }
  await failJob(
    jobId,
    `subscriber delivery failed after ${maxRetries} retries`,
  );
  throw lastError ?? new Error("subscriber delivery failed after retries");
}

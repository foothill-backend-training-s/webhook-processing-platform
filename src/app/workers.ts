import {
  updateJob,
  jobCompleted,
  retryJob,
  failJob,
} from "../db/queries/jobs.js";
import { getPipeLinesById } from "../db/queries/pipelines.js";
import { getSubscribersByPipe } from "../db/queries/subscribers.js";
import { sendEmailAction } from "../actions/sendEmail.js";
import { sendToSubscriberWithRetry } from "../delivery/sendToSubscriber.js";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function worker(): Promise<void> {
  console.log("worker started");
  console.log("waiting for a job");
  while (true) {
    const [job] = await updateJob();
    if (job) {
      console.log(job);
    }

    if (!job) {
      await sleep(100000);
      continue;
    }
    try {
      const [pipeInfo] = await getPipeLinesById(job.pipeline_id);

      if (!pipeInfo) {
        throw new Error("pipeline not found for claimed job");
      }

      let processedPayload: unknown;

      try {
        switch (pipeInfo.actionType) {
          case "send_interview_email":
            processedPayload = sendEmailAction(job.payload);
            break;

          default:
            throw new Error(`unsupported action type: ${pipeInfo.actionType}`);
        }
      } catch (err) {
        console.error("job processing error:", err);
        const res = await retryJob(job.id);

        if (res === "failed") {
          console.log("job failed after max processing retries");
        }

        continue;
      }

      const subs = await getSubscribersByPipe(pipeInfo.id);

      if (subs.length === 0) {
        await failJob(job.id, "no subscribers found for pipeline");
        continue;
      }

      try {
        for (const sub of subs) {
          await sendToSubscriberWithRetry(
            job.id,
            { id: sub.id, endpoint: sub.endpoint },
            processedPayload,
            5,
          );
        }
      } catch (err) {
        console.error("subscriber delivery error:", err);
        await failJob(
          job.id,
          err instanceof Error ? err.message : "subscriber delivery failed",
        );
        continue;
      }

      await jobCompleted(job.id);
    } catch (err) {
      console.error("unexpected worker error:", err);
      const res = await retryJob(job.id);

      if (res === "failed") {
        console.log("job failed after max processing retries");
      }
    }
  }
}

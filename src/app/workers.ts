import express, { Request, Response } from "express";
import { updateJob, jobCompleted, retryJob } from "../db/queries/jobs.js";
import { getPipeLinesById } from "../db/queries/pipelines.js";
import { getSubscribersByPipe } from "../db/queries/subscribers.js";
import { HTTPError } from "../errors/class_error.js";
import { envOrThrow } from "../config.js";
import { sendEmailAction } from "../actions/sendEmail.js";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function worker(): Promise<void> {
  while (true) {
    const [job] = await updateJob();
    console.log(job);

    if (!job) {
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }
    try {
      const [pipeInfo] = await getPipeLinesById(job.pipeline_id);

      if (!pipeInfo) {
        throw new Error("pipeline not found for claimed job");
      }

      // process action here based on pipeInfo.actionType and job.payload
      switch (pipeInfo.actionType) {
        case "send_interview_email": {
          const emailContent = sendEmailAction(job.payload);
          const subs = await getSubscribersByPipe(pipeInfo.id);
          for (var sub of subs) {
            await fetch(sub.endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(emailContent),
            });
          }
          break;
        }
      }

      await jobCompleted(job.id);
    } catch (err) {
      const res = await retryJob(job.id);
      if (res == "failed") {
        console.log("job failed after many number of retires");
      }
    }
  }
}

async function main(): Promise<void> {
  console.log("starting worker...");
  await worker();
}

main().catch((err) => {
  console.error("worker crashed:", err);
  process.exit(1);
});

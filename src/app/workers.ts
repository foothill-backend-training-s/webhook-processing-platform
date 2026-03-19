import { updateJob, jobCompleted, retryJob } from "../db/queries/jobs.js";
import { getPipeLinesById } from "../db/queries/pipelines.js";
import { getSubscribersByPipe } from "../db/queries/subscribers.js";
import { sendEmailAction } from "../actions/sendEmail.js";

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
          console.log(`email body:\n ${emailContent}`);
          const subs = await getSubscribersByPipe(pipeInfo.id);
          for (var sub of subs) {
            await fetch(sub.endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(emailContent),
            });
          }

          console.log(
            `email body\n [${emailContent}]\nsent to each subscriber`,
          );

          break;
        }
      }
      //  retry logic for subscribers before mark job as completed
      await jobCompleted(job.id);
    } catch (err) {
      const res = await retryJob(job.id);
      if (res == "failed") {
        console.log("job failed after many number of retires");
      }
    }
  }
}

import { updateJob, jobCompleted, retryJob } from "./db/queries/jobs.js";
import { getPipeLinesById } from "./db/queries/pipelines.js";

export async function worker() {
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

      await jobCompleted(job.id);
    } catch (err) {
      await retryJob(job.id, job.attempts);
    }
  }
}

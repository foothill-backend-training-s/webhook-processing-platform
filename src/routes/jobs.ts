import express, { Request, Response, Router } from "express";
import { getJob, getJobById } from "../db/queries/jobs.js";
import { getDeliveryAttemptsByJobId } from "../db/queries/deliveryAttempts.js";
import { HTTPError } from "../errors/class_error.js";
const jobsRouter: Router = express.Router();

jobsRouter.get("/", async (req: Request, res: Response) => {
  const result = await getJob();

  res.status(200).json({ count: result.length, jobs: result });
});

jobsRouter.get("/:id", async (req: Request, res: Response) => {
  const jobId = req.params.id as string;
  if (!jobId) {
    throw new HTTPError("no job id provided", 404);
  }
  const [job] = await getJobById(jobId);
  if (!job) {
    throw new HTTPError("job not found", 404);
  }
  const attempts = await getDeliveryAttemptsByJobId(job.id);

  res.status(200).json({
    job: job,
    deliveryAttempts: attempts,
  });
});

export default jobsRouter;

import express, { Router, Request, Response } from "express";
import { HTTPError } from "../errors/class_error.js";
import { getPipeLinesById } from "../db/queries/pipelines.js";
import { createJob } from "../db/queries/jobs.js";

const webhooksRouter: Router = express.Router();

webhooksRouter.post("/:pipe_id", async (req: Request, res: Response) => {
  const pipeId = req.params.pipe_id as string;
  const reqBody = req.body;
  //   const userId = req.body.user_id;
  if (!pipeId) {
    throw new HTTPError("invalid data", 400);
  }

  const [pipe] = await getPipeLinesById(pipeId);
  if (!pipe) {
    throw new HTTPError("pipeline not found", 404);
  }

  const result = await createJob(pipeId, reqBody);
  if (!result) {
    throw new HTTPError("couldnt create a job", 400);
  }

  // get webhook and save it in job table , with payload = reqBody
  res.status(202).json({ message: "job queued successfully", job: result });
});

export default webhooksRouter;

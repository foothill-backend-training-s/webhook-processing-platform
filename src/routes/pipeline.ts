import express, { Router, Request, Response } from "express";
import { HTTPError } from "../errors/class_error.js";
import {
  createPipelineWithSubscribers,
  getPipeLinesByUser,
  updatePipeline,
  deletePipeLine,
  getPipeLinesByUrl,
  getPipeLinesById,
} from "../db/queries/pipelines.js";
import { updateSubscribersById } from "../db/queries/subscribers.js";
import { createJob, getJobByPipeId } from "../db/queries/jobs.js";

const pipelineRouter: Router = express.Router();

pipelineRouter.post("/", async (req: Request, res: Response) => {
  const userId = req.body.user_id;
  const name = req.body.name;
  const actionType = req.body.action_type;
  const webhookKey = req.body.webhook_key;
  const subEndpoints = req.body.sub;
  if (!userId || !name || !actionType || !webhookKey) {
    throw new HTTPError("invalid pipeline data", 400);
  }

  if (!Array.isArray(subEndpoints) || subEndpoints.length === 0) {
    throw new HTTPError("subscribers must be a non-empty array", 400);
  }

  for (const endpoint of subEndpoints) {
    if (typeof endpoint !== "string") {
      throw new HTTPError("each subscriber must be a string endpoint", 400);
    }
  }
  console.log(
    `userId: ${userId}\nname: ${name}\nactionType: ${actionType}\nwebhook: ${webhookKey}\nsubs: ${subEndpoints}`,
  );

  const result = await createPipelineWithSubscribers(
    name,
    actionType,
    userId,
    webhookKey,
    subEndpoints,
  );

  res.status(201).json(result);
});

pipelineRouter.get("/users/:user_id", async (req: Request, res: Response) => {
  const userId = req.params.user_id as string;
  if (!userId) {
    throw new HTTPError("invalid userId", 400);
  }
  console.log(`userId: ${userId}`);

  const result = await getPipeLinesByUser(userId);

  res.status(200).json({
    count: result.length,
    pipelines: result,
  });
});

pipelineRouter.put("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const name = req.body.name;
  const actionType = req.body.action_type;
  const webhookKey = req.body.webhook_key;
  const subsInfo = req.body.sub;
  if (!id || !name || !actionType) {
    throw new HTTPError("invalid pipeline data", 400);
  }
  if (!Array.isArray(subsInfo) || subsInfo.length === 0) {
    throw new HTTPError("subscribers must be a non-empty array", 400);
  }

  console.log(`id: ${id},name: ${name},actionType: ${actionType}`);

  const [pipeline] = await updatePipeline(id, name, actionType, webhookKey);
  if (!pipeline) {
    throw new HTTPError("pipeline not found", 404);
  }

  for (const sub of subsInfo) {
    if (!sub || typeof sub.id !== "string" || typeof sub.url !== "string") {
      throw new HTTPError(
        "each subscriber must contain string id and url",
        400,
      );
    }
  }
  const updatedSubs = await Promise.all(
    subsInfo.map((sub) => updateSubscribersById(sub.id, sub.url, pipeline.id)),
  );

  if (updatedSubs.some((sub) => !sub)) {
    throw new HTTPError("one or more subscribers not found", 404);
  }
  res.status(200).json({
    pipeline,
    subscribers: updatedSubs,
  });
});

pipelineRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) {
    throw new HTTPError("invalid pipeline id", 400);
  }
  const deleted = await deletePipeLine(id);
  if (!deleted) {
    throw new HTTPError("pipeline not found", 404);
  }
  res.status(204).send();
});

pipelineRouter.post(
  "/webhooks/:webhook_key",
  async (req: Request, res: Response) => {
    const webhook_key = req.params.webhook_key as string;
    const reqBody = req.body;

    if (!webhook_key) {
      throw new HTTPError("invalid data", 400);
    }

    const [pipe] = await getPipeLinesByUrl(webhook_key);
    if (!pipe) {
      throw new HTTPError("pipeline not found", 404);
    }

    const result = await createJob(pipe.id, reqBody);
    if (!result) {
      throw new HTTPError("couldnt create a job", 400);
    }

    res.status(202).json({ message: "job queued successfully", job: result });
  },
);

pipelineRouter.get("/:id/jobs", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) {
    throw new HTTPError("no pipeline id provided", 404);
  }
  const [pipeline] = await getPipeLinesById(id);
  if (!pipeline) {
    throw new HTTPError("pipeline not found", 404);
  }
  const result = await getJobByPipeId(id);

  res.status(200).json({ count: result.length, jobs: result });
});
export default pipelineRouter;

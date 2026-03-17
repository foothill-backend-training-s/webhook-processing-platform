import express, { Router, Request, Response } from "express";
import { HTTPError } from "../errors/class_error.js";
import {
  createPipeline,
  getPipeLinesByUser,
  updatePipeline,
  deletePipeLine,
} from "../db/queries/pipelines.js";
import {
  createSubscribers,
  updateSubscribersById,
} from "../db/queries/subscribers.js";

const pipelineRouter: Router = express.Router();

pipelineRouter.post("/", async (req: Request, res: Response) => {
  const userId = req.body.user_id;
  const name = req.body.name;
  const actionType = req.body.action_type;
  const subEndpoints = req.body.sub;
  if (!userId || !name || !actionType) {
    throw new HTTPError("invalid pipeline data", 400);
  }
  if (!Array.isArray(subEndpoints)) {
    throw new HTTPError("subscribers must be an array", 400);
  }

  console.log(
    `userId: ${userId},name: ${name},actionType: ${actionType},subs: ${subEndpoints}`,
  );

  const [pipeline] = await createPipeline(name, actionType, userId);
  if (!pipeline) {
    throw new HTTPError("couldnt create a pipeline", 400);
  }
  const subs = await createSubscribers(subEndpoints, pipeline.id);

  res.status(201).json({
    pipeline: pipeline,
    subscribers: subs,
  });
});

pipelineRouter.get("/:user_id", async (req: Request, res: Response) => {
  const userId = req.params.user_id as string;
  if (!userId) {
    throw new HTTPError("invalid userId", 400);
  }
  console.log(`userId: ${userId}`);

  const result = await getPipeLinesByUser(userId);
  if (!result) {
    throw new HTTPError("pipeline not found", 404);
  }
  res.status(200).json({
    count: result.length,
    pipelines: result,
  });
});

pipelineRouter.put("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const name = req.body.name;
  const actionType = req.body.action_type;
  const subsInfo = req.body.sub;
  if (!id || !name || !actionType) {
    throw new HTTPError("invalid pipeline data", 400);
  }
  if (!Array.isArray(subsInfo) || subsInfo.length === 0) {
    throw new HTTPError("subscribers must be a non-empty array", 400);
  }
  console.log(`id: ${id},name: ${name},actionType: ${actionType}`);

  const [pipeline] = await updatePipeline(id, name, actionType);
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

export default pipelineRouter;

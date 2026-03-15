import {
  createPipeline,
  getPipeLines,
  updatePipeline,
  deletePipeLine,
} from "../db/queries/pipeline.js";
import express, { Router, Request, Response } from "express";
import { HTTPError } from "src/errors/class_error.js";
const pipelineRouter: Router = express.Router();

pipelineRouter.post("/", async (req: Request, res: Response) => {
  const userId = req.body.user_id;
  const name = req.body.name;
  const actionType = req.body.action_type;
  if (!userId || !name || !actionType) {
    throw new HTTPError("invalid pipeline data", 400);
  }
  console.log(`userId: ${userId},name: ${name},actionType: ${actionType}`);

  const [result] = await createPipeline(name, actionType, userId);
  if (!result) {
    throw new HTTPError("couldnt create a pipeline", 400);
  }
  res.status(201).json({
    pipeline: result,
  });
});

pipelineRouter.get("/:user_id", async (req: Request, res: Response) => {
  try {
    const userId = req.params.user_id as string;
    if (!userId) {
      throw new HTTPError("invalid userId", 400);
    }
    console.log(`userId: ${userId}`);

    const result = await getPipeLines(userId);
    if (!result) {
      throw new HTTPError("pipeline not found", 404);
    }
    res.status(200).json({
      count: result.length,
      pipelines: result,
    });
  } catch (err) {
    throw new HTTPError("server error", 500);
  }
});

pipelineRouter.put("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const name = req.body.name;
  const actionType = req.body.action_type;
  if (!id || !name || !actionType) {
    throw new HTTPError("invalid pipeline data", 400);
  }
  console.log(`id: ${id},name: ${name},actionType: ${actionType}`);

  const [result] = await updatePipeline(id, name, actionType);
  if (!result) {
    throw new HTTPError("pipeline not found", 404);
  }
  res.status(201).json({
    "pipeline new conf:": result,
  });
});

pipelineRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      throw new HTTPError("invalid pipeline id", 400);
    }
    await deletePipeLine(id);
    res.status(204).send();
  } catch (err) {
    throw new HTTPError("pipeline not found", 404);
  }
});

export default pipelineRouter;

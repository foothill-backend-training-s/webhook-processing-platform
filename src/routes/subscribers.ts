import {
  getSubscribersByPipe,
  deleteSubscribersByPipe,
} from "../db/queries/subscribers.js";
import express, { Router, Request, Response } from "express";
import { HTTPError } from "../errors/class_error.js";
const subscribersRouter: Router = express.Router();

subscribersRouter.get("/:pipe_id", async (req: Request, res: Response) => {
  const id = req.params.pipe_id as string;
  if (!id) {
    throw new HTTPError("invalid pipline id", 400);
  }
  const result = await getSubscribersByPipe(id);
  res.status(200).json(result);
});

subscribersRouter.delete("/:pipe_id", async (req: Request, res: Response) => {
  const id = req.params.pipe_id as string;
  if (!id) {
    throw new HTTPError("invalid pipline id", 400);
  }
  await deleteSubscribersByPipe(id);
  res.status(204).end();
});

export default subscribersRouter;

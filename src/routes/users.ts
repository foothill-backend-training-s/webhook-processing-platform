import { createUser, getUsers, getUserById } from "../db/queries/users.js";
import express, { Router, Request, Response } from "express";
import { HTTPError } from "../errors/class_error.js";
const usersRouter: Router = express.Router();

usersRouter.post("/", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new HTTPError("invalid user data", 400);
  }
  console.log(`email: ${email},pass: ${password}`);
  const [result] = await createUser(email, password);

  if (!result) {
    throw new HTTPError("couldnt create a user", 400);
  }

  res.status(201).json({ user: result });
});

usersRouter.get("/", async (req: Request, res: Response) => {
  const result = await getUsers();
  res.status(200).json({ user: result });
});

usersRouter.get("/:id", async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) {
    throw new HTTPError("invalid user id", 400);
  }
  console.log(`id: ${id}`);
  const [result] = await getUserById(id);

  if (!result) {
    throw new HTTPError("couldnt get user", 400);
  }
  res.status(200).json({ user: result });
});

export default usersRouter;

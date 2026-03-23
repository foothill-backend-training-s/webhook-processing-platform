import express, { Router, Request, Response } from "express";
import { createUser, getUsers, getUserById } from "../db/queries/users.js";
import { hashPassword } from "../auth.js";
import { HTTPError } from "../errors/class_error.js";
const usersRouter: Router = express.Router();

usersRouter.post("/", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new HTTPError("invalid user data", 400);
  }

  const hashedPass = await hashPassword(password);

  if (!hashedPass) {
    throw new HTTPError("something went wrong", 400);
  }

  const [result] = await createUser(email, hashedPass);

  console.log(`email: ${result.email},pass: ${result.password}`);

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

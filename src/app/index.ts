import express from "express";
import pipelineRouter from "../routes/pipeline.js";
import usersRouter from "../routes/users.js";
import subscribersRouter from "../routes/subscribers.js";
import jobsRouter from "../routes/jobs.js";
import { errorHandlerMiddleware } from "../middleware/error_handler_middleware.js";

export const app = express();

app.use(express.json());
app.use("/pipelines", pipelineRouter);
app.use("/users", usersRouter);
app.use("/subscribers", subscribersRouter);
app.use("/jobs", jobsRouter);

app.use(errorHandlerMiddleware);

import express from "express";
import usersRouter from "./routes/users.js";
import pipelinesRouter from "./routes/pipeline.js";
import jobsRouter from "./routes/jobs";

const app = express();

app.use(express.json());

app.use("/users", usersRouter);
app.use("/pipelines", pipelinesRouter);
app.use("/jobs", jobsRouter);

export default app;

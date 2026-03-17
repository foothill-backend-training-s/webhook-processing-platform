import express from "express";
import pipelineRouter from "./routes/pipeline.js";
import usersRouter from "./routes/users.js";
import subscribersRouter from "./routes/subscribers.js";
import webhooksRouter from "./routes/webhooks.js";
import { envOrThrow } from "../src/config";
import { errorHandlerMiddleware } from "./middleware/error_handler_middleware.js";
import { worker } from "./workers.js";

const app = express();
const port = envOrThrow("PORT");
const workerPort = envOrThrow("WORKER_PORT");

// app.use(express.static("."));
app.use(express.json());
app.use("/pipelines", pipelineRouter);
app.use("/users", usersRouter);
app.use("/subs", subscribersRouter);
app.use("/webhooks", webhooksRouter);

app.use(errorHandlerMiddleware);
// app.use(worker)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

worker().catch((err) => {
  console.error("worker crashed:", err);
});

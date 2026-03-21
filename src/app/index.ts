import express from "express";
import pipelineRouter from "../routes/pipeline.js";
import usersRouter from "../routes/users.js";
import subscribersRouter from "../routes/subscribers.js";
import jobsRouter from "../routes/jobs.js";
// import { envOrThrow } from "../config.js";
import { errorHandlerMiddleware } from "../middleware/error_handler_middleware.js";

export const app = express();
// const port = envOrThrow("PORT");

// app.use(express.static("."));
app.use(express.json());
app.use("/pipelines", pipelineRouter);
app.use("/users", usersRouter);
app.use("/subscribers", subscribersRouter);
app.use("/jobs", jobsRouter);

app.use(errorHandlerMiddleware);

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}!`);
// });

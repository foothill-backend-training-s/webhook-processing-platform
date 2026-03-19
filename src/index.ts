import express from "express";
import pipelineRouter from "./routes/pipeline.js";
import usersRouter from "./routes/users.js";
import subscribersRouter from "./routes/subscribers.js";
import { envOrThrow } from "./config.js";
import { errorHandlerMiddleware } from "./middleware/error_handler_middleware.js";

const app = express();
const port = envOrThrow("PORT");

// app.use(express.static("."));
app.use(express.json());
app.use("/pipelines", pipelineRouter);
app.use("/users", usersRouter);
app.use("/subs", subscribersRouter);

app.use(errorHandlerMiddleware);
// app.use(worker)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

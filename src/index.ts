import express from "express";
import pipelineRouter from "./routes/pipeline.js";
import usersRouter from "./routes/users.js";
import { envOrThrow } from "../src/config";
import { errorHandlerMiddleware } from './middleware/error_handler_middleware.js';
process.loadEnvFile();

const app = express();
const port = envOrThrow("PORT");

// app.use(express.static("."));
app.use(express.json());
app.use("/pipelines", pipelineRouter);
app.use("/users", usersRouter);

app.use(errorHandlerMiddleware);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});


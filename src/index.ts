import express from "express";
import {envOrThrow} from "../src/config";
process.loadEnvFile();

const app = express();
const port = envOrThrow("PORT");
  

// app.use(express.static("."));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

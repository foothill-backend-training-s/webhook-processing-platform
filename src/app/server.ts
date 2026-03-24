import { app } from "./index.js";
import { envOrThrow } from "../config.js";

const port = envOrThrow("PORT");

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

import { app } from "./app/index.js";
import { envOrThrow } from "./config.js";

const port = envOrThrow("PORT");

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

import { worker } from "./app/workers.js";

async function main(): Promise<void> {
  console.log("starting worker...");
  await worker();
}

main().catch((err) => {
  console.error("worker crashed:", err);
  process.exit(1);
});

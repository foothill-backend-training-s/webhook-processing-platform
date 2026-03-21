import { db } from "../../src/db/index.js";
import {
  deliveryAttempts,
  jobs,
  subscribers,
  pipelines,
  users,
} from "../../src/db/schema.js";

export async function resetTestDb(): Promise<void> {
  await db.delete(deliveryAttempts);
  await db.delete(jobs);
  await db.delete(subscribers);
  await db.delete(pipelines);
  await db.delete(users);
}

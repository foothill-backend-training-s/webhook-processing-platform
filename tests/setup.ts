import { afterEach, beforeEach } from "vitest";
import { resetTestDb } from "./helpers/setupTestDb.js";

beforeEach(async () => {
  await resetTestDb();
});

afterEach(async () => {
  await resetTestDb();
});
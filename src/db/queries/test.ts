import { users } from "../schema.js";
import { eq } from "drizzle-orm";
import { db } from "../index.js";

export async function getUsers() {
  return await db.select().from(users);
}

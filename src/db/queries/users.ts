import { users } from "../schema.js";
import { db } from "../index.js";
import { eq } from "drizzle-orm";

export async function createUser(email: string, password: string) {
  const res = await db
    .insert(users)
    .values({ email: email, password: password })
    .returning();
  return res;
}

export async function getUsers() {
  return await db.select().from(users);
}

export async function getUserById(id: string) {
  return await db.select().from(users).where(eq(users.id, id));
}

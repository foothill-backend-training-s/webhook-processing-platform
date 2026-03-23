import * as argon2 from "argon2";
import { HTTPError } from "./errors/class_error.js";

export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
    });
  } catch {
    throw new HTTPError("failed to hash password", 500);
  }
}

export async function checkPasswordHash(
  password: string,
  hash: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    throw new HTTPError("failed to verify password", 500);
  }
}

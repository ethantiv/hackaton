import argon2 from "argon2";

const OPTIONS = { type: argon2.argon2id } as const;

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, OPTIONS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

// Precomputed argon2id hash of a constant the application will never accept as
// a password. Used to equalize verification time on the unknown-user branch of
// /auth/login so request timing does not reveal whether an e-mail is registered.
export const DUMMY_HASH: string = await hashPassword(
  "__field-notebook-dummy-hash-do-not-use__",
);

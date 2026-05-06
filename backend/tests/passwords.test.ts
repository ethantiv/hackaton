import { describe, it, expect } from "bun:test";
import { hashPassword, verifyPassword, DUMMY_HASH } from "../src/auth/passwords";

describe("password hashing", () => {
  it("verifies a correct password", async () => {
    const hash = await hashPassword("test1234");
    expect(await verifyPassword(hash, "test1234")).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("test1234");
    expect(await verifyPassword(hash, "wrong")).toBe(false);
  });

  it("returns argon2id hashes", async () => {
    const hash = await hashPassword("test1234");
    expect(hash.startsWith("$argon2id$")).toBe(true);
  });
});

describe("DUMMY_HASH", () => {
  it("is a valid argon2id hash", () => {
    expect(DUMMY_HASH.startsWith("$argon2id$")).toBe(true);
  });

  it("never verifies any password as correct", async () => {
    expect(await verifyPassword(DUMMY_HASH, "test1234")).toBe(false);
    expect(await verifyPassword(DUMMY_HASH, "")).toBe(false);
    expect(await verifyPassword(DUMMY_HASH, "anything")).toBe(false);
  });
});

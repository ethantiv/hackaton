import type { ErrorHandler } from "hono";

export const errorHandler: ErrorHandler = (err, c) => {
  console.error("[backend error]", err);
  return c.json({ error: "internal_server_error" }, 500);
};

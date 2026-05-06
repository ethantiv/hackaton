import { z } from "zod";

const Schema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_PATH: z.string().default("./data/app.db"),
  PHOTOS_PATH: z.string().default("./data/photos"),
  JWT_SECRET: z.string().min(32).default("dev-only-secret-change-in-production!!"),
  ACCESS_TTL_SECONDS: z.coerce.number().default(15 * 60),
  REFRESH_TTL_SECONDS: z.coerce.number().default(30 * 24 * 60 * 60),
  LOGIN_LOCKOUT_FAILS: z.coerce.number().default(5),
  LOGIN_LOCKOUT_MINUTES: z.coerce.number().default(15),
});

export const config = Schema.parse(process.env);
export type Config = typeof config;

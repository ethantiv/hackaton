import { z } from "zod";

export const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RefreshBody = z.object({
  refreshToken: z.string().min(20),
});

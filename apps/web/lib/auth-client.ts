import { createAuthClient } from "better-auth/react";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient(
  {
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8000",
    plugins: [],
  }
);

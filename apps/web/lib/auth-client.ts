import { createAuthClient, AuthClient } from "better-auth/react";

export const authClient: AuthClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8000",
  plugins: [],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;

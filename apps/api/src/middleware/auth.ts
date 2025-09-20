import { Context, Next } from "hono";
import { auth } from "../auth";
import { getCookie } from "hono/cookie";

// Define the user and session types
type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
};

type Session = {
  id: string;
  token: string;
  expiresAt: Date;
};

// Extend Hono's Variables interface
declare module "hono" {
  interface ContextVariableMap {
    user: User | null;
    session: Session | null;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  try {
    // Try to get session from Better-Auth
    const sessionToken = getCookie(c, "better-auth.session");
    
    if (!sessionToken) {
      c.set("user", null);
      c.set("session", null);
      await next();
      return;
    }

    // Verify the session with Better-Auth
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session?.session || !session?.user) {
      c.set("user", null);
      c.set("session", null);
      await next();
      return;
    }

    // Set user and session in context
    c.set("user", session.user as User);
    c.set("session", session.session as Session);
  } catch (error) {
    console.error("Auth middleware error:", error);
    c.set("user", null);
    c.set("session", null);
  }

  await next();
}

export function requireAuth(c: Context, next: Next) {
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: "Authentication required" }, 401);
  }
  
  return next();
}

export function optionalAuth(c: Context, next: Next) {
  // Just run authMiddleware - user might be null
  return authMiddleware(c, next);
}
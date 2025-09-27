import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth, AuthType } from "./auth";
import { authMiddleware, requireAuth } from "./middleware/auth";
import { github } from "./routes/github";

const app = new Hono<{
  Variables: AuthType;
}>();

const PORT = Number(process.env.PORT) || 8000;

// Global middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// Apply auth middleware to all routes
app.use("*", authMiddleware);

// Public routes
app.get("/", async (c) => {
  return c.json({
    message: "DevPulse API",
    version: "1.0.0",
    status: "running",
  });
});

app.get("/health", async (c) => {
  const user = c.get("user");
  return c.json({
    status: "healthy",
    authenticated: !!user,
    timestamp: new Date().toISOString(),
  });
});

// Auth routes handled by Better-Auth

// Protected API routes
app.get("/api/me", requireAuth, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

// Session validation endpoint (moved to avoid conflict with Better-Auth routes)
app.get("/api/session", async (c) => {
  const user = c.get("user");
  const session = c.get("session");
  return c.json({ user, session });
});

// GitHub API routes
app.route("/api/github", github);

// Catch-all 404 handler
app.all("*", (c) => {
  return c.json({ message: "Endpoint not found" }, 404);
});

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(
      `🚀 DevPulse API server running on http://localhost:${info.port}`
    );
    console.log(
      `🔐 Better-Auth available at http://localhost:${info.port}/api/auth`
    );
  }
);

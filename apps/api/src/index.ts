import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./auth";
import { authMiddleware, requireAuth } from "./middleware/auth";

const app = new Hono();

const PORT = Number(process.env.PORT) || 8000;

// Global middleware
app.use("*", logger());
app.use("*", cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
  credentials: true,
}));

// Apply auth middleware to all routes
app.use("*", authMiddleware);

// Public routes
app.get("/", async (c) => {
  return c.json({ 
    message: "DevPulse API",
    version: "1.0.0",
    status: "running"
  });
});

app.get("/health", async (c) => {
  const user = c.get("user");
  return c.json({ 
    status: "healthy",
    authenticated: !!user,
    timestamp: new Date().toISOString()
  });
});

// Auth routes handled by Better-Auth
app.on(["POST", "GET"], "/api/auth/**", (c) => auth.handler(c.req.raw));

// Protected API routes
app.get("/api/me", requireAuth, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

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
    console.log(`🚀 DevPulse API server running on http://localhost:${info.port}`);
    console.log(`🔐 Better-Auth available at http://localhost:${info.port}/api/auth`);
  }
);

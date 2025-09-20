"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_server_1 = require("@hono/node-server");
const hono_1 = require("hono");
const cors_1 = require("hono/cors");
const logger_1 = require("hono/logger");
const auth_1 = require("./auth");
const auth_2 = require("./middleware/auth");
const app = new hono_1.Hono();
const PORT = Number(process.env.PORT) || 8000;
// Global middleware
app.use("*", (0, logger_1.logger)());
app.use("*", (0, cors_1.cors)({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: true,
}));
// Apply auth middleware to all routes
app.use("*", auth_2.authMiddleware);
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
app.on(["POST", "GET"], "/api/auth/**", (c) => auth_1.auth.handler(c.req.raw));
// Protected API routes
app.get("/api/me", auth_2.requireAuth, async (c) => {
    const user = c.get("user");
    return c.json({ user });
});
// Catch-all 404 handler
app.all("*", (c) => {
    return c.json({ message: "Endpoint not found" }, 404);
});
(0, node_server_1.serve)({
    fetch: app.fetch,
    port: PORT,
}, (info) => {
    console.log(`🚀 DevPulse API server running on http://localhost:${info.port}`);
    console.log(`🔐 Better-Auth available at http://localhost:${info.port}/api/auth`);
});

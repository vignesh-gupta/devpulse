"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireAuth = requireAuth;
exports.optionalAuth = optionalAuth;
const auth_1 = require("../auth");
const cookie_1 = require("hono/cookie");
async function authMiddleware(c, next) {
    try {
        // Try to get session from Better-Auth
        const sessionToken = (0, cookie_1.getCookie)(c, "better-auth.session");
        if (!sessionToken) {
            c.set("user", null);
            c.set("session", null);
            await next();
            return;
        }
        // Verify the session with Better-Auth
        const session = await auth_1.auth.api.getSession({
            headers: c.req.raw.headers,
        });
        if (!session?.session || !session?.user) {
            c.set("user", null);
            c.set("session", null);
            await next();
            return;
        }
        // Set user and session in context
        c.set("user", session.user);
        c.set("session", session.session);
    }
    catch (error) {
        console.error("Auth middleware error:", error);
        c.set("user", null);
        c.set("session", null);
    }
    await next();
}
function requireAuth(c, next) {
    const user = c.get("user");
    if (!user) {
        return c.json({ error: "Authentication required" }, 401);
    }
    return next();
}
function optionalAuth(c, next) {
    // Just run authMiddleware - user might be null
    return authMiddleware(c, next);
}

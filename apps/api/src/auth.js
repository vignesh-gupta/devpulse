"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const db_1 = require("@devpulse/db");
const better_auth_1 = require("better-auth");
const drizzle_1 = require("better-auth/adapters/drizzle");
require("dotenv/config");
exports.auth = (0, better_auth_1.betterAuth)({
    database: (0, drizzle_1.drizzleAdapter)(db_1.db, {
        provider: "pg",
    }),
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            scope: ["user:email", "read:user", "repo", "read:org"],
        },
    },
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8000",
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    ],
});

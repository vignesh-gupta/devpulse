# DevPulse AI Development Guidelines

DevPulse is a TypeScript monorepo building an AI-powered daily standup assistant that integrates with GitHub to generate automated developer summaries.

## Architecture Overview

**Turborepo Monorepo Structure:**
- `apps/api/` - Hono backend server with Better-Auth integration
- `apps/web/` - Next.js 15 frontend with Tailwind CSS
- `packages/db/` - Drizzle ORM with Neon Postgres
- `packages/ui/` - Shared React component library
- `packages/{eslint-config,typescript-config}/` - Shared configurations

**Key Dependencies:**
- Authentication: Better-Auth with Drizzle adapter
- Database: Neon Postgres + Drizzle ORM
- API: Hono with Node.js server
- Frontend: Next.js 15 + Tailwind CSS + Turbopack

## Development Workflows

**Package Manager:** Use `pnpm` exclusively (configured in `packageManager` field)

**Common Commands:**
```bash
# Start development servers
pnpm dev                # Runs all workspaces in dev mode
pnpm api dev           # API server only (port 8000)  
pnpm web dev           # Next.js frontend only (port 3000)

# Database operations
pnpm db:push           # Push schema changes to DB
pnpm db:studio         # Open Drizzle Studio

# Workspace filtering
pnpm --filter api <cmd>    # Run command in API workspace
pnpm --filter web <cmd>    # Run command in web workspace
```

**Build System:** Turborepo with dependency-aware task scheduling. All tasks depend on `^build` (upstream builds first).

## Critical Patterns

**Database Schema Location:** Authentication schemas in `packages/db/src/schema/auth-schema.ts` use Better-Auth's expected table structure (user, session, account, verification tables).

**Cross-Package Imports:**
- Database: `@devpulse/db` and `@devpulse/db/schema`
- UI Components: `@devpulse/ui`
- Configs: `@devpulse/eslint-config`, `@devpulse/typescript-config`

**Authentication Flow:**
- Backend: Better-Auth with Drizzle adapter (`apps/api/src/auth.ts`)
- Frontend: Better-Auth React client (`apps/web/lib/auth-client.ts`)
- Routes: `/api/auth/**` handled by Better-Auth handler

**Environment Variables:**
- `DATABASE_URL` - Neon Postgres connection
- `BETTER_AUTH_URL` - Auth service URL (defaults to localhost:8000)
- Global env vars declared in `turbo.json`

## Code Conventions

**TypeScript:** Strict mode enabled across all packages with shared configs from `@devpulse/typescript-config`.

**Database Patterns:**
- Use Drizzle's `pgTable` for schema definitions
- Connection via `neon()` serverless driver
- Export `db` from `packages/db/src/database.ts`

**API Structure:**
- Hono app with route handlers
- Better-Auth integration via `app.on(["POST", "GET"], "/api/auth/**", ...)`
- Catch-all 404 handler for undefined routes

**Frontend:**
- Next.js 15 with Turbopack in dev mode
- App Router structure in `apps/web/app/`
- Tailwind with custom fonts (Geist Sans/Mono)

## Integration Points

**Monorepo Dependencies:** Workspace packages use `workspace:*` protocol in package.json for internal dependencies.

**Database Schema Evolution:** Use `drizzle-kit` commands through the db package for migrations and schema changes.

**Auth State Management:** Better-Auth handles sessions automatically - use `authClient` from `apps/web/lib/auth-client.ts` for client-side auth operations.

## Project Context

This is **Phase 1** of building DevPulse - focused on foundation setup with authentication. The planned architecture includes GitHub API integration for fetching developer activity and OpenAI integration for generating AI summaries. Reference `AGENTS.md` for detailed development roadmap and `Product.md` for feature requirements.
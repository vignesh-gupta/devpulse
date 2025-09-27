# DevPulse Environment Configuration

## Setting up Environment Variables

### 1. API Environment (.env)
Copy `apps/api/.env.example` to `apps/api/.env` and fill in your values:

```bash
cp apps/api/.env.example apps/api/.env
```

### 2. Web Environment (.env.local)
Copy `apps/web/.env.example` to `apps/web/.env.local` and fill in your values:

```bash
cp apps/web/.env.example apps/web/.env.local
```

### 3. Required Values

#### Database (Neon Postgres)
- `DATABASE_URL`: Your Neon database connection string

#### Better-Auth
- `BETTER_AUTH_SECRET`: Generate with `openssl rand -base64 32`
- `BETTER_AUTH_URL`: API server URL (http://localhost:8000 for dev)

#### GitHub OAuth (Required for GitHub Integration)
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App with:
   - Application name: "DevPulse Development"
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:8000/api/auth/callback/github
3. Add the following scopes for repository access:
   - `repo` (Full control of private repositories)
   - `read:user` (Read user profile data)
   - `user:email` (Access user email addresses)
   - `read:org` (Read organization membership)
4. Copy the Client ID and Client Secret to your .env files:
   - `GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID
   - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret

#### Environment Variables Summary
For `apps/api/.env`:
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:8000
GITHUB_CLIENT_ID=your-github-client-id  
GITHUB_CLIENT_SECRET=your-github-client-secret
```

For `apps/web/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Development Workflow

After setting up environment variables:

```bash
# Start both servers concurrently
pnpm dev

# Or start individually:
pnpm api dev    # API server on port 8000
pnpm web dev    # Next.js on port 3000
```

### 5. Database Setup

```bash
# Push schema to database
pnpm db:push

# Open database studio
pnpm db:studio
```
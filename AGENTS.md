# 🤖 DevPulse Development Agent

This document outlines the AI-assisted development approach for building DevPulse, an AI-powered daily standup assistant for developers.

## 🏗️ Project Architecture

### Tech Stack Overview
- **Frontend**: Next.js 15 with Tailwind CSS and TypeScript
- **Backend**: Hono API with TypeScript
- **Database**: Neon Postgres with Drizzle ORM
- **Authentication**: Better-Auth (GitHub OAuth)
- **AI Integration**: OpenAI GPT-4 for summary generation
- **Monorepo**: Turborepo with pnpm workspaces
- **Deployment**: Vercel (frontend), Railway/Fly.io (backend)

### Workspace Structure
```
devpulse/
├── apps/
│   ├── api/           # Hono backend server
│   └── web/           # Next.js frontend
├── packages/
│   ├── db/            # Drizzle ORM + schemas
│   ├── ui/            # Shared React components
│   ├── eslint-config/ # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configs
```

## 🎯 Development Phases

### Phase 1: Foundation & Authentication
**Status**: 🚧 In Progress

#### Core Components
- [x] Monorepo setup with Turborepo
- [x] Basic Hono API server
- [x] Next.js frontend with Tailwind
- [x] Drizzle ORM with Neon Postgres
- [ ] Better-Auth GitHub OAuth integration
- [ ] Session management and middleware

#### Key Files to Implement
- `apps/api/src/auth.ts` - Authentication routes and middleware
- `apps/web/lib/auth-client.ts` - Client-side auth utilities
- `packages/db/src/schema/auth-schema.ts` - User and session schemas

### Phase 2: GitHub Integration
**Status**: 📋 Planned

#### API Integration Tasks
- GitHub REST API client setup
- OAuth token storage and refresh
- Data fetching for commits, PRs, and issues
- Rate limiting and error handling
- Data normalization and storage

#### Database Schema Extensions
```typescript
// Additional schemas needed
repositories (id, user_id, github_repo_id, name, full_name, private)
daily_activities (id, user_id, date, commits, pull_requests, issues)
github_tokens (id, user_id, access_token, refresh_token, expires_at)
```

### Phase 3: AI Summary Engine
**Status**: 📋 Planned

#### AI Integration Components
- OpenAI API client and prompt engineering
- Daily activity data processing
- Summary generation pipeline
- User editing and approval flow
- Summary storage and versioning

#### Prompt Strategy
```
System: You are a professional development assistant that creates concise daily standup summaries.

User Context:
- Commits: {commits_data}
- Pull Requests: {prs_data}
- Issues: {issues_data}

Generate a structured summary in this format:
- **Yesterday I worked on:** [specific tasks/features]
- **Today I'll focus on:** [planned work based on recent activity]
- **Blockers:** [any apparent issues or dependencies]
```

### Phase 4: Frontend Implementation
**Status**: 📋 Planned

#### Pages & Routes
- `/dashboard` - Main summary dashboard
- `/generate` - Trigger AI summary generation
- `/edit/[id]` - Edit generated summaries
- `/settings` - User preferences and integrations
- `/repositories` - Manage connected GitHub repos

#### Components Architecture
```
components/
├── ui/               # Shadcn UI components (shared package)
├── auth/            # Authentication components
├── dashboard/       # Dashboard-specific components
├── summary/         # Summary creation/editing
└── settings/        # Settings and preferences
```

## 🔧 Development Guidelines

### Code Standards
- **TypeScript**: Strict mode enabled across all packages
- **ESLint**: Shared configuration for consistent code style
- **Prettier**: Automatic code formatting
- **Type Safety**: Full type coverage with proper error handling

### Database Patterns
- **Drizzle ORM**: Type-safe database operations
- **Migrations**: Version-controlled schema changes
- **Connection Pooling**: Efficient database connections
- **Prepared Statements**: SQL injection prevention

### API Design Principles
- **RESTful Routes**: Consistent endpoint structure
- **Error Handling**: Standardized error responses
- **Rate Limiting**: GitHub API rate limit management
- **Caching**: Strategic caching for performance
- **Validation**: Input validation on all endpoints

### Security Considerations
- **OAuth Flow**: Secure GitHub authentication
- **Token Storage**: Encrypted token storage
- **CORS Policy**: Proper cross-origin configuration
- **Rate Limiting**: API protection
- **Input Sanitization**: XSS and injection prevention

## 🤖 AI Assistant Development Approach

### Context-Aware Development
1. **Understand Requirements**: Analyze Product.md and Plan.md for feature specifications
2. **Examine Current State**: Review existing code structure and implementations
3. **Plan Implementation**: Break down features into manageable tasks
4. **Code Generation**: Create type-safe, well-documented code
5. **Testing Strategy**: Implement comprehensive testing approach

### Task Prioritization
1. **Critical Path**: Authentication and GitHub integration first
2. **User Experience**: Frontend components that provide immediate value
3. **AI Features**: Summary generation and editing capabilities
4. **Optimization**: Performance improvements and caching
5. **Nice-to-Have**: Advanced features and integrations

### Quality Assurance
- **Type Safety**: Ensure all TypeScript interfaces are properly defined
- **Error Handling**: Implement comprehensive error boundaries
- **Performance**: Optimize database queries and API calls
- **Security**: Follow security best practices throughout
- **Documentation**: Maintain clear documentation for all features

## 📋 Development Checklist

### Authentication & Core Setup
- [ ] Complete Better-Auth GitHub OAuth setup
- [ ] Implement user session management
- [ ] Create user onboarding flow
- [ ] Set up protected routes and middleware

### GitHub Integration
- [ ] GitHub App/OAuth application setup
- [ ] Repository connection and management
- [ ] Activity fetching (commits, PRs, issues)
- [ ] Webhook integration for real-time updates
- [ ] Data normalization and storage

### AI Summary Generation
- [ ] OpenAI API integration and configuration
- [ ] Prompt engineering and testing
- [ ] Summary generation pipeline
- [ ] User review and editing interface
- [ ] Summary history and versioning

### Frontend Development
- [ ] Dashboard with summary timeline
- [ ] Repository management interface
- [ ] Summary generation and editing UI
- [ ] Settings and preferences panel
- [ ] Mobile-responsive design

### Export & Integration Features
- [ ] Slack webhook integration
- [ ] Email summary delivery
- [ ] Markdown export functionality
- [ ] Copy-to-clipboard features
- [ ] Schedule automation (future)

## 🚀 Deployment Strategy

### Development Environment
- **Local Development**: Docker Compose for complete stack
- **Database**: Neon Postgres development instance
- **API Testing**: Insomnia/Postman collections
- **Environment Variables**: Properly configured .env files

### Production Deployment
- **Frontend**: Vercel deployment with automatic builds
- **Backend**: Railway or Fly.io for Hono API server
- **Database**: Neon Postgres production instance
- **Monitoring**: Error tracking and performance monitoring

### CI/CD Pipeline
- **GitHub Actions**: Automated testing and deployment
- **Type Checking**: Ensure type safety in CI
- **Linting**: Enforce code standards
- **Testing**: Unit and integration tests
- **Security Scanning**: Dependency vulnerability checks

## 📝 Notes for AI Development Assistant

When implementing features:

1. **Always check existing code** before creating new implementations
2. **Follow the established patterns** in the codebase
3. **Ensure type safety** with proper TypeScript interfaces
4. **Handle errors gracefully** with user-friendly messages
5. **Consider performance implications** of database queries and API calls
6. **Test integration points** between packages and services
7. **Document complex logic** for future maintenance
8. **Follow security best practices** especially for authentication flows

### Current Development Focus

The project is in the early setup phase with the basic monorepo structure established. The immediate priorities are:

1. Complete the authentication system with Better-Auth
2. Implement GitHub API integration
3. Create the basic dashboard UI
4. Set up the AI summary generation pipeline

Each phase should be completed thoroughly before moving to the next, ensuring a solid foundation for the DevPulse platform.
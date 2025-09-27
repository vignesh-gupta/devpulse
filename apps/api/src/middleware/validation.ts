import type { Context, Next } from 'hono';
import { auth, AuthType } from '../auth';

/**
 * Authentication middleware
 * Verifies user session and adds user to context
 */
export const requireAuth = async (c: Context<{ Variables: AuthType }>, next: Next) => {
  try {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    c.set('user', session.user);
    c.set('session', session.session);
    
    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

/**
 * Error handling middleware
 * Catches and formats errors consistently
 */
export const errorHandler = async (c: Context, next: Next) => {
  try {
    await next();
  } catch (error) {
    console.error('Request error:', error);
    
    // Check if it's a custom error with status code
    if (error instanceof Error && 'status' in error) {
      const status = (error as any).status || 500;
      return c.json({ error: error.message }, status);
    }
    
    // Default error response
    return c.json({ error: 'Internal server error' }, 500);
  }
};

/**
 * Request validation middleware
 * Validates request parameters and body
 */
export const validateRequest = (validators: {
  params?: (params: any) => boolean;
  query?: (query: any) => boolean;
  body?: (body: any) => boolean;
}) => {
  return async (c: Context, next: Next) => {
    try {
      // Validate parameters
      if (validators.params) {
        const params = c.req.param();
        if (!validators.params(params)) {
          return c.json({ error: 'Invalid request parameters' }, 400);
        }
      }

      // Validate query parameters
      if (validators.query) {
        const query = c.req.query();
        if (!validators.query(query)) {
          return c.json({ error: 'Invalid query parameters' }, 400);
        }
      }

      // Validate request body
      if (validators.body) {
        try {
          const body = await c.req.json();
          if (!validators.body(body)) {
            return c.json({ error: 'Invalid request body' }, 400);
          }
        } catch (error) {
          return c.json({ error: 'Invalid JSON in request body' }, 400);
        }
      }

      return next();
    } catch (error) {
      console.error('Validation error:', error);
      return c.json({ error: 'Request validation failed' }, 400);
    }
  };
};

/**
 * Rate limiting middleware (simple implementation)
 * Prevents abuse by limiting requests per user
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (options: {
  windowMs: number;
  maxRequests: number;
}) => {
  return async (c: Context<{ Variables: AuthType }>, next: Next) => {
    const user = c.get('user');
    
    if (!user?.id) {
      return c.json({ error: 'Authentication required for rate limiting' }, 401);
    }

    const now = Date.now();
    const userKey = user.id;
    const userLimit = rateLimitStore.get(userKey);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset or initialize rate limit
      rateLimitStore.set(userKey, {
        count: 1,
        resetTime: now + options.windowMs,
      });
      return next();
    }

    if (userLimit.count >= options.maxRequests) {
      const resetIn = Math.ceil((userLimit.resetTime - now) / 1000);
      return c.json(
        { 
          error: 'Rate limit exceeded',
          resetIn: `${resetIn} seconds`,
        },
        429
      );
    }

    // Increment count
    userLimit.count++;
    rateLimitStore.set(userKey, userLimit);

    return next();
  };
};

/**
 * CORS middleware for API routes
 */
export const cors = async (c: Context, next: Next) => {
  // Set CORS headers
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (c.req.method === 'OPTIONS') {
    return new Response('', { status: 204 });
  }

  return next();
};

/**
 * Request logging middleware
 */
export const logger = async (c: Context, next: Next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  
  await next();
  
  const duration = Date.now() - start;
  const status = c.res.status;
  
  console.log(`${method} ${path} ${status} - ${duration}ms`);
};

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * GitHub-specific validation helpers
 */
export const githubValidators = {
  /**
   * Validate repository connection parameters
   */
  repositoryConnect: (params: any) => {
    return (
      params.owner &&
      params.repo &&
      typeof params.owner === 'string' &&
      typeof params.repo === 'string' &&
      params.owner.length > 0 &&
      params.repo.length > 0
    );
  },

  /**
   * Validate repository ID parameter
   */
  repositoryId: (params: any) => {
    return (
      params.id &&
      typeof params.id === 'string' &&
      params.id.length > 0
    );
  },

  /**
   * Validate date parameter
   */
  dateParam: (params: any) => {
    return (
      params.date &&
      typeof params.date === 'string' &&
      !isNaN(Date.parse(params.date))
    );
  },

  /**
   * Validate sync request body
   */
  syncBody: (body: any) => {
    return (
      body &&
      body.date &&
      typeof body.date === 'string' &&
      !isNaN(Date.parse(body.date))
    );
  },

  /**
   * Validate token storage body
   */
  tokenBody: (body: any) => {
    return (
      body &&
      body.accessToken &&
      typeof body.accessToken === 'string' &&
      body.accessToken.length > 0
    );
  },

  /**
   * Validate activities query parameters
   */
  activitiesQuery: (query: any) => {
    if (!query.limit) return true; // limit is optional
    
    const limit = parseInt(query.limit, 10);
    return !isNaN(limit) && limit >= 1 && limit <= 100;
  },
};
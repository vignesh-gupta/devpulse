import { Hono } from "hono";
import { AuthType } from "../auth";
import githubController from "../controllers/github.controller";
import {
  requireAuth,
  errorHandler,
  validateRequest,
  rateLimit,
  cors,
  logger,
  githubValidators,
} from "../middleware/validation";

const github = new Hono<{
  Variables: AuthType;
}>();

// Global middleware
github.use("*", cors);
github.use("*", logger);
github.use("*", errorHandler);

// Rate limiting for API endpoints
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each user to 100 requests per windowMs
});

// Route definitions with validation
github.get("/status", requireAuth, apiRateLimit, (c) =>
  githubController.getStatus(c)
);

github.get("/repositories", requireAuth, apiRateLimit, (c) =>
  githubController.getRepositories(c)
);

github.post(
  "/repositories/:owner/:repo/connect",
  requireAuth,
  apiRateLimit,
  validateRequest({ params: githubValidators.repositoryConnect }),
  (c) => githubController.connectRepository(c)
);

github.post(
  "/repositories/:id/disconnect",
  requireAuth,
  apiRateLimit,
  validateRequest({ params: githubValidators.repositoryId }),
  (c) => githubController.disconnectRepository(c)
);

github.post(
  "/sync",
  requireAuth,
  apiRateLimit,
  validateRequest({ body: githubValidators.syncBody }),
  (c) => githubController.syncData(c)
);

github.get(
  "/activity/:date",
  requireAuth,
  apiRateLimit,
  validateRequest({ params: githubValidators.dateParam }),
  (c) => githubController.getDailyActivity(c)
);

github.get(
  "/activities",
  requireAuth,
  apiRateLimit,
  validateRequest({ query: githubValidators.activitiesQuery }),
  (c) => githubController.getRecentActivities(c)
);

github.post("/token/validate", requireAuth, apiRateLimit, (c) =>
  githubController.validateToken(c)
);

github.post(
  "/token",
  requireAuth,
  apiRateLimit,
  validateRequest({ body: githubValidators.tokenBody }),
  (c) => githubController.storeToken(c)
);

github.delete("/disconnect", requireAuth, apiRateLimit, (c) =>
  githubController.disconnectGitHub(c)
);

export { github };

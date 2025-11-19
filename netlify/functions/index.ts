import express from "express";
import serverless from "serverless-http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "../../server/_core/oauth";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

const app = express();

// Configure body parser with larger size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// OAuth callback under /api/oauth/callback
registerOAuthRoutes(app);

// User management routes
import usersRouter from '../../server/routes/users';
app.use('/api/users', usersRouter);

// tRPC API
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Export handler for Netlify Functions
export const handler = serverless(app);

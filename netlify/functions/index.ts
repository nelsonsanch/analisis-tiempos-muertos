import express from "express";
import serverless from "serverless-http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

const app = express();

// Configure body parser with larger size limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// tRPC API - this is the main route for AI buttons
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Export handler for Netlify Functions
export const handler = serverless(app);

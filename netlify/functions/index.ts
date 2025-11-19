import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";
import { createContext } from "../../server/_core/context";

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Only handle tRPC routes
  if (!event.path.startsWith("/api/trpc")) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Not found" }),
    };
  }

  // Convert Netlify event to Fetch Request
  const url = new URL(event.path, `https://${event.headers.host}`);
  if (event.queryStringParameters) {
    Object.entries(event.queryStringParameters).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  const request = new Request(url.toString(), {
    method: event.httpMethod,
    headers: new Headers(event.headers as Record<string, string>),
    body: event.body ? event.body : undefined,
  });

  try {
    // Use tRPC fetch adapter
    const response = await fetchRequestHandler({
      endpoint: "/api/trpc",
      req: request,
      router: appRouter,
      createContext: async () => {
        // Create context from Netlify event
        return createContext({
          req: {
            headers: event.headers,
            method: event.httpMethod,
            url: event.path,
          } as any,
          res: {} as any,
        });
      },
    });

    // Convert Fetch Response to Netlify response
    const body = await response.text();
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      statusCode: response.status,
      headers,
      body,
    };
  } catch (error) {
    console.error("Error handling tRPC request:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};

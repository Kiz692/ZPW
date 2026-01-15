/**
 * Tenant Context Middleware
 * Extracts tenant ID from JWT or header and adds to request context
 */

import type { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    tenantId?: number;
    userId?: number;
  }
}

/**
 * Extract tenant ID from request
 * Priority: JWT token > X-Tenant-ID header > default tenant (dev only)
 */
export async function tenantMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  // TODO: Extract from JWT token when auth is fully implemented
  // For now, use header or default to tenant 1 in development
  const tenantIdHeader = request.headers["x-tenant-id"];

  if (tenantIdHeader) {
    const tenantId = Number(tenantIdHeader);
    if (!isNaN(tenantId) && tenantId > 0) {
      request.tenantId = tenantId;
      return;
    }
  }

  // In development, default to tenant 1 if SKIP_AUTH is enabled
  // In production, this should fail
  if (
    process.env.SKIP_AUTH === "true" &&
    process.env.NODE_ENV === "development"
  ) {
    request.tenantId = 1;
    return;
  }

  // If no tenant ID found and auth is required, return 401
  if (process.env.SKIP_AUTH !== "true") {
    return reply.status(401).send({
      error: "Unauthorized",
      message:
        "Tenant ID required. Provide X-Tenant-ID header or valid JWT token.",
    });
  }
}

/**
 * Require tenant context - throws if tenant ID is not set
 */
export function requireTenant(request: FastifyRequest): number {
  if (!request.tenantId) {
    throw new Error("Tenant ID is required but not found in request context");
  }
  return request.tenantId;
}

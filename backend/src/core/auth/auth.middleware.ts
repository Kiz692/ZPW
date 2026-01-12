/**
 * Authentication Middleware
 * Handles JWT validation and user context extraction
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { env } from '../config/env.js';

/**
 * Authentication middleware
 * Validates JWT token and extracts user context
 */
export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Skip auth if SKIP_AUTH is enabled (development only)
  if (env.skipAuth && env.nodeEnv === 'development') {
    // Set default user ID for development
    request.userId = 1;
    return;
  }

  // TODO: Implement JWT validation when auth is fully implemented
  // For now, require X-User-ID header in non-dev environments
  const userIdHeader = request.headers['x-user-id'];
  
  if (userIdHeader) {
    const userId = Number(userIdHeader);
    if (!isNaN(userId) && userId > 0) {
      request.userId = userId;
      return;
    }
  }

  // If auth is required and no user ID found, return 401
  return reply.status(401).send({
    error: 'Unauthorized',
    message: 'Authentication required. Provide valid JWT token or X-User-ID header.',
  });
}

/**
 * Require user context - throws if user ID is not set
 */
export function requireUser(request: FastifyRequest): number {
  if (!request.userId) {
    throw new Error('User ID is required but not found in request context');
  }
  return request.userId;
}

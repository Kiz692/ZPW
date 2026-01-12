/**
 * Status History Routes
 * API routes for status history (read-only, auto-created)
 */

import type { FastifyInstance } from 'fastify';
import { StatusHistoryService } from '../services/status-history.service.js';
import { statusHistoryQuerySchema } from '../schemas/status-history.schemas.js';
import { requireTenant } from '../../../core/auth/tenant.middleware.js';

export async function registerStatusHistoryRoutes(app: FastifyInstance) {
  const statusHistoryService = new StatusHistoryService();

  // Note: GET /employees/:id/status-history is handled in employee.routes.ts
  // This route file only handles direct status history access by ID

  app.get(
    '/status-history/:id',
    {
      schema: {
        description: 'Get status history by ID',
        tags: ['People Core - Status History'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const history = await statusHistoryService.getById(Number(request.params.id), tenantId);
        return reply.send(history);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );
}

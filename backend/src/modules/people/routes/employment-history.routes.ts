/**
 * Employment History Routes
 * API routes for employment history management
 */

import type { FastifyInstance } from 'fastify';
import { EmploymentHistoryService } from '../services/employment-history.service.js';
import { employmentHistoryCreateSchema, employmentHistoryUpdateSchema } from '../schemas/employment-history.schemas.js';
import { requireUser } from '../../../core/auth/auth.middleware.js';

export async function registerEmploymentHistoryRoutes(app: FastifyInstance) {
  const historyService = new EmploymentHistoryService();

  app.post(
    '/persons/:personId/employment-history',
    {
      schema: {
        description: 'Create employment history',
        tags: ['People Core - Employment History'],
        params: { type: 'object', properties: { personId: { type: 'number' } } },
        body: employmentHistoryCreateSchema,
      },
    },
    async (request: any, reply) => {
      try {
        const userId = requireUser(request);
        const history = await historyService.create(
          { ...request.body, pehPerId: Number(request.params.personId) } as any,
          userId
        );
        return reply.status(201).send(history);
      } catch (error: any) {
        if (error.message.includes('date') || error.message.includes('required')) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.get(
    '/persons/:personId/employment-history',
    {
      schema: {
        description: 'Get employment history for person',
        tags: ['People Core - Employment History'],
        params: { type: 'object', properties: { personId: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      const history = await historyService.getByPersonId(Number(request.params.personId));
      return reply.send(history);
    }
  );

  app.get(
    '/employment-history/:id',
    {
      schema: {
        description: 'Get employment history by ID',
        tags: ['People Core - Employment History'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const history = await historyService.getById(Number(request.params.id));
        return reply.send(history);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.put(
    '/employment-history/:id',
    {
      schema: {
        description: 'Update employment history',
        tags: ['People Core - Employment History'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
        body: employmentHistoryUpdateSchema,
      },
    },
    async (request: any, reply) => {
      try {
        const userId = requireUser(request);
        const history = await historyService.update(Number(request.params.id), request.body as any, userId);
        return reply.send(history);
      } catch (error: any) {
        if (error.message.includes('not found') || error.message.includes('date')) {
          return reply.status(error.message.includes('not found') ? 404 : 400).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.delete(
    '/employment-history/:id',
    {
      schema: {
        description: 'Soft delete employment history',
        tags: ['People Core - Employment History'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const userId = requireUser(request);
        await historyService.delete(Number(request.params.id), userId);
        return reply.send({ success: true });
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );
}

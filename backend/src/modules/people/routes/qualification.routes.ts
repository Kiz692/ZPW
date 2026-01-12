/**
 * Qualification Routes
 * API routes for qualification management
 */

import type { FastifyInstance } from 'fastify';
import { QualificationService } from '../services/qualification.service.js';
import { qualificationCreateSchema, qualificationUpdateSchema } from '../schemas/qualification.schemas.js';
import { requireUser } from '../../../core/auth/auth.middleware.js';

export async function registerQualificationRoutes(app: FastifyInstance) {
  const qualificationService = new QualificationService();

  app.post(
    '/persons/:personId/qualifications',
    {
      schema: {
        description: 'Create qualification',
        tags: ['People Core - Qualification'],
        params: { type: 'object', properties: { personId: { type: 'number' } } },
        body: qualificationCreateSchema,
      },
    },
    async (request: any, reply) => {
      try {
        const userId = requireUser(request);
        const qualification = await qualificationService.create(
          { ...request.body, qlfPerId: Number(request.params.personId) } as any,
          userId
        );
        return reply.status(201).send(qualification);
      } catch (error: any) {
        if (error.message.includes('required')) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.get(
    '/persons/:personId/qualifications',
    {
      schema: {
        description: 'Get qualifications for person',
        tags: ['People Core - Qualification'],
        params: { type: 'object', properties: { personId: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      const qualifications = await qualificationService.getByPersonId(Number(request.params.personId));
      return reply.send(qualifications);
    }
  );

  app.get(
    '/qualifications/:id',
    {
      schema: {
        description: 'Get qualification by ID',
        tags: ['People Core - Qualification'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const qualification = await qualificationService.getById(Number(request.params.id));
        return reply.send(qualification);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.put(
    '/qualifications/:id',
    {
      schema: {
        description: 'Update qualification',
        tags: ['People Core - Qualification'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
        body: qualificationUpdateSchema,
      },
    },
    async (request: any, reply) => {
      try {
        const userId = requireUser(request);
        const qualification = await qualificationService.update(Number(request.params.id), request.body as any, userId);
        return reply.send(qualification);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.delete(
    '/qualifications/:id',
    {
      schema: {
        description: 'Soft delete qualification',
        tags: ['People Core - Qualification'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const userId = requireUser(request);
        await qualificationService.delete(Number(request.params.id), userId);
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

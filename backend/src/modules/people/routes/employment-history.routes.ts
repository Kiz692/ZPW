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
        body: {
          type: 'object',
          required: ['pehEmployerName'],
          properties: {
            pehEmployerName: { type: 'string', minLength: 1, maxLength: 255 },
            pehRoleTitle: { type: 'string', maxLength: 255 },
            pehStartDate: { type: 'string', format: 'date' },
            pehEndDate: { type: 'string', format: 'date' },
            pehSummary: { type: 'string' },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            employmentHistoryCreateSchema.parse({ ...request.body, pehPerId: Number(request.params.personId) });
          } catch (error: any) {
            if (error.name === 'ZodError') {
              return reply.status(400).send({ 
                error: 'Validation error',
                details: error.errors 
              });
            }
            throw error;
          }
        },
      },
    },
    async (request: any, reply) => {
      try {
        const userId = requireUser(request);
        const validatedBody = employmentHistoryCreateSchema.parse({ ...request.body, pehPerId: Number(request.params.personId) });
        const history = await historyService.create(validatedBody, userId);
        return reply.status(201).send(history);
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return reply.status(400).send({ 
            error: 'Validation error',
            details: error.errors 
          });
        }
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
        body: {
          type: 'object',
          properties: {
            pehEmployerName: { type: 'string', minLength: 1, maxLength: 255 },
            pehRoleTitle: { type: 'string', maxLength: 255 },
            pehStartDate: { type: 'string', format: 'date' },
            pehEndDate: { type: 'string', format: 'date' },
            pehSummary: { type: 'string' },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            employmentHistoryUpdateSchema.parse(request.body);
          } catch (error: any) {
            if (error.name === 'ZodError') {
              return reply.status(400).send({ 
                error: 'Validation error',
                details: error.errors 
              });
            }
            throw error;
          }
        },
      },
    },
    async (request: any, reply) => {
      try {
        const userId = requireUser(request);
        const validatedBody = employmentHistoryUpdateSchema.parse(request.body);
        const history = await historyService.update(Number(request.params.id), validatedBody, userId);
        return reply.send(history);
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return reply.status(400).send({ 
            error: 'Validation error',
            details: error.errors 
          });
        }
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

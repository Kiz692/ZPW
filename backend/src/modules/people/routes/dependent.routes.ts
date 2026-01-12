/**
 * Dependent Routes
 * API routes for dependent management
 */

import type { FastifyInstance } from 'fastify';
import { DependentService } from '../services/dependent.service.js';
import { dependentCreateSchema, dependentUpdateSchema } from '../schemas/dependent.schemas.js';
import { requireTenant } from '../../../core/auth/tenant.middleware.js';
import { requireUser } from '../../../core/auth/auth.middleware.js';

export async function registerDependentRoutes(app: FastifyInstance) {
  const dependentService = new DependentService();

  app.post(
    '/employees/:employeeId/dependents',
    {
      schema: {
        description: 'Create dependent',
        tags: ['People Core - Dependent'],
        params: { type: 'object', properties: { employeeId: { type: 'number' } } },
        body: {
          type: 'object',
          required: ['depName', 'depRelationshipCode'],
          properties: {
            depName: { type: 'string', minLength: 1, maxLength: 255 },
            depRelationshipCode: { type: 'string' },
            depDateOfBirth: { type: 'string', format: 'date' },
            depIncludedInHealthCover: { type: 'boolean' },
            depWellnessEligible: { type: 'boolean' },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            dependentCreateSchema.parse({ ...request.body, depTenantId: 1, depEmpId: Number(request.params.employeeId) });
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
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        const validatedBody = dependentCreateSchema.parse({ ...request.body, depTenantId: tenantId, depEmpId: Number(request.params.employeeId) });
        const dependent = await dependentService.create(validatedBody, userId);
        return reply.status(201).send(dependent);
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return reply.status(400).send({ 
            error: 'Validation error',
            details: error.errors 
          });
        }
        if (error.message.includes('required')) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.get(
    '/employees/:employeeId/dependents',
    {
      schema: {
        description: 'Get dependents for employee',
        tags: ['People Core - Dependent'],
        params: { type: 'object', properties: { employeeId: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      const tenantId = requireTenant(request);
      const dependents = await dependentService.getByEmployeeId(Number(request.params.employeeId), tenantId);
      return reply.send(dependents);
    }
  );

  app.get(
    '/dependents/:id',
    {
      schema: {
        description: 'Get dependent by ID',
        tags: ['People Core - Dependent'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const dependent = await dependentService.getById(Number(request.params.id), tenantId);
        return reply.send(dependent);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.put(
    '/dependents/:id',
    {
      schema: {
        description: 'Update dependent',
        tags: ['People Core - Dependent'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
        body: {
          type: 'object',
          properties: {
            depName: { type: 'string', minLength: 1, maxLength: 255 },
            depRelationshipCode: { type: 'string' },
            depDateOfBirth: { type: 'string', format: 'date' },
            depIncludedInHealthCover: { type: 'boolean' },
            depWellnessEligible: { type: 'boolean' },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            dependentUpdateSchema.parse(request.body);
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
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        const validatedBody = dependentUpdateSchema.parse(request.body);
        const dependent = await dependentService.update(Number(request.params.id), validatedBody, tenantId, userId);
        return reply.send(dependent);
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return reply.status(400).send({ 
            error: 'Validation error',
            details: error.errors 
          });
        }
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.delete(
    '/dependents/:id',
    {
      schema: {
        description: 'Soft delete dependent',
        tags: ['People Core - Dependent'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        await dependentService.delete(Number(request.params.id), tenantId, userId);
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

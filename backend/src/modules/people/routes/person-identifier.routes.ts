/**
 * Person Identifier Routes
 * API routes for person identifier management
 */

import type { FastifyInstance } from 'fastify';
import { PersonIdentifierService } from '../services/person-identifier.service.js';
import { personIdentifierCreateSchema, personIdentifierUpdateSchema } from '../schemas/person-identifier.schemas.js';
import { requireUser } from '../../../core/auth/auth.middleware.js';

export async function registerPersonIdentifierRoutes(app: FastifyInstance) {
  const identifierService = new PersonIdentifierService();

  app.post(
    '/persons/:personId/identifiers',
    {
      schema: {
        description: 'Create person identifier',
        tags: ['People Core - Person Identifier'],
        params: { type: 'object', properties: { personId: { type: 'number' } } },
        body: {
          type: 'object',
          properties: {
            idnIdentifierTypeCode: { type: 'string' },
            idnIdentifierValue: { type: 'string', minLength: 1, maxLength: 255 },
            idnCountryCode: { type: 'string', maxLength: 10 },
            idnIssueDate: { type: 'string', format: 'date' },
            idnExpiryDate: { type: 'string', format: 'date' },
            idnIssuingAuthority: { type: 'string', maxLength: 255 },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            personIdentifierCreateSchema.parse({ ...request.body, idnPerId: Number(request.params.personId) });
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
        const validatedBody = personIdentifierCreateSchema.parse({ ...request.body, idnPerId: Number(request.params.personId) });
        const identifier = await identifierService.create(validatedBody, userId);
        return reply.status(201).send(identifier);
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return reply.status(400).send({ 
            error: 'Validation error',
            details: error.errors 
          });
        }
        if (error.message.includes('already exists') || error.message.includes('date')) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.get(
    '/persons/:personId/identifiers',
    {
      schema: {
        description: 'Get identifiers for person',
        tags: ['People Core - Person Identifier'],
        params: { type: 'object', properties: { personId: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      const identifiers = await identifierService.getByPersonId(Number(request.params.personId));
      return reply.send(identifiers);
    }
  );

  app.get(
    '/identifiers/:id',
    {
      schema: {
        description: 'Get identifier by ID',
        tags: ['People Core - Person Identifier'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const identifier = await identifierService.getById(Number(request.params.id));
        return reply.send(identifier);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.put(
    '/identifiers/:id',
    {
      schema: {
        description: 'Update identifier',
        tags: ['People Core - Person Identifier'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
        body: {
          type: 'object',
          properties: {
            idnIdentifierTypeCode: { type: 'string' },
            idnIdentifierValue: { type: 'string', minLength: 1, maxLength: 255 },
            idnCountryCode: { type: 'string', maxLength: 10 },
            idnIssueDate: { type: 'string', format: 'date' },
            idnExpiryDate: { type: 'string', format: 'date' },
            idnIssuingAuthority: { type: 'string', maxLength: 255 },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            personIdentifierUpdateSchema.parse(request.body);
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
        const validatedBody = personIdentifierUpdateSchema.parse(request.body);
        const identifier = await identifierService.update(Number(request.params.id), validatedBody, userId);
        return reply.send(identifier);
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return reply.status(400).send({ 
            error: 'Validation error',
            details: error.errors 
          });
        }
        if (error.message.includes('not found') || error.message.includes('already exists')) {
          return reply.status(error.message.includes('not found') ? 404 : 400).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.delete(
    '/identifiers/:id',
    {
      schema: {
        description: 'Soft delete identifier',
        tags: ['People Core - Person Identifier'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const userId = requireUser(request);
        await identifierService.delete(Number(request.params.id), userId);
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

/**
 * Person Routes
 * API routes for person management
 */

import type { FastifyInstance } from 'fastify';
import { PersonService } from '../services/person.service.js';
import {
  personCreateSchema,
  personUpdateSchema,
  personQuerySchema,
} from '../schemas/person.schemas.js';
import { requireUser } from '../../../core/auth/auth.middleware.js';
import { requireTenant } from '../../../core/auth/tenant.middleware.js';

export async function registerPersonRoutes(app: FastifyInstance) {
  const personService = new PersonService();

  // Create person
  app.post(
    '/persons',
    {
      schema: {
        description: 'Create a new person',
        tags: ['People Core - Person'],
        body: {
          type: 'object',
          required: ['perFirstName', 'perLastName'],
          properties: {
            perFirstName: { type: 'string', minLength: 1, maxLength: 100 },
            perLastName: { type: 'string', minLength: 1, maxLength: 150 },
            perMiddleName: { type: 'string', maxLength: 100 },
            perDisplayName: { type: 'string', maxLength: 255 },
            perGenderCode: { type: 'string', maxLength: 50 },
            perDateOfBirth: { type: 'string', format: 'date' },
            perNationalityCode: { type: 'string', maxLength: 10 },
          },
        },
        response: {
          201: {
            description: 'Person created successfully',
            type: 'object',
          },
          400: {
            description: 'Validation error',
            type: 'object',
          },
        },
      },
      preValidation: async (request: any, reply: any) => {
        try {
          // Validate with Zod schema for stricter validation
          personCreateSchema.parse(request.body);
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
    async (request, reply) => {
      try {
        const userId = requireUser(request);
        const validatedBody = personCreateSchema.parse(request.body);
        const person = await personService.create(validatedBody, userId);
        return reply.status(201).send(person);
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

  // Get person by ID
  app.get(
    '/persons/:id',
    {
      schema: {
        description: 'Get person by ID',
        tags: ['People Core - Person'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        response: {
          200: {
            description: 'Person found',
            type: 'object',
          },
          404: {
            description: 'Person not found',
            type: 'object',
          },
        },
      },
    },
    async (request: any, reply) => {
      try {
        const person = await personService.getById(Number(request.params.id));
        return reply.send(person);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  // List/search persons
  app.get(
    '/persons',
    {
      schema: {
        description: 'List or search persons',
        tags: ['People Core - Person'],
        querystring: {
          type: 'object',
          properties: {
            search: { type: 'string', minLength: 2 },
            limit: { type: 'number', minimum: 1, maximum: 100 },
            offset: { type: 'number', minimum: 0 },
          },
        },
        response: {
          200: {
            description: 'List of persons',
            type: 'array',
          },
        },
      },
    },
    async (request: any, reply) => {
      try {
        const query = personQuerySchema.parse(request.query);
        if (query.search) {
          const persons = await personService.searchByName(query.search, query.limit);
          return reply.send(persons);
        } else {
          const persons = await personService.list(query.limit, query.offset);
          return reply.send(persons);
        }
      } catch (error: any) {
        if (error.message.includes('must be at least')) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  // Update person
  app.put(
    '/persons/:id',
    {
      schema: {
        description: 'Update person',
        tags: ['People Core - Person'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        body: {
          type: 'object',
          properties: {
            perFirstName: { type: 'string', minLength: 1, maxLength: 100 },
            perLastName: { type: 'string', minLength: 1, maxLength: 150 },
            perMiddleName: { type: 'string', maxLength: 100 },
            perDisplayName: { type: 'string', maxLength: 255 },
            perGenderCode: { type: 'string', maxLength: 50 },
            perDateOfBirth: { type: 'string', format: 'date' },
            perNationalityCode: { type: 'string', maxLength: 10 },
          },
        },
        response: {
          200: {
            description: 'Person updated successfully',
            type: 'object',
          },
          404: {
            description: 'Person not found',
            type: 'object',
          },
        },
      },
    },
    async (request: any, reply) => {
      try {
        const userId = requireUser(request);
        const person = await personService.update(Number(request.params.id), request.body as any, userId);
        return reply.send(person);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  // Soft delete person
  app.delete(
    '/persons/:id',
    {
      schema: {
        description: 'Soft delete person',
        tags: ['People Core - Person'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        response: {
          200: {
            description: 'Person deleted successfully',
            type: 'object',
          },
          404: {
            description: 'Person not found',
            type: 'object',
          },
        },
      },
    },
    async (request: any, reply) => {
      try {
        const userId = requireUser(request);
        await personService.delete(Number(request.params.id), userId);
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

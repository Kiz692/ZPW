/**
 * Person Contact Routes
 * API routes for person contact management
 */

import type { FastifyInstance } from 'fastify';
import { PersonContactService } from '../services/person-contact.service.js';
import { personContactCreateSchema, personContactUpdateSchema } from '../schemas/person-contact.schemas.js';
import { requireUser } from '../../../core/auth/auth.middleware.js';

export async function registerPersonContactRoutes(app: FastifyInstance) {
  const contactService = new PersonContactService();

  app.post(
    '/persons/:personId/contacts',
    {
      schema: {
        description: 'Create person contact',
        tags: ['People Core - Person Contact'],
        params: { type: 'object', properties: { personId: { type: 'number' } } },
        body: {
          type: 'object',
          properties: {
            pcoContactTypeCode: { type: 'string', enum: ['EMAIL', 'MOBILE', 'PHONE', 'ADDRESS', 'OTHER'] },
            pcoContactValue: { type: 'string', minLength: 1, maxLength: 255 },
            pcoIsPrimary: { type: 'boolean' },
            pcoLabel: { type: 'string', maxLength: 50 },
            pcoCountryCode: { type: 'string', maxLength: 10 },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            personContactCreateSchema.parse({ ...request.body, pcoPerId: Number(request.params.personId) });
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
        const validatedBody = personContactCreateSchema.parse({ ...request.body, pcoPerId: Number(request.params.personId) });
        const contact = await contactService.create(validatedBody, userId);
        return reply.status(201).send(contact);
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return reply.status(400).send({ 
            error: 'Validation error',
            details: error.errors 
          });
        }
        if (error.message.includes('Invalid') || error.message.includes('required')) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.get(
    '/persons/:personId/contacts',
    {
      schema: {
        description: 'Get contacts for person',
        tags: ['People Core - Person Contact'],
        params: { type: 'object', properties: { personId: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      const contacts = await contactService.getByPersonId(Number(request.params.personId));
      return reply.send(contacts);
    }
  );

  app.get(
    '/contacts/:id',
    {
      schema: {
        description: 'Get contact by ID',
        tags: ['People Core - Person Contact'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const contact = await contactService.getById(Number(request.params.id));
        return reply.send(contact);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.put(
    '/contacts/:id',
    {
      schema: {
        description: 'Update contact',
        tags: ['People Core - Person Contact'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
        body: {
          type: 'object',
          properties: {
            pcoContactTypeCode: { type: 'string', enum: ['EMAIL', 'MOBILE', 'PHONE', 'ADDRESS', 'OTHER'] },
            pcoContactValue: { type: 'string', minLength: 1, maxLength: 255 },
            pcoIsPrimary: { type: 'boolean' },
            pcoLabel: { type: 'string', maxLength: 50 },
            pcoCountryCode: { type: 'string', maxLength: 10 },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            personContactUpdateSchema.parse(request.body);
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
        const validatedBody = personContactUpdateSchema.parse(request.body);
        const contact = await contactService.update(Number(request.params.id), validatedBody, userId);
        return reply.send(contact);
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return reply.status(400).send({ 
            error: 'Validation error',
            details: error.errors 
          });
        }
        if (error.message.includes('not found') || error.message.includes('Invalid')) {
          return reply.status(error.message.includes('not found') ? 404 : 400).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.delete(
    '/contacts/:id',
    {
      schema: {
        description: 'Soft delete contact',
        tags: ['People Core - Person Contact'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const userId = requireUser(request);
        await contactService.delete(Number(request.params.id), userId);
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

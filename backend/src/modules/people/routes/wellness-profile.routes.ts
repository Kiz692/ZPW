/**
 * Wellness Profile Routes
 * API routes for wellness profile management (upsert pattern)
 */

import type { FastifyInstance } from 'fastify';
import { WellnessProfileService } from '../services/wellness-profile.service.js';
import {
  wellnessProfileUpsertSchema,
  wellnessProfileUpdateSchema,
  wellnessProfileConsentUpdateSchema,
} from '../schemas/wellness-profile.schemas.js';
import { requireTenant } from '../../../core/auth/tenant.middleware.js';
import { requireUser } from '../../../core/auth/auth.middleware.js';

export async function registerWellnessProfileRoutes(app: FastifyInstance) {
  const wellnessProfileService = new WellnessProfileService();

  app.post(
    '/wellness-profiles',
    {
      schema: {
        description: 'Create or update wellness profile (upsert)',
        tags: ['People Core - Wellness Profile'],
        body: wellnessProfileUpsertSchema,
      },
    },
    async (request, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        const profile = await wellnessProfileService.upsert(request.body as any, userId);
        return reply.status(201).send(profile);
      } catch (error: any) {
        if (error.message.includes('required')) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.get(
    '/wellness-profiles/:id',
    {
      schema: {
        description: 'Get wellness profile by ID',
        tags: ['People Core - Wellness Profile'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const profile = await wellnessProfileService.getById(Number(request.params.id), tenantId);
        return reply.send(profile);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.get(
    '/employees/:employeeId/wellness-profile',
    {
      schema: {
        description: 'Get wellness profile for employee',
        tags: ['People Core - Wellness Profile'],
        params: { type: 'object', properties: { employeeId: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const profile = await wellnessProfileService.getByEmployeeId(Number(request.params.employeeId), tenantId);
        return reply.send(profile);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.put(
    '/wellness-profiles/:id',
    {
      schema: {
        description: 'Update wellness profile',
        tags: ['People Core - Wellness Profile'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
        body: wellnessProfileUpdateSchema,
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        const profile = await wellnessProfileService.update(Number(request.params.id), request.body as any, tenantId, userId);
        return reply.send(profile);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.patch(
    '/wellness-profiles/:id/consent',
    {
      schema: {
        description: 'Update wellness consent',
        tags: ['People Core - Wellness Profile'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
        body: wellnessProfileConsentUpdateSchema,
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        const profile = await wellnessProfileService.updateConsent(
          Number(request.params.id),
          request.body.wepConsentFlag,
          tenantId,
          userId
        );
        return reply.send(profile);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  app.delete(
    '/wellness-profiles/:id',
    {
      schema: {
        description: 'Soft delete wellness profile',
        tags: ['People Core - Wellness Profile'],
        params: { type: 'object', properties: { id: { type: 'number' } } },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        await wellnessProfileService.delete(Number(request.params.id), tenantId, userId);
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

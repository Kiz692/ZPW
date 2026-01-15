/**
 * Wellness Profile Routes
 * API routes for wellness profile management (upsert pattern)
 */

import type { FastifyInstance } from "fastify";
import { WellnessProfileService } from "../services/wellness-profile.service.js";
import {
  wellnessProfileUpsertSchema,
  wellnessProfileUpdateSchema,
  wellnessProfileConsentUpdateSchema,
} from "../schemas/wellness-profile.schemas.js";
import { requireTenant } from "../../../core/auth/tenant.middleware.js";
import { requireUser } from "../../../core/auth/auth.middleware.js";

export async function registerWellnessProfileRoutes(app: FastifyInstance) {
  const wellnessProfileService = new WellnessProfileService();

  app.post(
    "/wellness-profiles",
    {
      schema: {
        description: "Create or update wellness profile (upsert)",
        tags: ["People Core - Wellness Profile"],
        body: {
          type: "object",
          required: ["wepTenantId", "wepEmpId"],
          properties: {
            wepTenantId: { type: "number" },
            wepEmpId: { type: "number" },
            wepConsentFlag: { type: "boolean" },
            wepPreferredChannelCode: {
              type: "string",
              enum: ["EMAIL", "SMS", "WHATSAPP", "APP", "OTHER"],
            },
            wepLastZhepSyncAt: { type: "string", format: "date-time" },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            wellnessProfileUpsertSchema.parse(request.body);
          } catch (error: any) {
            if (error.name === "ZodError") {
              return reply.status(400).send({
                error: "Validation error",
                details: error.errors,
              });
            }
            throw error;
          }
        },
      },
    },
    async (request, reply) => {
      try {
        const _tenantId = requireTenant(request);
        const userId = requireUser(request);
        const validatedBody = wellnessProfileUpsertSchema.parse(request.body);
        const profile = await wellnessProfileService.upsert(
          validatedBody,
          userId,
        );
        return reply.status(201).send(profile);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return reply.status(400).send({
            error: "Validation error",
            details: error.errors,
          });
        }
        if (error.message.includes("required")) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  app.get(
    "/wellness-profiles/:id",
    {
      schema: {
        description: "Get wellness profile by ID",
        tags: ["People Core - Wellness Profile"],
        params: { type: "object", properties: { id: { type: "number" } } },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const profile = await wellnessProfileService.getById(
          Number(request.params.id),
          tenantId,
        );
        return reply.send(profile);
      } catch (error: any) {
        if (error.message.includes("not found")) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  app.get(
    "/employees/:employeeId/wellness-profile",
    {
      schema: {
        description: "Get wellness profile for employee",
        tags: ["People Core - Wellness Profile"],
        params: {
          type: "object",
          properties: { employeeId: { type: "number" } },
        },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const profile = await wellnessProfileService.getByEmployeeId(
          Number(request.params.employeeId),
          tenantId,
        );
        return reply.send(profile);
      } catch (error: any) {
        if (error.message.includes("not found")) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  app.put(
    "/wellness-profiles/:id",
    {
      schema: {
        description: "Update wellness profile",
        tags: ["People Core - Wellness Profile"],
        params: { type: "object", properties: { id: { type: "number" } } },
        body: {
          type: "object",
          properties: {
            wepConsentFlag: { type: "boolean" },
            wepPreferredChannelCode: {
              type: "string",
              enum: ["EMAIL", "SMS", "WHATSAPP", "APP", "OTHER"],
            },
            wepLastZhepSyncAt: { type: "string", format: "date-time" },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            wellnessProfileUpdateSchema.parse(request.body);
          } catch (error: any) {
            if (error.name === "ZodError") {
              return reply.status(400).send({
                error: "Validation error",
                details: error.errors,
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
        const validatedBody = wellnessProfileUpdateSchema.parse(request.body);
        const profile = await wellnessProfileService.update(
          Number(request.params.id),
          validatedBody,
          tenantId,
          userId,
        );
        return reply.send(profile);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return reply.status(400).send({
            error: "Validation error",
            details: error.errors,
          });
        }
        if (error.message.includes("not found")) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  app.patch(
    "/wellness-profiles/:id/consent",
    {
      schema: {
        description: "Update wellness consent",
        tags: ["People Core - Wellness Profile"],
        params: { type: "object", properties: { id: { type: "number" } } },
        body: {
          type: "object",
          required: ["wepConsentFlag"],
          properties: {
            wepConsentFlag: { type: "boolean" },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            wellnessProfileConsentUpdateSchema.parse(request.body);
          } catch (error: any) {
            if (error.name === "ZodError") {
              return reply.status(400).send({
                error: "Validation error",
                details: error.errors,
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
        const profile = await wellnessProfileService.updateConsent(
          Number(request.params.id),
          request.body.wepConsentFlag,
          tenantId,
          userId,
        );
        return reply.send(profile);
      } catch (error: any) {
        if (error.message.includes("not found")) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  app.delete(
    "/wellness-profiles/:id",
    {
      schema: {
        description: "Soft delete wellness profile",
        tags: ["People Core - Wellness Profile"],
        params: { type: "object", properties: { id: { type: "number" } } },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        await wellnessProfileService.delete(
          Number(request.params.id),
          tenantId,
          userId,
        );
        return reply.send({ success: true });
      } catch (error: any) {
        if (error.message.includes("not found")) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );
}

/**
 * Wellness Profile Tag Routes
 * API routes for wellness profile tag management
 */

import type { FastifyInstance } from "fastify";
import { WellnessProfileTagService } from "../services/wellness-profile-tag.service.js";
import {
  wellnessProfileTagCreateSchema,
  wellnessProfileTagUpdateSchema,
} from "../schemas/wellness-profile-tag.schemas.js";
import { requireTenant } from "../../../core/auth/tenant.middleware.js";
import { requireUser } from "../../../core/auth/auth.middleware.js";

export async function registerWellnessProfileTagRoutes(app: FastifyInstance) {
  const tagService = new WellnessProfileTagService();

  app.post(
    "/wellness-profiles/:wellnessProfileId/tags",
    {
      schema: {
        description: "Create wellness profile tag",
        tags: ["People Core - Wellness Profile Tag"],
        params: {
          type: "object",
          properties: { wellnessProfileId: { type: "number" } },
        },
        body: {
          type: "object",
          required: ["wptTagCode"],
          properties: {
            wptTagCode: { type: "string", minLength: 1, maxLength: 100 },
            wptSourceSystem: {
              type: "string",
              enum: ["MANUAL", "ZHEP", "AUTO", "OTHER"],
            },
            wptIsActive: { type: "boolean" },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            wellnessProfileTagCreateSchema.parse({
              ...request.body,
              wptTenantId: 1,
              wptWepId: Number(request.params.wellnessProfileId),
            });
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
        const validatedBody = wellnessProfileTagCreateSchema.parse({
          ...request.body,
          wptTenantId: tenantId,
          wptWepId: Number(request.params.wellnessProfileId),
        });
        const tag = await tagService.create(validatedBody, userId);
        return reply.status(201).send(tag);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return reply.status(400).send({
            error: "Validation error",
            details: error.errors,
          });
        }
        if (
          error.message.includes("already exists") ||
          error.message.includes("required")
        ) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  app.get(
    "/wellness-profiles/:wellnessProfileId/tags",
    {
      schema: {
        description: "Get tags for wellness profile",
        tags: ["People Core - Wellness Profile Tag"],
        params: {
          type: "object",
          properties: { wellnessProfileId: { type: "number" } },
        },
      },
    },
    async (request: any, reply) => {
      const tenantId = requireTenant(request);
      const tags = await tagService.getByWellnessProfileId(
        Number(request.params.wellnessProfileId),
        tenantId,
      );
      return reply.send(tags);
    },
  );

  app.get(
    "/wellness-profile-tags/:id",
    {
      schema: {
        description: "Get wellness profile tag by ID",
        tags: ["People Core - Wellness Profile Tag"],
        params: { type: "object", properties: { id: { type: "number" } } },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const tag = await tagService.getById(
          Number(request.params.id),
          tenantId,
        );
        return reply.send(tag);
      } catch (error: any) {
        if (error.message.includes("not found")) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  app.put(
    "/wellness-profile-tags/:id",
    {
      schema: {
        description: "Update wellness profile tag",
        tags: ["People Core - Wellness Profile Tag"],
        params: { type: "object", properties: { id: { type: "number" } } },
        body: {
          type: "object",
          properties: {
            wptTagCode: { type: "string", minLength: 1, maxLength: 100 },
            wptSourceSystem: {
              type: "string",
              enum: ["MANUAL", "ZHEP", "AUTO", "OTHER"],
            },
            wptIsActive: { type: "boolean" },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            wellnessProfileTagUpdateSchema.parse(request.body);
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
        const validatedBody = wellnessProfileTagUpdateSchema.parse(
          request.body,
        );
        const tag = await tagService.update(
          Number(request.params.id),
          validatedBody,
          tenantId,
          userId,
        );
        return reply.send(tag);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return reply.status(400).send({
            error: "Validation error",
            details: error.errors,
          });
        }
        if (
          error.message.includes("not found") ||
          error.message.includes("already exists")
        ) {
          return reply
            .status(error.message.includes("not found") ? 404 : 400)
            .send({ error: error.message });
        }
        throw error;
      }
    },
  );

  app.delete(
    "/wellness-profile-tags/:id",
    {
      schema: {
        description: "Soft delete wellness profile tag",
        tags: ["People Core - Wellness Profile Tag"],
        params: { type: "object", properties: { id: { type: "number" } } },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        await tagService.delete(Number(request.params.id), tenantId, userId);
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

/**
 * Qualification Routes
 * API routes for qualification management
 */

import type { FastifyInstance } from "fastify";
import { QualificationService } from "../services/qualification.service.js";
import {
  qualificationCreateSchema,
  qualificationUpdateSchema,
} from "../schemas/qualification.schemas.js";
import { requireUser } from "../../../core/auth/auth.middleware.js";

export async function registerQualificationRoutes(app: FastifyInstance) {
  const qualificationService = new QualificationService();

  app.post(
    "/persons/:personId/qualifications",
    {
      schema: {
        description: "Create qualification",
        tags: ["People Core - Qualification"],
        params: {
          type: "object",
          properties: { personId: { type: "number" } },
        },
        body: {
          type: "object",
          required: ["qlfQualificationTypeCode", "qlfQualificationName"],
          properties: {
            qlfQualificationTypeCode: {
              type: "string",
              enum: ["EDUCATION", "PROFESSIONAL", "CERTIFICATION", "OTHER"],
            },
            qlfInstitution: { type: "string", maxLength: 255 },
            qlfQualificationName: {
              type: "string",
              minLength: 1,
              maxLength: 255,
            },
            qlfLevelCode: {
              type: "string",
              enum: [
                "DIPLOMA",
                "DEGREE",
                "BACHELORS",
                "MASTERS",
                "DOCTORATE",
                "CERTIFICATE",
                "OTHER",
              ],
            },
            qlfCompletionYear: { type: "number", minimum: 1900, maximum: 2100 },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            qualificationCreateSchema.parse({
              ...request.body,
              qlfPerId: Number(request.params.personId),
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
        const userId = requireUser(request);
        const validatedBody = qualificationCreateSchema.parse({
          ...request.body,
          qlfPerId: Number(request.params.personId),
        });
        const qualification = await qualificationService.create(
          validatedBody,
          userId,
        );
        return reply.status(201).send(qualification);
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
    "/persons/:personId/qualifications",
    {
      schema: {
        description: "Get qualifications for person",
        tags: ["People Core - Qualification"],
        params: {
          type: "object",
          properties: { personId: { type: "number" } },
        },
      },
    },
    async (request: any, reply) => {
      const qualifications = await qualificationService.getByPersonId(
        Number(request.params.personId),
      );
      return reply.send(qualifications);
    },
  );

  app.get(
    "/qualifications/:id",
    {
      schema: {
        description: "Get qualification by ID",
        tags: ["People Core - Qualification"],
        params: { type: "object", properties: { id: { type: "number" } } },
      },
    },
    async (request: any, reply) => {
      try {
        const qualification = await qualificationService.getById(
          Number(request.params.id),
        );
        return reply.send(qualification);
      } catch (error: any) {
        if (error.message.includes("not found")) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  app.put(
    "/qualifications/:id",
    {
      schema: {
        description: "Update qualification",
        tags: ["People Core - Qualification"],
        params: { type: "object", properties: { id: { type: "number" } } },
        body: {
          type: "object",
          properties: {
            qlfQualificationTypeCode: {
              type: "string",
              enum: ["EDUCATION", "PROFESSIONAL", "CERTIFICATION", "OTHER"],
            },
            qlfInstitution: { type: "string", maxLength: 255 },
            qlfQualificationName: {
              type: "string",
              minLength: 1,
              maxLength: 255,
            },
            qlfLevelCode: {
              type: "string",
              enum: [
                "DIPLOMA",
                "DEGREE",
                "BACHELORS",
                "MASTERS",
                "DOCTORATE",
                "CERTIFICATE",
                "OTHER",
              ],
            },
            qlfCompletionYear: { type: "number", minimum: 1900, maximum: 2100 },
          },
        },
        preValidation: async (request: any, reply: any) => {
          try {
            qualificationUpdateSchema.parse(request.body);
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
        const userId = requireUser(request);
        const validatedBody = qualificationUpdateSchema.parse(request.body);
        const qualification = await qualificationService.update(
          Number(request.params.id),
          validatedBody,
          userId,
        );
        return reply.send(qualification);
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

  app.delete(
    "/qualifications/:id",
    {
      schema: {
        description: "Soft delete qualification",
        tags: ["People Core - Qualification"],
        params: { type: "object", properties: { id: { type: "number" } } },
      },
    },
    async (request: any, reply) => {
      try {
        const userId = requireUser(request);
        await qualificationService.delete(Number(request.params.id), userId);
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

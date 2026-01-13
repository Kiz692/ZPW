/**
 * Contract Routes
 * API routes for employment contract management
 */

import type { FastifyInstance } from "fastify";
import { ContractService } from "../services/contract.service.js";
import {
  contractCreateSchema,
  contractUpdateSchema,
} from "../schemas/contract.schemas.js";
import { requireTenant } from "../../../core/auth/tenant.middleware.js";
import { requireUser } from "../../../core/auth/auth.middleware.js";

export async function registerContractRoutes(app: FastifyInstance) {
  const contractService = new ContractService();

  app.post(
    "/contracts",
    {
      schema: {
        description: "Create employment contract",
        tags: ["People Core - Contract"],
        body: {
          type: "object",
          properties: {
            ctrTenantId: { type: "number" },
            ctrEmpId: { type: "number" },
            ctrContractTypeCode: { type: "string" },
            ctrStartDate: { type: "string", format: "date" },
            ctrEndDate: { type: "string", format: "date" },
            ctrProbationEndDate: { type: "string", format: "date" },
            ctrStandardHoursPerWeek: { type: "number" },
            ctrStandardDaysPerWeek: { type: "number" },
            ctrStatusCode: { type: "string" },
            ctrPrmPasId: { type: "number" },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const userId = requireUser(request);
        const contract = await contractService.create(
          request.body as any,
          userId,
        );
        return reply.status(201).send(contract);
      } catch (error: any) {
        if (
          error.message.includes("overlap") ||
          error.message.includes("date")
        ) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  app.get(
    "/contracts/:id",
    {
      schema: {
        description: "Get contract by ID",
        tags: ["People Core - Contract"],
        params: { type: "object", properties: { id: { type: "number" } } },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const contract = await contractService.getById(
          Number(request.params.id),
          tenantId,
        );
        return reply.send(contract);
      } catch (error: any) {
        if (error.message.includes("not found")) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  app.get(
    "/employees/:employeeId/contracts",
    {
      schema: {
        description: "Get contracts for employee",
        tags: ["People Core - Contract"],
        params: {
          type: "object",
          properties: { employeeId: { type: "number" } },
        },
      },
    },
    async (request: any, reply) => {
      const tenantId = requireTenant(request);
      const contracts = await contractService.getByEmployeeId(
        Number(request.params.employeeId),
        tenantId,
      );
      return reply.send(contracts);
    },
  );

  app.put(
    "/contracts/:id",
    {
      schema: {
        description: "Update contract",
        tags: ["People Core - Contract"],
        params: { type: "object", properties: { id: { type: "number" } } },
        body: {
          type: "object",
          properties: {
            ctrContractTypeCode: { type: "string" },
            ctrStartDate: { type: "string", format: "date" },
            ctrEndDate: { type: "string", format: "date" },
            ctrProbationEndDate: { type: "string", format: "date" },
            ctrStandardHoursPerWeek: { type: "number" },
            ctrStandardDaysPerWeek: { type: "number" },
            ctrStatusCode: { type: "string" },
            ctrPrmPasId: { type: "number" },
          },
        },
      },
      preValidation: async (request: any, reply: any) => {
        try {
          contractUpdateSchema.parse(request.body);
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
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        const contract = await contractService.update(
          Number(request.params.id),
          request.body as any,
          tenantId,
          userId,
        );
        return reply.send(contract);
      } catch (error: any) {
        if (
          error.message.includes("not found") ||
          error.message.includes("date")
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
    "/contracts/:id",
    {
      schema: {
        description: "Soft delete contract",
        tags: ["People Core - Contract"],
        params: { type: "object", properties: { id: { type: "number" } } },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        await contractService.delete(
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

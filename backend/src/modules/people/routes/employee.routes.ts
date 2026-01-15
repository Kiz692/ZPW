/**
 * Employee Routes
 * API routes for employee management
 */

import type { FastifyInstance } from "fastify";
import { EmployeeService } from "../services/employee.service.js";
import {
  employeeCreateSchema,
  employeeUpdateSchema,
  employeeStatusUpdateSchema,
  employeeQuerySchema,
} from "../schemas/employee.schemas.js";
import { requireTenant } from "../../../core/auth/tenant.middleware.js";
import { requireUser } from "../../../core/auth/auth.middleware.js";

export async function registerEmployeeRoutes(app: FastifyInstance) {
  const employeeService = new EmployeeService();

  // Create employee
  app.post(
    "/employees",
    {
      schema: {
        description: "Create a new employee",
        tags: ["People Core - Employee"],
        body: {
          type: "object",
          properties: {
            personId: { type: "number" },
            personData: { type: "object" },
            empEmployeeNumber: { type: "string" },
            empHireDate: { type: "string", format: "date" },
            empEmploymentTypeCode: { type: "string" },
            empCurrentStatusCode: { type: "string" },
            empCurrentStatusEffectiveDate: { type: "string", format: "date" },
          },
        },
        response: {
          201: {
            description: "Employee created successfully",
            type: "object",
          },
          400: {
            description: "Validation error",
            type: "object",
          },
        },
      },
      preValidation: async (request: any, reply: any) => {
        try {
          // Validate with Zod schema for stricter validation
          employeeCreateSchema.parse(request.body);
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
    async (request, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        const validatedBody = employeeCreateSchema.parse(request.body);
        const employee = await employeeService.create(
          validatedBody as any,
          tenantId,
          userId,
        );
        return reply.status(201).send(employee);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return reply.status(400).send({
            error: "Validation error",
            details: error.errors,
          });
        }
        if (
          error.message.includes("required") ||
          error.message.includes("already exists")
        ) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  // Get employee by ID
  app.get(
    "/employees/:id",
    {
      schema: {
        description: "Get employee by ID",
        tags: ["People Core - Employee"],
        params: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
        },
        response: {
          200: {
            description: "Employee found",
            type: "object",
          },
          404: {
            description: "Employee not found",
            type: "object",
          },
        },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const employee = await employeeService.getById(
          Number(request.params.id),
          tenantId,
        );
        return reply.send(employee);
      } catch (error: any) {
        if (error.message.includes("not found")) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    },
  );

  // List employees
  app.get(
    "/employees",
    {
      schema: {
        description: "List employees for tenant",
        tags: ["People Core - Employee"],
        querystring: {
          type: "object",
          properties: {
            limit: { type: "number" },
            offset: { type: "number" },
          },
        },
        response: {
          200: {
            description: "List of employees",
            type: "array",
          },
        },
      },
    },
    async (request: any, reply) => {
      const tenantId = requireTenant(request);
      const query = employeeQuerySchema.parse(request.query || {});
      const employees = await employeeService.list(
        tenantId,
        query.limit,
        query.offset,
      );
      return reply.send(employees);
    },
  );

  // Update employee
  app.put(
    "/employees/:id",
    {
      schema: {
        description: "Update employee",
        tags: ["People Core - Employee"],
        params: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
        },
        body: {
          type: "object",
          properties: {
            empEmployeeNumber: { type: "string" },
            empHireDate: { type: "string", format: "date" },
            empEmploymentTypeCode: { type: "string" },
            empCurrentStatusCode: { type: "string" },
            empCurrentStatusEffectiveDate: { type: "string", format: "date" },
          },
        },
        response: {
          200: {
            description: "Employee updated successfully",
            type: "object",
          },
          404: {
            description: "Employee not found",
            type: "object",
          },
        },
      },
      preValidation: async (request: any, reply: any) => {
        try {
          employeeUpdateSchema.parse(request.body);
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
        const employee = await employeeService.update(
          Number(request.params.id),
          request.body as any,
          tenantId,
          userId,
        );
        return reply.send(employee);
      } catch (error: any) {
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

  // Update employee status
  app.patch(
    "/employees/:id/status",
    {
      schema: {
        description: "Update employee status",
        tags: ["People Core - Employee"],
        params: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
        },
        body: {
          type: "object",
          properties: {
            statusCode: { type: "string" },
            effectiveDate: { type: "string", format: "date" },
            reasonCode: { type: "string" },
            reasonNote: { type: "string" },
          },
        },
        response: {
          200: {
            description: "Employee status updated successfully",
            type: "object",
          },
          404: {
            description: "Employee not found",
            type: "object",
          },
        },
      },
      preValidation: async (request: any, reply: any) => {
        try {
          employeeStatusUpdateSchema.parse(request.body);
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
        const { statusCode, effectiveDate, reasonCode, reasonNote } =
          request.body as any;
        // Convert string date to Date object
        const effectiveDateObj = effectiveDate
          ? new Date(effectiveDate)
          : new Date();
        const employee = await employeeService.updateStatus(
          Number(request.params.id),
          statusCode,
          effectiveDateObj,
          reasonCode,
          reasonNote,
          tenantId,
          userId,
        );
        return reply.send(employee);
      } catch (error: any) {
        if (
          error.message.includes("not found") ||
          error.message.includes("required")
        ) {
          return reply
            .status(error.message.includes("not found") ? 404 : 400)
            .send({ error: error.message });
        }
        throw error;
      }
    },
  );

  // Get status history
  app.get(
    "/employees/:id/status-history",
    {
      schema: {
        description: "Get employee status history",
        tags: ["People Core - Employee"],
        params: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
        },
        response: {
          200: {
            description: "Status history",
            type: "array",
          },
        },
      },
    },
    async (request: any, reply) => {
      const tenantId = requireTenant(request);
      const history = await employeeService.getStatusHistory(
        Number(request.params.id),
        tenantId,
      );
      return reply.send(history);
    },
  );

  // Soft delete employee
  app.delete(
    "/employees/:id",
    {
      schema: {
        description: "Soft delete employee",
        tags: ["People Core - Employee"],
        params: {
          type: "object",
          properties: {
            id: { type: "number" },
          },
        },
        response: {
          200: {
            description: "Employee deleted successfully",
            type: "object",
          },
          404: {
            description: "Employee not found",
            type: "object",
          },
        },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        await employeeService.delete(
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

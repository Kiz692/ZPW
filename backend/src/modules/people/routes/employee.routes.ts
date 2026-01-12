/**
 * Employee Routes
 * API routes for employee management
 */

import type { FastifyInstance } from 'fastify';
import { EmployeeService } from '../services/employee.service.js';
import {
  employeeCreateSchema,
  employeeUpdateSchema,
  employeeStatusUpdateSchema,
  employeeQuerySchema,
} from '../schemas/employee.schemas.js';
import { requireTenant } from '../../../core/auth/tenant.middleware.js';
import { requireUser } from '../../../core/auth/auth.middleware.js';

export async function registerEmployeeRoutes(app: FastifyInstance) {
  const employeeService = new EmployeeService();

  // Create employee
  app.post(
    '/employees',
    {
      schema: {
        description: 'Create a new employee',
        tags: ['People Core - Employee'],
        body: employeeCreateSchema,
        response: {
          201: {
            description: 'Employee created successfully',
            type: 'object',
          },
          400: {
            description: 'Validation error',
            type: 'object',
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        const employee = await employeeService.create(request.body as any, tenantId, userId);
        return reply.status(201).send(employee);
      } catch (error: any) {
        if (error.message.includes('required') || error.message.includes('already exists')) {
          return reply.status(400).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  // Get employee by ID
  app.get(
    '/employees/:id',
    {
      schema: {
        description: 'Get employee by ID',
        tags: ['People Core - Employee'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        response: {
          200: {
            description: 'Employee found',
            type: 'object',
          },
          404: {
            description: 'Employee not found',
            type: 'object',
          },
        },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const employee = await employeeService.getById(Number(request.params.id), tenantId);
        return reply.send(employee);
      } catch (error: any) {
        if (error.message.includes('not found')) {
          return reply.status(404).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  // List employees
  app.get(
    '/employees',
    {
      schema: {
        description: 'List employees for tenant',
        tags: ['People Core - Employee'],
        querystring: employeeQuerySchema,
        response: {
          200: {
            description: 'List of employees',
            type: 'array',
          },
        },
      },
    },
    async (request: any, reply) => {
      const tenantId = requireTenant(request);
      const query = employeeQuerySchema.parse(request.query || {});
      const employees = await employeeService.list(tenantId, query.limit, query.offset);
      return reply.send(employees);
    }
  );

  // Update employee
  app.put(
    '/employees/:id',
    {
      schema: {
        description: 'Update employee',
        tags: ['People Core - Employee'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        body: employeeUpdateSchema,
        response: {
          200: {
            description: 'Employee updated successfully',
            type: 'object',
          },
          404: {
            description: 'Employee not found',
            type: 'object',
          },
        },
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
          userId
        );
        return reply.send(employee);
      } catch (error: any) {
        if (error.message.includes('not found') || error.message.includes('already exists')) {
          return reply.status(error.message.includes('not found') ? 404 : 400).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  // Update employee status
  app.patch(
    '/employees/:id/status',
    {
      schema: {
        description: 'Update employee status',
        tags: ['People Core - Employee'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        body: employeeStatusUpdateSchema,
        response: {
          200: {
            description: 'Employee status updated successfully',
            type: 'object',
          },
          404: {
            description: 'Employee not found',
            type: 'object',
          },
        },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        const { statusCode, effectiveDate, reasonCode, reasonNote } = request.body as any;
        const employee = await employeeService.updateStatus(
          Number(request.params.id),
          statusCode,
          effectiveDate,
          reasonCode,
          reasonNote,
          tenantId,
          userId
        );
        return reply.send(employee);
      } catch (error: any) {
        if (error.message.includes('not found') || error.message.includes('required')) {
          return reply.status(error.message.includes('not found') ? 404 : 400).send({ error: error.message });
        }
        throw error;
      }
    }
  );

  // Get status history
  app.get(
    '/employees/:id/status-history',
    {
      schema: {
        description: 'Get employee status history',
        tags: ['People Core - Employee'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        response: {
          200: {
            description: 'Status history',
            type: 'array',
          },
        },
      },
    },
    async (request: any, reply) => {
      const tenantId = requireTenant(request);
      const history = await employeeService.getStatusHistory(Number(request.params.id), tenantId);
      return reply.send(history);
    }
  );

  // Soft delete employee
  app.delete(
    '/employees/:id',
    {
      schema: {
        description: 'Soft delete employee',
        tags: ['People Core - Employee'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'number' },
          },
        },
        response: {
          200: {
            description: 'Employee deleted successfully',
            type: 'object',
          },
          404: {
            description: 'Employee not found',
            type: 'object',
          },
        },
      },
    },
    async (request: any, reply) => {
      try {
        const tenantId = requireTenant(request);
        const userId = requireUser(request);
        await employeeService.delete(Number(request.params.id), tenantId, userId);
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

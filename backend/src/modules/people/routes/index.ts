/**
 * People Core API Routes
 * Export route registration function
 */

import type { FastifyInstance } from "fastify";
import { registerPersonRoutes } from "./person.routes.js";
import { registerEmployeeRoutes } from "./employee.routes.js";
import { registerContractRoutes } from "./contract.routes.js";
import { registerPersonContactRoutes } from "./person-contact.routes.js";
import { registerPersonIdentifierRoutes } from "./person-identifier.routes.js";
import { registerDependentRoutes } from "./dependent.routes.js";
import { registerQualificationRoutes } from "./qualification.routes.js";
import { registerEmploymentHistoryRoutes } from "./employment-history.routes.js";
import { registerStatusHistoryRoutes } from "./status-history.routes.js";
import { registerWellnessProfileRoutes } from "./wellness-profile.routes.js";
import { registerWellnessProfileTagRoutes } from "./wellness-profile-tag.routes.js";
import { tenantMiddleware } from "../../../core/auth/tenant.middleware.js";
import { authMiddleware } from "../../../core/auth/auth.middleware.js";

export async function registerPeopleRoutes(app: FastifyInstance) {
  // Register middleware for all People Core routes
  await app.register(
    async (fastify) => {
      // Apply tenant and auth middleware
      fastify.addHook("onRequest", tenantMiddleware);
      fastify.addHook("onRequest", authMiddleware);

      // Register all entity routes
      await fastify.register(registerPersonRoutes, { prefix: "" });
      await fastify.register(registerEmployeeRoutes, { prefix: "" });
      await fastify.register(registerContractRoutes, { prefix: "" });
      await fastify.register(registerPersonContactRoutes, { prefix: "" });
      await fastify.register(registerPersonIdentifierRoutes, { prefix: "" });
      await fastify.register(registerDependentRoutes, { prefix: "" });
      await fastify.register(registerQualificationRoutes, { prefix: "" });
      await fastify.register(registerEmploymentHistoryRoutes, { prefix: "" });
      await fastify.register(registerStatusHistoryRoutes, { prefix: "" });
      await fastify.register(registerWellnessProfileRoutes, { prefix: "" });
      await fastify.register(registerWellnessProfileTagRoutes, { prefix: "" });
    },
    { prefix: "/api/v1/people" },
  );
}

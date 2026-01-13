import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

import { registerHealthRoutes } from "./core/health/routes.js";
import { registerPeopleRoutes } from "./modules/people/routes/index.js";

type DbClient = {
  query: (sql: string) => Promise<unknown>;
};

export async function buildApp(dbClient?: DbClient) {
  const app = Fastify({
    logger: true,
  });

  await app.register(helmet);
  await app.register(cors, { origin: true });

  await app.register(swagger, {
    openapi: {
      info: {
        title: "ZPW Core API",
        version: "0.1.0",
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: "/api-docs",
  });

  await registerHealthRoutes(app, dbClient);
  await registerPeopleRoutes(app);

  return app;
}

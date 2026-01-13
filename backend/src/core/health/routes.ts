import type { FastifyInstance } from "fastify";
import { pool } from "../db/client.js";

type DbClient = {
  query: (sql: string) => Promise<unknown>;
};

export async function registerHealthRoutes(
  app: FastifyInstance,
  dbClient: DbClient = pool,
) {
  app.get("/health", async () => ({ status: "ok" }));

  app.get("/ready", async (_req, reply) => {
    try {
      await dbClient.query("SELECT 1");
      return { status: "ready" };
    } catch {
      return reply.status(503).send({ status: "not_ready" });
    }
  });
}

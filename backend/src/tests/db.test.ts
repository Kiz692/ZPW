import { describe, expect, it } from "vitest";
import pg from "pg";

const { Pool } = pg;

describe("database", () => {
  it("is reachable and has pid_person table", async () => {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
      const { rows } = await pool.query<{ exists: boolean }>(
        "SELECT to_regclass('public.pid_person') IS NOT NULL AS exists",
      );
      expect(rows[0]?.exists).toBe(true);
    } finally {
      await pool.end();
    }
  });
});

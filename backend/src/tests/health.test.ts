import { describe, expect, it, vi } from "vitest";

import { buildApp } from "../app.js";

describe("health routes", () => {
  it("GET /health returns ok", async () => {
    const app = await buildApp();

    const res = await app.inject({
      method: "GET",
      url: "/health",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });

    await app.close();
  });

  it("GET /ready returns ready when DB query succeeds", async () => {
    const pool = {
      query: vi.fn().mockResolvedValue({ rows: [{ "?column?": 1 }] }),
    };
    const app = await buildApp(pool);

    const res = await app.inject({
      method: "GET",
      url: "/ready",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ready" });

    await app.close();
  });

  it("GET /ready returns 503 when DB query fails", async () => {
    const pool = { query: vi.fn().mockRejectedValue(new Error("db down")) };
    const app = await buildApp(pool);

    const res = await app.inject({
      method: "GET",
      url: "/ready",
    });

    expect(res.statusCode).toBe(503);
    expect(res.json()).toEqual({ status: "not_ready" });

    await app.close();
  });
});

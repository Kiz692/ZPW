/**
 * Person Service Tests
 * Unit tests for PersonService business logic
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PersonService } from "../person.service.js";
import { PersonRepository } from "../../repositories/person.repository.js";
import { truncatePeopleTables } from "../../../../tests/helpers/test-db.js";
import { TestFactories } from "../../../../tests/helpers/test-factories.js";
import { createTestPerson } from "../../../../tests/helpers/test-helpers.js";

// Mock audit service
vi.mock("../../../../core/audit/audit.service.js", () => ({
  recordAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

describe("PersonService", () => {
  const personService = new PersonService();
  const personRepo = new PersonRepository();

  beforeEach(async () => {
    await truncatePeopleTables();
  });

  afterEach(async () => {
    await truncatePeopleTables();
  });

  describe("create", () => {
    it("should create person with required fields", async () => {
      const personData = {
        perFirstName: "John",
        perLastName: "Doe",
      };

      const person = await personService.create(personData, 1);

      expect(person.perId).toBeDefined();
      expect(person.perFirstName).toBe("John");
      expect(person.perLastName).toBe("Doe");
    });

    it("should throw error if required fields missing", async () => {
      await expect(
        personService.create({ perFirstName: "John" } as any, 1),
      ).rejects.toThrow("required");
    });
  });

  describe("getById", () => {
    it("should return person if found", async () => {
      const created = await personRepo.create(TestFactories.createPerson());
      const person = await personService.getById(created.perId);

      expect(person.perId).toBe(created.perId);
    });

    it("should throw error if person not found", async () => {
      await expect(personService.getById(99999)).rejects.toThrow("not found");
    });
  });

  describe("searchByName", () => {
    it("should search persons by name", async () => {
      await createTestPerson({ perFirstName: "John", perLastName: "Doe" });
      await createTestPerson({ perFirstName: "Jane", perLastName: "Smith" });

      const results = await personService.searchByName("John");
      expect(results.length).toBeGreaterThan(0);
    });

    it("should throw error if search term too short", async () => {
      await expect(personService.searchByName("J")).rejects.toThrow(
        "at least 2 characters",
      );
    });
  });

  describe("update", () => {
    it("should update person", async () => {
      const created = await personRepo.create(TestFactories.createPerson());
      const updated = await personService.update(
        created.perId,
        { perFirstName: "Jane" },
        1,
      );

      expect(updated.perFirstName).toBe("Jane");
    });

    it("should throw error if person not found", async () => {
      await expect(
        personService.update(99999, { perFirstName: "Jane" }, 1),
      ).rejects.toThrow("not found");
    });
  });

  describe("delete", () => {
    it("should soft delete person", async () => {
      const created = await personRepo.create(TestFactories.createPerson());
      const deleted = await personService.delete(created.perId, 1);

      expect(deleted).toBe(true);
    });
  });
});

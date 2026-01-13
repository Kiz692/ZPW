/**
 * Person Repository Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { PersonRepository } from "../../../modules/people/repositories/person.repository.js";
import { setupTestDb, cleanupTestDb } from "../../helpers/test-db.js";
import { TestFactories } from "../../helpers/test-factories.js";

describe("PersonRepository", () => {
  let personRepo: PersonRepository;

  beforeEach(async () => {
    await setupTestDb();
    await cleanupTestDb();
    personRepo = new PersonRepository();
  });

  afterEach(async () => {
    await cleanupTestDb();
  });

  describe("create", () => {
    it("should create a person with all required fields", async () => {
      const personData = TestFactories.createPerson();
      const person = await personRepo.create(personData);

      expect(person.perId).toBeDefined();
      expect(person.perFirstName).toBe(personData.perFirstName);
      expect(person.perLastName).toBe(personData.perLastName);
      expect(person.perDisplayName).toBeDefined();
      expect(person.perCreatedAt).toBeDefined();
    });

    it("should auto-generate display name if not provided", async () => {
      const personData = TestFactories.createPerson({
        perDisplayName: undefined,
      });
      const person = await personRepo.create(personData);

      expect(person.perDisplayName).toContain(personData.perFirstName);
      expect(person.perDisplayName).toContain(personData.perLastName);
    });
  });

  describe("findById", () => {
    it("should find person by ID", async () => {
      const personData = TestFactories.createPerson();
      const created = await personRepo.create(personData);
      const found = await personRepo.findById(created.perId);

      expect(found).not.toBeNull();
      expect(found?.perId).toBe(created.perId);
    });

    it("should return null for non-existent person", async () => {
      const found = await personRepo.findById(99999);
      expect(found).toBeNull();
    });
  });

  describe("searchByName", () => {
    it("should find persons by name", async () => {
      await personRepo.create(
        TestFactories.createPerson({
          perFirstName: "John",
          perLastName: "Doe",
        }),
      );
      await personRepo.create(
        TestFactories.createPerson({
          perFirstName: "Jane",
          perLastName: "Smith",
        }),
      );

      const results = await personRepo.searchByName("John");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].perFirstName).toContain("John");
    });
  });

  describe("update", () => {
    it("should update person", async () => {
      const person = await personRepo.create(TestFactories.createPerson());
      const updated = await personRepo.update(person.perId, {
        perFirstName: "Updated",
      });

      expect(updated?.perFirstName).toBe("Updated");
      expect(updated?.perUpdatedAt).toBeDefined();
    });
  });

  describe("softDelete", () => {
    it("should soft delete person", async () => {
      const person = await personRepo.create(TestFactories.createPerson());
      const deleted = await personRepo.softDelete(person.perId);

      expect(deleted).toBe(true);
      const found = await personRepo.findById(person.perId);
      expect(found).toBeNull(); // Should not find soft-deleted person
    });
  });
});

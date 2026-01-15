/**
 * Person Service Unit Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { PersonService } from "../../../modules/people/services/person.service.js";
import { setupTestDb, cleanupTestDb } from "../../helpers/test-db.js";
import { TestFactories } from "../../helpers/test-factories.js";

// Mock audit service
vi.mock("../../../core/audit/audit.service.js", () => ({
  recordAuditEvent: vi.fn().mockResolvedValue(undefined),
}));

describe("PersonService", () => {
  let personService: PersonService;

  beforeEach(async () => {
    await setupTestDb();
    await cleanupTestDb();
    personService = new PersonService();
  });

  afterEach(async () => {
    await cleanupTestDb();
  });

  describe("create", () => {
    it("should create person with required fields", async () => {
      const personData = TestFactories.createPerson();
      const person = await personService.create(
        {
          perFirstName: personData.perFirstName,
          perLastName: personData.perLastName,
          perMiddleName: personData.perMiddleName ?? undefined,
          perDisplayName: personData.perDisplayName ?? undefined,
          perGenderCode: personData.perGenderCode ?? undefined,
          perDateOfBirth:
            personData.perDateOfBirth instanceof Date
              ? personData.perDateOfBirth
              : undefined,
          perNationalityCode: personData.perNationalityCode ?? undefined,
        },
        1,
      );

      expect(person.perId).toBeDefined();
      expect(person.perFirstName).toBe(personData.perFirstName);
      expect(person.perLastName).toBe(personData.perLastName);
    });

    it("should throw error if required fields missing", async () => {
      await expect(
        personService.create({ perFirstName: "John" } as any, 1),
      ).rejects.toThrow("Missing required fields");
    });
  });

  describe("getById", () => {
    it("should get person by ID", async () => {
      const personData = TestFactories.createPerson();
      const person = await personService.create(
        {
          perFirstName: personData.perFirstName,
          perLastName: personData.perLastName,
          perMiddleName: personData.perMiddleName ?? undefined,
          perDisplayName: personData.perDisplayName ?? undefined,
          perGenderCode: personData.perGenderCode ?? undefined,
          perDateOfBirth:
            personData.perDateOfBirth instanceof Date
              ? personData.perDateOfBirth
              : undefined,
          perNationalityCode: personData.perNationalityCode ?? undefined,
        },
        1,
      );
      const found = await personService.getById(person.perId);

      expect(found.perId).toBe(person.perId);
    });

    it("should throw error if person not found", async () => {
      await expect(personService.getById(99999)).rejects.toThrow("not found");
    });
  });

  describe("searchByName", () => {
    it("should search persons by name", async () => {
      await personService.create(
        TestFactories.createPerson({
          perFirstName: "John",
          perLastName: "Doe",
        }),
        1,
      );
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
      const personData = TestFactories.createPerson();
      const person = await personService.create(
        {
          perFirstName: personData.perFirstName,
          perLastName: personData.perLastName,
          perMiddleName: personData.perMiddleName ?? undefined,
          perDisplayName: personData.perDisplayName ?? undefined,
          perGenderCode: personData.perGenderCode ?? undefined,
          perDateOfBirth:
            personData.perDateOfBirth instanceof Date
              ? personData.perDateOfBirth
              : undefined,
          perNationalityCode: personData.perNationalityCode ?? undefined,
        },
        1,
      );
      const updated = await personService.update(
        person.perId,
        { perFirstName: "Updated" },
        1,
      );

      expect(updated?.perFirstName).toBe("Updated");
    });
  });

  describe("delete", () => {
    it("should soft delete person", async () => {
      const personData = TestFactories.createPerson();
      const person = await personService.create(
        {
          perFirstName: personData.perFirstName,
          perLastName: personData.perLastName,
          perMiddleName: personData.perMiddleName ?? undefined,
          perDisplayName: personData.perDisplayName ?? undefined,
          perGenderCode: personData.perGenderCode ?? undefined,
          perDateOfBirth:
            personData.perDateOfBirth instanceof Date
              ? personData.perDateOfBirth
              : undefined,
          perNationalityCode: personData.perNationalityCode ?? undefined,
        },
        1,
      );
      const deleted = await personService.delete(person.perId, 1);

      expect(deleted).toBe(true);
    });
  });
});

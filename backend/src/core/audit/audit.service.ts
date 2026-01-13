/**
 * Audit Service
 * Records audit events for People Core operations
 */

import { logger } from "../logger/index.js";
import type { AuditEvent } from "./types.js";

// TODO: In the future, this will write to SYS_AUDIT_LOG table
// For now, we log to Winston with structured logging
export async function recordAuditEvent(event: AuditEvent): Promise<void> {
  try {
    // Log audit event with structured logging
    logger.info("Audit event recorded", {
      event: "audit_event",
      ...event,
      timestamp: new Date().toISOString(),
    });

    // TODO: When SYS_AUDIT_LOG table is implemented, write to database:
    // await db.insert(sysAuditLog).values({
    //   audTenantId: event.tenantId,
    //   audActorId: event.actorId,
    //   audActorType: event.actorType,
    //   audAction: event.action,
    //   audEntityType: event.entityType,
    //   audEntityId: event.entityId,
    //   audMetadata: event.metadata ? JSON.stringify(event.metadata) : null,
    //   audTimestamp: new Date(),
    // });
  } catch (error) {
    // Don't fail the operation if audit logging fails
    logger.error("Failed to record audit event", {
      error,
      event,
    });
  }
}

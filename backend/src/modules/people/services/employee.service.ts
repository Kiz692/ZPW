/**
 * Employee Service
 * Business logic for employee management (tenant-scoped)
 */

import { PersonRepository } from '../repositories/person.repository.js';
import { EmployeeRepository } from '../repositories/employee.repository.js';
import { StatusHistoryRepository } from '../repositories/status-history.repository.js';
import { BaseService } from './base.service.js';
import { AuditAction, AuditEntityType } from '../../../core/audit/types.js';

export class EmployeeService extends BaseService {
  private employeeRepo = new EmployeeRepository();
  private personRepo = new PersonRepository();
  private statusHistoryRepo = new StatusHistoryRepository();

  /**
   * Create employee (creates person if doesn't exist)
   */
  async create(
    data: {
      personId?: number;
      personData?: {
        perFirstName: string;
        perMiddleName?: string;
        perLastName: string;
        perGenderCode?: string;
        perDateOfBirth?: Date;
        perNationalityCode?: string;
      };
      empEmployeeNumber: string;
      empHireDate?: Date;
      empEmploymentTypeCode?: string;
      empCurrentStatusCode?: string;
      empCurrentStatusEffectiveDate?: Date;
    },
    tenantId: number,
    userId?: number
  ) {
    this.validateRequired(data, ['empEmployeeNumber']);

    // Check unique employee number within tenant
    await this.checkUnique(
      () => this.employeeRepo.findByEmployeeNumber(data.empEmployeeNumber, tenantId),
      `Employee number ${data.empEmployeeNumber} already exists in this tenant`
    );

    // Get or create person
    let personId = data.personId;
    if (!personId && data.personData) {
      const person = await this.personRepo.create(data.personData, userId);
      personId = person.perId;
    } else if (!personId) {
      throw new Error('Either personId or personData must be provided');
    }

    // Check one employee per person per tenant
    await this.checkUnique(
      () => this.employeeRepo.findByPersonId(personId!, tenantId),
      `Person ${personId} already has an employee record in this tenant`
    );

    const employee = await this.employeeRepo.create(
      {
        empTenantId: tenantId,
        empPerId: personId!,
        empEmployeeNumber: data.empEmployeeNumber,
        empHireDate: data.empHireDate,
        empEmploymentTypeCode: data.empEmploymentTypeCode,
        empCurrentStatusCode: data.empCurrentStatusCode || 'PLANNED',
        empCurrentStatusEffectiveDate: data.empCurrentStatusEffectiveDate || data.empHireDate,
      },
      userId
    );

    // Create initial status history
    if (employee.empCurrentStatusCode) {
      await this.statusHistoryRepo.create(
        {
          eshTenantId: tenantId,
          eshEmpId: employee.empId,
          eshStatusCode: employee.empCurrentStatusCode,
          eshEffectiveDate: employee.empCurrentStatusEffectiveDate || employee.empHireDate || new Date(),
        },
        userId
      );
    }

    await this.recordAudit(
      AuditAction.EMP_CREATED,
      AuditEntityType.EMPLOYEE,
      employee.empId,
      tenantId,
      userId,
      { employeeNumber: employee.empEmployeeNumber, personId }
    );

    return employee;
  }

  /**
   * Get employee by ID
   */
  async getById(id: number, tenantId: number) {
    const employee = await this.employeeRepo.findById(id, tenantId);
    if (!employee) {
      throw new Error(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  /**
   * List all employees for tenant
   */
  async list(tenantId: number, limit?: number, offset?: number) {
    return await this.employeeRepo.findAll(tenantId, limit, offset);
  }

  /**
   * Update employee
   */
  async update(
    id: number,
    data: {
      empEmployeeNumber?: string;
      empHireDate?: Date;
      empEmploymentTypeCode?: string;
      empCurrentStatusCode?: string;
      empCurrentStatusEffectiveDate?: Date;
    },
    tenantId: number,
    userId?: number
  ) {
    const existing = await this.employeeRepo.findById(id, tenantId);
    if (!existing) {
      throw new Error(`Employee with ID ${id} not found`);
    }

    // Check unique employee number if changing
    if (data.empEmployeeNumber && data.empEmployeeNumber !== existing.empEmployeeNumber) {
      await this.checkUnique(
        () => this.employeeRepo.findByEmployeeNumber(data.empEmployeeNumber!, tenantId),
        `Employee number ${data.empEmployeeNumber} already exists in this tenant`
      );
    }

    // Handle status change
    if (data.empCurrentStatusCode && data.empCurrentStatusCode !== existing.empCurrentStatusCode) {
      const effectiveDate = data.empCurrentStatusEffectiveDate || new Date();
      
      // Create status history entry
      await this.statusHistoryRepo.create(
        {
          eshTenantId: tenantId,
          eshEmpId: id,
          eshStatusCode: data.empCurrentStatusCode,
          eshEffectiveDate: effectiveDate,
        },
        userId
      );
    }

    const updated = await this.employeeRepo.update(id, data, tenantId, userId);
    
    await this.recordAudit(
      AuditAction.EMP_UPDATED,
      AuditEntityType.EMPLOYEE,
      id,
      tenantId,
      userId,
      { changes: data }
    );

    return updated!;
  }

  /**
   * Update employee status
   */
  async updateStatus(
    id: number,
    statusCode: string,
    effectiveDate: Date,
    reasonCode?: string,
    reasonNote?: string,
    tenantId?: number,
    userId?: number
  ) {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const existing = await this.employeeRepo.findById(id, tenantId);
    if (!existing) {
      throw new Error(`Employee with ID ${id} not found`);
    }

    // Create status history entry
    await this.statusHistoryRepo.create(
      {
        eshTenantId: tenantId,
        eshEmpId: id,
        eshStatusCode: statusCode,
        eshEffectiveDate: effectiveDate,
        eshReasonCode: reasonCode,
        eshReasonNote: reasonNote,
      },
      userId
    );

    // Update employee status
    const updated = await this.employeeRepo.updateStatus(id, statusCode, effectiveDate, tenantId, userId);
    
    await this.recordAudit(
      AuditAction.EMP_STATUS_CHANGED,
      AuditEntityType.EMPLOYEE,
      id,
      tenantId,
      userId,
      { statusCode, effectiveDate, reasonCode }
    );

    return updated!;
  }

  /**
   * Get status history for employee
   */
  async getStatusHistory(id: number, tenantId: number) {
    return await this.statusHistoryRepo.findByEmployeeId(id, tenantId);
  }

  /**
   * Soft delete employee
   */
  async delete(id: number, tenantId: number, userId?: number) {
    const existing = await this.employeeRepo.findById(id, tenantId);
    if (!existing) {
      throw new Error(`Employee with ID ${id} not found`);
    }

    const deleted = await this.employeeRepo.softDelete(id, tenantId, userId);
    
    await this.recordAudit(
      AuditAction.EMP_DELETED,
      AuditEntityType.EMPLOYEE,
      id,
      tenantId,
      userId
    );

    return deleted;
  }
}

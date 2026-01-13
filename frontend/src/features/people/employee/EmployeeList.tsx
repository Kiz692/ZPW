/**
 * Employee List Component
 * Displays a list of employees
 */

import { useEmployees } from './hooks/useEmployee';
import { DataTable, Column } from '@/shared/components/DataTable';
import { Button } from '@/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Employee } from './types';

export default function EmployeeList() {
  const navigate = useNavigate();
  const { data: employees, isLoading } = useEmployees();

  const columns: Column<Employee>[] = [
    {
      key: 'employeeNumber',
      header: 'Employee Number',
      accessor: (emp) => emp.employeeNumber,
    },
    {
      key: 'name',
      header: 'Name',
      cell: (emp) => (
        <div>
          {emp.person
            ? `${emp.person.firstName} ${emp.person.lastName}`
            : 'Unknown Person'}
        </div>
      ),
    },
    {
      key: 'hireDate',
      header: 'Hire Date',
      cell: (emp) => new Date(emp.hireDate).toLocaleDateString(),
    },
    {
      key: 'employmentType',
      header: 'Employment Type',
      accessor: (emp) => emp.employmentType,
    },
    {
      key: 'currentStatus',
      header: 'Status',
      cell: (emp) => (
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            emp.currentStatus === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : emp.currentStatus === 'PROBATION'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {emp.currentStatus}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (emp) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/people/employees/${emp.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={() => navigate('/people/employees/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Employee
        </Button>
      </div>

      <DataTable columns={columns} data={employees || []} isLoading={isLoading} />
    </div>
  );
}

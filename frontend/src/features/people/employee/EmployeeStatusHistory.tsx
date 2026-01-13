/**
 * Employee Status History Component
 * Displays employment status change history
 */

import { useEmployee } from './hooks/useEmployee';
import { DataTable, Column } from '@/shared/components/DataTable';
import type { EmploymentStatusHistory } from './types';

interface EmployeeStatusHistoryProps {
  employeeId: string;
}

export default function EmployeeStatusHistory({ employeeId }: EmployeeStatusHistoryProps) {
  const { data: employee } = useEmployee(employeeId);

  if (!employee?.statusHistory || employee.statusHistory.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-2">Status History</h2>
        <p className="text-sm text-muted-foreground">No status changes recorded</p>
      </div>
    );
  }

  const columns: Column<EmploymentStatusHistory>[] = [
    {
      key: 'fromStatus',
      header: 'From Status',
      accessor: (history) => history.fromStatus || 'N/A',
    },
    {
      key: 'toStatus',
      header: 'To Status',
      accessor: (history) => history.toStatus,
    },
    {
      key: 'effectiveDate',
      header: 'Effective Date',
      cell: (history) => new Date(history.effectiveDate).toLocaleDateString(),
    },
    {
      key: 'reason',
      header: 'Reason',
      accessor: (history) => history.reason || 'N/A',
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Status History</h2>
      <DataTable columns={columns} data={employee.statusHistory} />
    </div>
  );
}

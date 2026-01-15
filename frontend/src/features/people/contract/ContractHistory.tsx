/**
 * Contract History Component
 * Displays contract history for an employee
 */

import { useContracts } from './hooks/useContract';
import { DataTable, Column } from '@/shared/components/DataTable';
import type { EmploymentContract } from './types';

interface ContractHistoryProps {
  employeeId: string;
}

export default function ContractHistory({ employeeId }: ContractHistoryProps) {
  const { data: contracts, isLoading } = useContracts(employeeId);

  const columns: Column<EmploymentContract>[] = [
    {
      key: 'contractType',
      header: 'Contract Type',
      accessor: (contract) => contract.contractType,
    },
    {
      key: 'startDate',
      header: 'Start Date',
      cell: (contract) => new Date(contract.startDate).toLocaleDateString(),
    },
    {
      key: 'endDate',
      header: 'End Date',
      cell: (contract) =>
        contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (contract) => (
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            contract.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : contract.status === 'DRAFT'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {contract.status}
        </span>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Contract History</h2>
      <DataTable
        columns={columns}
        data={contracts || []}
        isLoading={isLoading}
        emptyMessage="No contracts found"
      />
    </div>
  );
}

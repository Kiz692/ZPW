/**
 * Status Change Report Component
 * Displays employment status change reports
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { API_ENDPOINTS } from '@/shared/lib/api-endpoints';
import { DataTable, Column } from '@/shared/components/DataTable';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { FormField } from '@/shared/components/FormField';

interface StatusChangeRow {
  id: string;
  employeeNumber: string;
  employeeName: string;
  fromStatus?: string;
  toStatus: string;
  effectiveDate: string;
  reason?: string;
}

export default function StatusChangeReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: reportData, isLoading, refetch } = useQuery<StatusChangeRow[]>({
    queryKey: ['report', 'status-changes', startDate, endDate],
    queryFn: () =>
      apiClient.get<StatusChangeRow[]>(
        `${API_ENDPOINTS.PEOPLE.REPORTS.STATUS_CHANGES}?startDate=${startDate}&endDate=${endDate}`
      ),
    enabled: false,
  });

  const columns: Column<StatusChangeRow>[] = [
    {
      key: 'employeeNumber',
      header: 'Employee Number',
      accessor: (row) => row.employeeNumber,
    },
    {
      key: 'employeeName',
      header: 'Employee Name',
      accessor: (row) => row.employeeName,
    },
    {
      key: 'fromStatus',
      header: 'From Status',
      accessor: (row) => row.fromStatus || 'N/A',
    },
    {
      key: 'toStatus',
      header: 'To Status',
      accessor: (row) => row.toStatus,
    },
    {
      key: 'effectiveDate',
      header: 'Effective Date',
      cell: (row) => new Date(row.effectiveDate).toLocaleDateString(),
    },
    {
      key: 'reason',
      header: 'Reason',
      accessor: (row) => row.reason || 'N/A',
    },
  ];

  const handleGenerate = () => {
    if (startDate && endDate) {
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Status Change Report</h1>

      <div className="flex gap-4 items-end">
        <FormField label="Start Date">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </FormField>

        <FormField label="End Date">
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </FormField>

        <Button onClick={handleGenerate} disabled={!startDate || !endDate}>
          Generate Report
        </Button>
      </div>

      {reportData && (
        <DataTable
          columns={columns}
          data={reportData}
          isLoading={isLoading}
          emptyMessage="No status changes found for the selected period"
        />
      )}
    </div>
  );
}

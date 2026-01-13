/**
 * Joiners/Leavers Report Component
 * Displays joiners and leavers reports
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { API_ENDPOINTS } from '@/shared/lib/api-endpoints';
import { DataTable, Column } from '@/shared/components/DataTable';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { FormField } from '@/shared/components/FormField';

interface ReportRow {
  id: string;
  employeeNumber: string;
  name: string;
  date: string;
  type: 'JOINER' | 'LEAVER';
}

export default function JoinersLeaversReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState<'JOINERS' | 'LEAVERS'>('JOINERS');

  const { data: reportData, isLoading, refetch } = useQuery<ReportRow[]>({
    queryKey: ['report', reportType, startDate, endDate],
    queryFn: () => {
      const endpoint =
        reportType === 'JOINERS'
          ? API_ENDPOINTS.PEOPLE.REPORTS.JOINERS
          : API_ENDPOINTS.PEOPLE.REPORTS.LEAVERS;
      return apiClient.get<ReportRow[]>(`${endpoint}?startDate=${startDate}&endDate=${endDate}`);
    },
    enabled: false,
  });

  const columns: Column<ReportRow>[] = [
    {
      key: 'employeeNumber',
      header: 'Employee Number',
      accessor: (row) => row.employeeNumber,
    },
    {
      key: 'name',
      header: 'Name',
      accessor: (row) => row.name,
    },
    {
      key: 'date',
      header: 'Date',
      cell: (row) => new Date(row.date).toLocaleDateString(),
    },
  ];

  const handleGenerate = () => {
    if (startDate && endDate) {
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {reportType === 'JOINERS' ? 'Joiners Report' : 'Leavers Report'}
      </h1>

      <div className="flex gap-4 items-end">
        <FormField label="Report Type">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'JOINERS' | 'LEAVERS')}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="JOINERS">Joiners</option>
            <option value="LEAVERS">Leavers</option>
          </select>
        </FormField>

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
          emptyMessage="No data found for the selected period"
        />
      )}
    </div>
  );
}

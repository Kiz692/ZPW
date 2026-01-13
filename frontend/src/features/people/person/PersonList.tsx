/**
 * Person List Component
 * Displays a list of persons with search and create functionality
 */

import { useState } from 'react';
import { usePersons, useSearchPersons } from './hooks/usePerson';
import { DataTable, Column } from '@/shared/components/DataTable';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Person } from './types';

export default function PersonList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: persons, isLoading } = usePersons();
  const { data: searchResults } = useSearchPersons(searchQuery);

  const displayData = searchQuery && searchResults ? searchResults : persons || [];

  const columns: Column<Person>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (person) => (
        <div>
          <div className="font-medium">
            {person.firstName} {person.lastName}
          </div>
          {person.preferredName && (
            <div className="text-sm text-muted-foreground">
              Preferred: {person.preferredName}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'dateOfBirth',
      header: 'Date of Birth',
      cell: (person) => new Date(person.dateOfBirth).toLocaleDateString(),
    },
    {
      key: 'gender',
      header: 'Gender',
      accessor: (person) => person.genderCode,
    },
    {
      key: 'nationality',
      header: 'Nationality',
      accessor: (person) => person.nationalityCode,
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (person) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/people/persons/${person.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Persons</h1>
        <Button onClick={() => navigate('/people/persons/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Person
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable columns={columns} data={displayData} isLoading={isLoading} />
    </div>
  );
}

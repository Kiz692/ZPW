/**
 * Person Search Component
 * Standalone search component for finding persons
 */

import { useState } from 'react';
import { useSearchPersons } from './hooks/usePerson';
import { Input } from '@/ui/input';
import { Search } from 'lucide-react';
import { DataTable, Column } from '@/shared/components/DataTable';
import type { Person } from './types';

interface PersonSearchProps {
  onSelect?: (person: Person) => void;
}

export default function PersonSearch({ onSelect }: PersonSearchProps) {
  const [query, setQuery] = useState('');

  const { data: results, isLoading } = useSearchPersons(query);

  const columns: Column<Person>[] = [
    {
      key: 'name',
      header: 'Name',
      cell: (person) => (
        <button
          onClick={() => onSelect?.(person)}
          className="text-left hover:underline"
        >
          {person.firstName} {person.lastName}
        </button>
      ),
    },
    {
      key: 'dateOfBirth',
      header: 'Date of Birth',
      cell: (person) => new Date(person.dateOfBirth).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or ID..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {query && (
        <DataTable
          columns={columns}
          data={results || []}
          isLoading={isLoading}
          emptyMessage="No persons found"
        />
      )}
    </div>
  );
}

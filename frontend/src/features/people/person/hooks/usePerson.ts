/**
 * Person Hooks
 * React Query hooks for Person operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { API_ENDPOINTS } from '@/shared/lib/api-endpoints';
import type { Person, CreatePersonRequest, UpdatePersonRequest } from '../types';

export function usePersons() {
  return useQuery<Person[]>({
    queryKey: ['persons'],
    queryFn: () => apiClient.get<Person[]>(API_ENDPOINTS.PEOPLE.PERSONS),
  });
}

export function usePerson(id: string | null) {
  return useQuery<Person>({
    queryKey: ['person', id],
    queryFn: () => apiClient.get<Person>(API_ENDPOINTS.PEOPLE.PERSON(id!)),
    enabled: !!id,
  });
}

export function useCreatePerson() {
  const queryClient = useQueryClient();

  return useMutation<Person, Error, CreatePersonRequest>({
    mutationFn: (data) => apiClient.post<Person>(API_ENDPOINTS.PEOPLE.PERSONS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] });
    },
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();

  return useMutation<Person, Error, { id: string; data: UpdatePersonRequest }>({
    mutationFn: ({ id, data }) =>
      apiClient.put<Person>(API_ENDPOINTS.PEOPLE.PERSON(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['persons'] });
      queryClient.invalidateQueries({ queryKey: ['person', variables.id] });
    },
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.delete<void>(API_ENDPOINTS.PEOPLE.PERSON(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['persons'] });
    },
  });
}

export function useSearchPersons(query: string) {
  return useQuery<Person[]>({
    queryKey: ['persons', 'search', query],
    queryFn: () =>
      apiClient.get<Person[]>(`${API_ENDPOINTS.PEOPLE.PERSONS}?search=${encodeURIComponent(query)}`),
    enabled: query.length > 0,
  });
}

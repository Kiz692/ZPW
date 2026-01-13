/**
 * Contract Hooks
 * React Query hooks for Contract operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { API_ENDPOINTS } from '@/shared/lib/api-endpoints';
import type { EmploymentContract, CreateContractRequest, UpdateContractRequest } from '../types';

export function useContracts(employeeId?: string) {
  return useQuery<EmploymentContract[]>({
    queryKey: ['contracts', employeeId],
    queryFn: () => {
      const url = employeeId
        ? `${API_ENDPOINTS.PEOPLE.CONTRACTS}?employeeId=${employeeId}`
        : API_ENDPOINTS.PEOPLE.CONTRACTS;
      return apiClient.get<EmploymentContract[]>(url);
    },
  });
}

export function useContract(id: string | null) {
  return useQuery<EmploymentContract>({
    queryKey: ['contract', id],
    queryFn: () => apiClient.get<EmploymentContract>(API_ENDPOINTS.PEOPLE.CONTRACT(id!)),
    enabled: !!id,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation<EmploymentContract, Error, CreateContractRequest>({
    mutationFn: (data) => apiClient.post<EmploymentContract>(API_ENDPOINTS.PEOPLE.CONTRACTS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();

  return useMutation<EmploymentContract, Error, { id: string; data: UpdateContractRequest }>({
    mutationFn: ({ id, data }) =>
      apiClient.put<EmploymentContract>(API_ENDPOINTS.PEOPLE.CONTRACT(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contract', variables.id] });
    },
  });
}

/**
 * Employee Hooks
 * React Query hooks for Employee operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { API_ENDPOINTS } from '@/shared/lib/api-endpoints';
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  UpdateEmployeeStatusRequest,
} from '../types';

export function useEmployees() {
  return useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: () => apiClient.get<Employee[]>(API_ENDPOINTS.PEOPLE.EMPLOYEES),
  });
}

export function useEmployee(id: string | null) {
  return useQuery<Employee>({
    queryKey: ['employee', id],
    queryFn: () => apiClient.get<Employee>(API_ENDPOINTS.PEOPLE.EMPLOYEE(id!)),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation<Employee, Error, CreateEmployeeRequest>({
    mutationFn: (data) => apiClient.post<Employee>(API_ENDPOINTS.PEOPLE.EMPLOYEES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation<Employee, Error, { id: string; data: UpdateEmployeeRequest }>({
    mutationFn: ({ id, data }) =>
      apiClient.put<Employee>(API_ENDPOINTS.PEOPLE.EMPLOYEE(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
    },
  });
}

export function useUpdateEmployeeStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    Employee,
    Error,
    { id: string; data: UpdateEmployeeStatusRequest }
  >({
    mutationFn: ({ id, data }) =>
      apiClient.patch<Employee>(`${API_ENDPOINTS.PEOPLE.EMPLOYEE(id)}/status`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', variables.id] });
    },
  });
}

/**
 * Wellness Profile Hooks
 * React Query hooks for Wellness Profile operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { API_ENDPOINTS } from '@/shared/lib/api-endpoints';
import type {
  WellnessProfile,
  CreateWellnessProfileRequest,
  UpdateWellnessProfileRequest,
} from '../types';

export function useWellnessProfile(employeeId: string | null) {
  return useQuery<WellnessProfile>({
    queryKey: ['wellness-profile', employeeId],
    queryFn: () =>
      apiClient.get<WellnessProfile>(API_ENDPOINTS.PEOPLE.WELLNESS_PROFILE(employeeId!)),
    enabled: !!employeeId,
  });
}

export function useCreateWellnessProfile() {
  const queryClient = useQueryClient();

  return useMutation<WellnessProfile, Error, CreateWellnessProfileRequest>({
    mutationFn: (data) =>
      apiClient.post<WellnessProfile>(API_ENDPOINTS.PEOPLE.WELLNESS_PROFILES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness-profile'] });
    },
  });
}

export function useUpdateWellnessProfile() {
  const queryClient = useQueryClient();

  return useMutation<
    WellnessProfile,
    Error,
    { id: string; data: UpdateWellnessProfileRequest }
  >({
    mutationFn: ({ id, data }) =>
      apiClient.put<WellnessProfile>(API_ENDPOINTS.PEOPLE.WELLNESS_PROFILE(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wellness-profile'] });
      queryClient.invalidateQueries({ queryKey: ['wellness-profile', variables.id] });
    },
  });
}

/**
 * API Endpoint Constants
 * Centralized location for all API endpoint paths
 */

const API_BASE = '/api/v1';

export const API_ENDPOINTS = {
  // People Core
  PEOPLE: {
    PERSONS: `${API_BASE}/people/persons`,
    PERSON: (id: string | number) => `${API_BASE}/people/persons/${id}`,
    EMPLOYEES: `${API_BASE}/people/employees`,
    EMPLOYEE: (id: string | number) => `${API_BASE}/people/employees/${id}`,
    CONTRACTS: `${API_BASE}/people/contracts`,
    CONTRACT: (id: string | number) => `${API_BASE}/people/contracts/${id}`,
    DEPENDENTS: `${API_BASE}/people/dependents`,
    QUALIFICATIONS: `${API_BASE}/people/qualifications`,
    EMPLOYMENT_HISTORY: `${API_BASE}/people/employment-history`,
    WELLNESS_PROFILES: `${API_BASE}/people/wellness-profiles`,
    WELLNESS_PROFILE: (id: string | number) => `${API_BASE}/people/wellness-profiles/${id}`,
    REPORTS: {
      JOINERS: `${API_BASE}/people/reports/joiners`,
      LEAVERS: `${API_BASE}/people/reports/leavers`,
      STATUS_CHANGES: `${API_BASE}/people/reports/status-changes`,
    },
  },
  // Auth
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    LOGOUT: `${API_BASE}/auth/logout`,
    REFRESH: `${API_BASE}/auth/refresh`,
    ME: `${API_BASE}/auth/me`,
  },
  // Tenant
  TENANT: {
    CURRENT: `${API_BASE}/tenant/current`,
  },
} as const;

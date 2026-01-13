/**
 * Tenant Context
 * Provides tenant context throughout the application
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from './api-client';
import { API_ENDPOINTS } from './api-endpoints';

interface Tenant {
  id: string;
  name: string;
  code: string;
}

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  setTenant: (tenant: Tenant | null) => void;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing tenant ID on mount
    const tenantId = localStorage.getItem('tenant_id');
    if (tenantId) {
      refreshTenant();
    } else {
      setIsLoading(false);
    }
  }, []);

  const setTenant = (newTenant: Tenant | null) => {
    setTenantState(newTenant);
    if (newTenant) {
      localStorage.setItem('tenant_id', newTenant.id);
    } else {
      localStorage.removeItem('tenant_id');
    }
  };

  const refreshTenant = async () => {
    try {
      setIsLoading(true);
      const tenantData = await apiClient.get<Tenant>(API_ENDPOINTS.TENANT.CURRENT);
      setTenant(tenantData);
    } catch (error) {
      console.error('Failed to load tenant:', error);
      setTenant(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TenantContext.Provider
      value={{
        tenant,
        isLoading,
        setTenant,
        refreshTenant,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

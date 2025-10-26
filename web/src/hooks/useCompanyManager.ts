import { useEffect } from 'react';
import { useCompanies } from './useCompany';
import type { CompanyInput } from '../types/company';

/**
 * Hook mejorado para gestión de empresas con carga automática
 */
export function useCompany() {
  const {
    companies,
    loading,
    error,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  } = useCompanies();

  // Cargar empresas al montar
  useEffect(() => {
    fetchCompanies().catch(() => undefined);
  }, [fetchCompanies]);

  return {
    companies,
    loading,
    error,
    createCompany: async (data: CompanyInput) => {
      return createCompany(data);
    },
    updateCompany,
    deleteCompany,
  };
}

export { useCompanies, useWorkers, useWorkerProfile } from './useCompany';

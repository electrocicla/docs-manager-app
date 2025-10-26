import { useState, useCallback, useEffect } from 'react';
import type {
  Company,
  CompanyInput,
  UpdateCompanyPayload,
  WorkerModel,
  WorkerInput,
  WorkerDocument,
  WorkerProfile,
} from '../types/company';
import { clienteHttp } from '../api/cliente-http';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = await clienteHttp.get<{ data: Company[] }>('/companies', {
        requiresAuth: true,
      });

      const results = Array.isArray(payload?.data) ? payload.data : [];
      setCompanies(results);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCompany = useCallback(async (company: CompanyInput) => {
    setLoading(true);
    setError(null);
    try {
      console.log('createCompany: enviando', company);
      const payload = await clienteHttp.post<{ data: Company }>('/companies', company, {
        requiresAuth: true,
      });

      const created = payload?.data;

      if (!created) {
        throw new Error('Respuesta inválida del servidor al crear empresa');
      }

      setCompanies(prev => [...prev, created]);
      return created;
    } catch (err) {
      console.error('createCompany error:', err);
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCompany = useCallback(async (id: string, updates: UpdateCompanyPayload) => {
    setLoading(true);
    setError(null);
    try {
      const payload = await clienteHttp.put<{ data: Company }>(
        `/companies/${id}`,
        updates,
        { requiresAuth: true }
      );

      const updated = payload?.data;

      if (!updated) {
        throw new Error('Respuesta inválida del servidor al actualizar empresa');
      }

      setCompanies(prev => prev.map(c => (c.id === id ? updated : c)));
      return updated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCompany = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await clienteHttp.delete<void>(`/companies/${id}`, { requiresAuth: true });
      setCompanies(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    companies,
    loading,
    error,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
  };
}

export function useWorkers(companyId: string) {
  const [workers, setWorkers] = useState<WorkerModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkers = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const payload = await clienteHttp.get<{ data: WorkerModel[] }>(
        `/workers?companyId=${companyId}`,
        { requiresAuth: true }
      );

      const workerList = Array.isArray(payload?.data) ? payload.data : [];
      setWorkers(workerList);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const createWorker = useCallback(async (worker: WorkerInput) => {
    setLoading(true);
    setError(null);
    try {
      const payload = await clienteHttp.post<{ data: WorkerModel }>(
        '/workers',
        worker,
        { requiresAuth: true }
      );

      const created = payload?.data;

      if (!created) {
        throw new Error('Respuesta inválida del servidor al crear trabajador');
      }

      setWorkers(prev => [...prev, created]);
      return created;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  const deleteWorker = useCallback(async (workerId: string) => {
    setLoading(true);
    setError(null);
    try {
      await clienteHttp.delete<void>(`/workers/${workerId}`, { requiresAuth: true });
      setWorkers(prev => prev.filter(w => w.id !== workerId));
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWorker = useCallback(async (workerId: string, updates: Partial<WorkerInput>) => {
    setLoading(true);
    setError(null);
    try {
      const payload = await clienteHttp.put<{ data: WorkerModel }>(
        `/workers/${workerId}`,
        updates,
        { requiresAuth: true }
      );

      const updated = payload?.data;

      if (!updated) {
        throw new Error('Respuesta inválida del servidor al actualizar trabajador');
      }

      setWorkers(prev => prev.map(w => w.id === workerId ? updated : w));
      return updated;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkers().catch(() => undefined);
  }, [fetchWorkers]);

  return {
    workers,
    loading,
    error,
    fetchWorkers,
    createWorker,
    updateWorker,
    deleteWorker,
  };
}

export function useWorkerProfile(workerId: string) {
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!workerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await clienteHttp.get<WorkerProfile>(`/workers/${workerId}`, {
        requiresAuth: true,
      });
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [workerId]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
  };
}

export function useAdminDocuments() {
  const [documents, setDocuments] = useState<WorkerDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clienteHttp.get<WorkerDocument[]>('/documents/pending', {
        requiresAuth: true,
      });
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDocumentStatus = useCallback(async (docId: string, status: string, comments?: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await clienteHttp.put<WorkerDocument>(
        `/documents/${docId}`,
        { status, admin_comments: comments },
        { requiresAuth: true }
      );
      setDocuments(prev => prev.map(d => d.id === docId ? updated : d));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    documents,
    loading,
    error,
    fetchPendingDocuments,
    updateDocumentStatus,
  };
}

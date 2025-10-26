import { useState, useCallback, useEffect } from 'react';
import type {
  Company,
  CompanyInput,
  UpdateCompanyPayload,
  Worker,
  WorkerInput,
  WorkerDocument,
  WorkerProfile,
} from '../types/company';
import { config } from '../config';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.apiUrl}/companies`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (payload && typeof payload.error === 'string' && payload.error) ||
          'Error al cargar empresas';
        throw new Error(message);
      }

      const results = Array.isArray(payload?.data) ? (payload.data as Company[]) : [];
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
      const response = await fetch(`${config.apiUrl}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(company),
      });
      
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (payload && typeof payload.error === 'string' && payload.error) ||
          'Error al crear empresa';
        throw new Error(message);
      }

      const created = payload?.data as Company | undefined;

      if (!created) {
        throw new Error('Respuesta inválida del servidor al crear empresa');
      }

      setCompanies(prev => [...prev, created]);
      return created;
    } catch (err) {
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
      const response = await fetch(`${config.apiUrl}/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updates),
      });
      
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (payload && typeof payload.error === 'string' && payload.error) ||
          'Error al actualizar empresa';
        throw new Error(message);
      }

      const updated = payload?.data as Company | undefined;

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
      const response = await fetch(`${config.apiUrl}/companies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (payload && typeof payload.error === 'string' && payload.error) ||
          'Error al eliminar empresa';
        throw new Error(message);
      }

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
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkers = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.apiUrl}/workers?companyId=${companyId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (payload && typeof payload.error === 'string' && payload.error) ||
          'Error al cargar trabajadores';
        throw new Error(message);
      }

      const workerList = Array.isArray(payload?.data) ? (payload.data as Worker[]) : [];
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
      const response = await fetch(`${config.apiUrl}/workers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(worker),
      });
      
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (payload && typeof payload.error === 'string' && payload.error) ||
          'Error al crear trabajador';
        throw new Error(message);
      }

      const created = payload?.data as Worker | undefined;

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
      const response = await fetch(`${config.apiUrl}/workers/${workerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (payload && typeof payload.error === 'string' && payload.error) ||
          'Error al eliminar trabajador';
        throw new Error(message);
      }

      setWorkers(prev => prev.filter(w => w.id !== workerId));
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
      const response = await fetch(`${config.apiUrl}/workers/${workerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Error al cargar perfil del trabajador');
      
      const data = await response.json();
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
      const response = await fetch(`${config.apiUrl}/documents/pending`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Error al cargar documentos pendientes');
      
      const data = await response.json();
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
      const response = await fetch(`${config.apiUrl}/documents/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status, admin_comments: comments }),
      });
      
      if (!response.ok) throw new Error('Error al actualizar documento');
      
      const updated = await response.json();
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

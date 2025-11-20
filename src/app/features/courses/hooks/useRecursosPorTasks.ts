import { useCallback, useEffect, useState } from 'react';
import { Recurso } from '../types/types';
import { apiFetch } from '../../auth/utils/methods';

/**
 * Hook to manage recursos for TAREA owner type.
 * - Provides a map `resourcesByTask` keyed by tareaId
 * - Exposes functions to fetch, upload, delete and get download URL
 * - upload/delete use `apiFetch` directly; alternatively you can submit via actions
 */
export const useRecursosPorTasks = (cursoId?: number, jwtToken?: string) => {
  const [resourcesByTask, setResourcesByTask] = useState<Record<number, Recurso[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecursosForTask = useCallback(async (tareaId?: number) => {
    if (!cursoId || !tareaId) return [] as Recurso[];
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/cursos/${cursoId}/recursos?ownerRecurso=TAREA&ownerId=${tareaId}`, {
        method: 'GET',
        secure: true,
        jwtToken: jwtToken || ''
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Recurso[] = await res.json();
      setResourcesByTask(prev => ({ ...prev, [tareaId]: data }));
      return data;
    } catch (err) {
      console.error('useRecursosPorTasks - getRecursosForTask error', err);
      setError('Error al obtener recursos');
      setResourcesByTask(prev => ({ ...prev, [tareaId || 0]: [] }));
      return [] as Recurso[];
    } finally {
      setLoading(false);
    }
  }, [cursoId, jwtToken]);

  const uploadRecursoForTask = useCallback(async (tareaId: number, nombre: string, file: File) => {
    if (!cursoId || !tareaId) return null;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('ownerRecurso', 'TAREA');
      form.append('ownerId', String(tareaId));
      form.append('nombre', nombre);
      form.append('archivo', file);

      const res = await apiFetch(`/cursos/${cursoId}/recursos`, {
        method: 'POST',
        secure: true,
        jwtToken: jwtToken || '',
        body: form
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const nuevo: Recurso = await res.json();
      setResourcesByTask(prev => ({ ...prev, [tareaId]: [...(prev[tareaId] || []), nuevo] }));
      return nuevo;
    } catch (err) {
      console.error('useRecursosPorTasks - uploadRecursoForTask error', err);
      setError('Error al subir recurso');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cursoId, jwtToken]);

  const deleteRecursoForTask = useCallback(async (tareaId: number, recursoId: number) => {
    if (!cursoId || !recursoId) return false;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/cursos/${cursoId}/recursos/${recursoId}`, {
        method: 'DELETE',
        secure: true,
        jwtToken: jwtToken || ''
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResourcesByTask(prev => ({ ...prev, [tareaId]: (prev[tareaId] || []).filter(r => r.id !== recursoId) }));
      return true;
    } catch (err) {
      console.error('useRecursosPorTasks - deleteRecursoForTask error', err);
      setError('Error al eliminar recurso');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cursoId, jwtToken]);

  const getRecursoUrl = useCallback(async (recursoId: number) => {
    if (!cursoId || !recursoId) return null;
    try {
      const res = await apiFetch(`/cursos/${cursoId}/recursos/${recursoId}/descargar-url`, {
        method: 'GET',
        secure: false,
        jwtToken: ''
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return json.url as string | null;
    } catch (err) {
      console.error('useRecursosPorTasks - getRecursoUrl error', err);
      setError('Error al obtener url de recurso');
      return null;
    }
  }, [cursoId]);

  // Helpers for manual state updates (useful when mutations are done via actions)
  const addResource = useCallback((tareaId: number, recurso: Recurso) => {
    setResourcesByTask(prev => ({ ...prev, [tareaId]: [...(prev[tareaId] || []), recurso] }));
  }, []);

  const removeResource = useCallback((tareaId: number, recursoId: number) => {
    setResourcesByTask(prev => ({ ...prev, [tareaId]: (prev[tareaId] || []).filter(r => r.id !== recursoId) }));
  }, []);

  return {
    resourcesByTask,
    loading,
    error,
    getRecursosForTask,
    uploadRecursoForTask,
    deleteRecursoForTask,
    getRecursoUrl,
    addResource,
    removeResource,
  };
};

export default useRecursosPorTasks;

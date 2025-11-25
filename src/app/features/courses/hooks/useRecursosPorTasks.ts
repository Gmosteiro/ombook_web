import { useCallback, useEffect, useState } from 'react';
import { Recurso, Tarea } from '../types/types';
import { apiFetch } from '../../auth/utils/methods';


const API_URL = import.meta.env.VITE_API_URL;

export const useRecursosPorTasks = (cursoId?: number, jwtToken?: string) => {
  const [tasks, setTasks] = useState<Tarea[]>([]);
  const [resourcesByTask, setResourcesByTask] = useState<Record<number, Recurso[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cursoId && jwtToken) {
      getTasks();
    }
  }, [cursoId, jwtToken]);

  const getTasks = useCallback(async () => {
    if (!cursoId) return [] as Tarea[];
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/cursos/${cursoId}/tareas`, {
        method: 'GET',
        secure: true,
        jwtToken: jwtToken || ''
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Tarea[] = await res.json();
      setTasks(data);
      return data;
    } catch (err) {
      console.error('useRecursosPorTasks - getTasks error', err);
      setError('Error al obtener tareas');
      setTasks([]);
      return [] as Tarea[];
    } finally {
      setLoading(false);
    }
  }, [cursoId, jwtToken]);

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

  const uploadRecursoForTask = useCallback(
  async (tareaId: number, nombre: string, file: File, jwtToken: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!cursoId || !tareaId) return null;

      const formData = new FormData();
      formData.append("ownerRecurso", "TAREA");
      formData.append("ownerId", tareaId.toString());
      formData.append("nombre", nombre);
      formData.append("archivo", file);

      const response = await fetch(
        `${API_URL}/cursos/${cursoId}/recursos`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${jwtToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Error al subir el archivo");
      }

      const newRecurso: Recurso = await response.json();

      setResourcesByTask(prev => ({
        ...prev,
        [tareaId]: [...(prev[tareaId] || []), newRecurso]
      }));

      return newRecurso;
    } catch (err) {
      console.error("useRecursosPorTasks - uploadRecursoForTask error", err);
      setError("Error al subir recurso");
      return null;
    } finally {
      setLoading(false);
    }
  },
  [cursoId]
);


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

  const createTask = useCallback(async (titulo: string, descripcion?: string, fechaInicio?: string, fechaFin?: string) => {
    if (!cursoId) return null;
    setLoading(true);
    setError(null);
    try {
      const body = {
        titulo,
        descripcion: descripcion || '',
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null,
      };
      const res = await apiFetch(`/cursos/${cursoId}/tareas`, {
        method: 'POST',
        secure: true,
        jwtToken: jwtToken || '',
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const nueva: Tarea = await res.json();
      setTasks(prev => [...prev, nueva]);
      return nueva;
    } catch (err) {
      console.error('useRecursosPorTasks - createTask error', err);
      setError('Error al crear tarea');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cursoId, jwtToken]);

  const updateTask = useCallback(async (tareaId: number, titulo: string, descripcion?: string, fechaInicio?: string, fechaFin?: string) => {
    if (!cursoId || !tareaId) return false;
    setLoading(true);
    setError(null);
    try {
      const body = {
        titulo,
        descripcion: descripcion || '',
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null,
      };
      debugger
      const res = await apiFetch(`/cursos/${cursoId}/tareas/${tareaId}`, {
        method: 'PATCH',
        secure: true,
        jwtToken: jwtToken || '',
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setTasks(prev => prev.map(t => t.id === tareaId ? { ...t, titulo, descripcion, fechaInicio, fechaFin } : t));
      return true;
    } catch (err) {
      console.error('useRecursosPorTasks - updateTask error', err);
      setError('Error al actualizar tarea');
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

  const addResource = useCallback((tareaId: number, recurso: Recurso) => {
    setResourcesByTask(prev => ({ ...prev, [tareaId]: [...(prev[tareaId] || []), recurso] }));
  }, []);

  const removeResource = useCallback((tareaId: number, recursoId: number) => {
    setResourcesByTask(prev => ({ ...prev, [tareaId]: (prev[tareaId] || []).filter(r => r.id !== recursoId) }));
  }, []);

  return {
    tasks,
    resourcesByTask,
    loading,
    error,
    getTasks,
    createTask,
    updateTask,
    getRecursosForTask,
    uploadRecursoForTask,
    deleteRecursoForTask,
    getRecursoUrl,
    addResource,
    removeResource,
  };
};

export default useRecursosPorTasks;

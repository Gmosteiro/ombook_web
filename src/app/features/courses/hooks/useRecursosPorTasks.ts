import { useCallback, useEffect, useState } from 'react';
import { Recurso, Tarea } from '../types/types';
import { apiFetch } from '../../auth/utils/methods';

export const useRecursosPorTasks = (cursoId?: number, jwtToken?: string) => {
  const [tasks, setTasks] = useState<Tarea[]>([]);
  const [resourcesByTask, setResourcesByTask] = useState<Record<number, Recurso[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cursoId && jwtToken) getTasks();
  }, [cursoId, jwtToken]);


  // ---------------------------------------------------------------------
  // GET TAREAS
  // ---------------------------------------------------------------------
  const getTasks = useCallback(async () => {
    if (!cursoId) return [];
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch(`/cursos/${cursoId}/tareas`, {
        method: "GET",
        secure: true,
        jwtToken
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: Tarea[] = await res.json();
      setTasks(data);
      return data;
    } catch (err) {
      console.error("getTasks error", err);
      setError("Error al obtener tareas");
      setTasks([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [cursoId, jwtToken]);


  // ---------------------------------------------------------------------
  // GET RECURSOS POR TAREA
  // ---------------------------------------------------------------------
  const getRecursosForTask = useCallback(async (tareaId?: number) => {
    if (!cursoId || !tareaId) return [];

    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch(
        `/cursos/${cursoId}/recursos?ownerRecurso=TAREA&ownerId=${tareaId}`,
        {
          method: "GET",
          secure: true,
          jwtToken
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: Recurso[] = await res.json();

      setResourcesByTask(prev => ({
        ...prev,
        [tareaId]: data
      }));

      return data;
    } catch (err) {
      console.error("getRecursosForTask error", err);
      setError("Error al obtener recursos");
      return [];
    } finally {
      setLoading(false);
    }
  }, [cursoId, jwtToken]);


  // ---------------------------------------------------------------------
  // UPLOAD RECURSO (apiFetch)
  // ---------------------------------------------------------------------
  const uploadRecursoForTask = useCallback(
    async (tareaId: number, nombre: string, file: File, token: string) => {
      if (!cursoId) return null;

      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("ownerRecurso", "TAREA");
        formData.append("ownerId", tareaId.toString());
        formData.append("nombre", nombre);
        formData.append("file", file);

        const res = await apiFetch(`/cursos/${cursoId}/recursos`, {
          method: "POST",
          secure: true,
          jwtToken: token,
          body: formData,
          isFormData: true
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const newRecurso: Recurso = await res.json();

        setResourcesByTask(prev => ({
          ...prev,
          [tareaId]: [...(prev[tareaId] || []), newRecurso]
        }));

        return newRecurso;
      } catch (err) {
        console.error("uploadRecursoForTask error", err);
        setError("Error al subir recurso");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [cursoId]
  );


  // ---------------------------------------------------------------------
  // DELETE RECURSO
  // ---------------------------------------------------------------------
  const deleteRecursoForTask = useCallback(
    async (tareaId: number, recursoId: number) => {
      if (!cursoId) return false;

      setLoading(true);
      setError(null);

      try {
        const res = await apiFetch(
          `/cursos/${cursoId}/recursos/${recursoId}`,
          {
            method: "DELETE",
            secure: true,
            jwtToken
          }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        setResourcesByTask(prev => ({
          ...prev,
          [tareaId]: (prev[tareaId] || []).filter(r => r.id !== recursoId)
        }));

        return true;
      } catch (err) {
        console.error("deleteRecurso error", err);
        setError("Error al eliminar recurso");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [cursoId, jwtToken]
  );


  // ---------------------------------------------------------------------
  // CREATE TASK
  // ---------------------------------------------------------------------
  const createTask = useCallback(async (titulo: string, descripcion?: string, fechaInicio?: string, fechaFin?: string) => {
    if (!cursoId) return null;

    setLoading(true);
    setError(null);

    try {
      const body = {
        titulo,
        descripcion: descripcion || "",
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null
      };

      const res = await apiFetch(`/cursos/${cursoId}/tareas`, {
        method: "POST",
        secure: true,
        jwtToken,
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const nueva: Tarea = await res.json();
      setTasks(prev => [...prev, nueva]);
      return nueva;
    } catch (err) {
      console.error("createTask error", err);
      setError("Error al crear tarea");
      return null;
    } finally {
      setLoading(false);
    }
  }, [cursoId, jwtToken]);


  // ---------------------------------------------------------------------
  // UPDATE TASK
  // ---------------------------------------------------------------------
  const updateTask = useCallback(async (tareaId: number, titulo: string, descripcion?: string, fechaInicio?: string, fechaFin?: string) => {
    if (!cursoId) return false;

    setLoading(true);
    setError(null);

    try {
      const body = {
        titulo,
        descripcion: descripcion || "",
        fechaInicio: fechaInicio || null,
        fechaFin: fechaFin || null
      };

      const res = await apiFetch(`/cursos/${cursoId}/tareas/${tareaId}`, {
        method: "PATCH",
        secure: true,
        jwtToken,
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setTasks(prev =>
        prev.map(t =>
          t.id === tareaId ? { ...t, ...body } : t
        )
      );

      return true;
    } catch (err) {
      console.error("updateTask error", err);
      setError("Error al actualizar tarea");
      return false;
    } finally {
      setLoading(false);
    }
  }, [cursoId, jwtToken]);


  // ---------------------------------------------------------------------
  // GET RECURSO URL
  // ---------------------------------------------------------------------
  const getRecursoUrl = useCallback(async (recursoId: number) => {
    if (!cursoId) return null;

    try {
      const res = await apiFetch(
        `/cursos/${cursoId}/recursos/${recursoId}/descargar-url`,
        {
          method: "GET",
          secure: false
        }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      return json.url || null;
    } catch (err) {
      console.error("getRecursoUrl error", err);
      setError("Error al obtener URL de recurso");
      return null;
    }
  }, [cursoId]);


  return {
    tasks,
    resourcesByTask,
    loading,
    error,

    getTasks,
    getRecursosForTask,
    uploadRecursoForTask,
    deleteRecursoForTask,

    createTask,
    updateTask,

    getRecursoUrl
  };
};

export default useRecursosPorTasks;

import { useState, useCallback } from 'react';
import {
  PaginaTematica,
  CreatePaginaRequest,
  Recurso,
} from '../types/types';

const API_URL = import.meta.env.VITE_API_URL;

export const usePaginasTematicas = (cursoId: number) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginas, setPaginas] = useState<PaginaTematica[]>([]);

  const getPaginas = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/paginas/listar/${cursoId}`);
      if (!response.ok) {
        throw new Error('Error al obtener las páginas');
      }
      const data = await response.json();
      setPaginas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  const createPagina = useCallback(async (data: Omit<CreatePaginaRequest, 'cursoId'>, jwtToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        ...data,
        cursoId,
        fechaProgramada: data.fechaProgramada || null
      };

      const response = await fetch(`${API_URL}/paginas/crear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al crear la página');
      }

      const newPagina = await response.json();
      setPaginas(prev => [...prev, newPagina]);
      return newPagina;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  const uploadRecurso = useCallback(async (paginaId: number, nombre: string, file: File, jwtToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('ownerRecurso', 'PAGINA');
      formData.append('ownerId', paginaId.toString());
      formData.append('nombre', nombre);

      const response = await fetch(`${API_URL}/cursos/${cursoId}/recursos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el archivo');
      }

      const newRecurso: Recurso = await response.json();

      // Actualizar la página con el nuevo recurso
      setPaginas(prev => prev.map(pagina => {
        if (pagina.id === paginaId) {
          return {
            ...pagina,
            recursos: [...(pagina.recursos || []), newRecurso],
          };
        }
        return pagina;
      }));

      return newRecurso;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  const deleteRecurso = useCallback(async (paginaId: number, recursoId: number, jwtToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/cursos/${cursoId}/recursos/${recursoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el recurso');
      }

      // Actualizar la página quitando el recurso eliminado
      setPaginas(prev => prev.map(pagina => {
        if (pagina.id === paginaId) {
          return {
            ...pagina,
            recursos: (pagina.recursos || []).filter(r => r.id !== recursoId),
          };
        }
        return pagina;
      }));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return false;
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  const getRecursoUrl = useCallback(async (recursoId: number, jwtToken?: string) => {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json'
      };
      if (jwtToken) headers['Authorization'] = `Bearer ${jwtToken}`;

      const response = await fetch(`${API_URL}/cursos/${cursoId}/recursos/${recursoId}/descargar-url`, {
        method: 'GET',
        headers
      });
      if (!response.ok) {
        throw new Error('Error al obtener la URL de descarga');
      }
      const data = await response.json();
      return data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return null;
    }
  }, [cursoId]);

  return {
    paginas,
    loading,
    error,
    getPaginas,
    createPagina,
    uploadRecurso,
    deleteRecurso,
    getRecursoUrl,
  };
};
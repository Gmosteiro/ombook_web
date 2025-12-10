import { apiFetch } from '../features/auth/utils/methods';
import { getValidJWTToken } from "../services/session.server";

export type Tarea = {
  id: number;
  titulo: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  fechaCreacion?: string;
  creador: number;
  cursoId: number;
};

export type Recurso = {
  id: number;
  nombreOriginal: string;
  url?: string;
  ownerId: number;
  tipoOwner: string;
};

export type Entrega = {
  id: number;
  estudianteId: number;
  tareaId: number;
  fechaEnvio?: string;
  estado: string;
  calificacion?: number;
};

/**
 * Obtiene todas las tareas de un curso
 */
export async function getTareas(request: Request, cursoId: number): Promise<Tarea[]> {
  const jwtToken = await getValidJWTToken(request);
  const response = await apiFetch(`/cursos/${cursoId}/tareas`, {
    method: "GET",
    secure: true,
    jwtToken,
  });

  if (!response.ok) throw new Error("Error al obtener tareas");
  return await response.json() as Tarea[];
}

/**
 * Obtiene una tarea específica
 */
export async function getTarea(request: Request, cursoId: number, tareaId: number): Promise<Tarea> {
  const jwtToken = await getValidJWTToken(request);
  const response = await apiFetch(`/cursos/${cursoId}/tareas/${tareaId}`, {
    method: "GET",
    secure: true,
    jwtToken,
  });

  if (!response.ok) throw new Error("Error al obtener tarea");
  return await response.json() as Tarea;
}

/**
 * Crea una nueva tarea
 */
export async function createTarea(
  request: Request,
  cursoId: number,
  data: {
    titulo: string;
    descripcion?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }
): Promise<Tarea> {
  const jwtToken = await getValidJWTToken(request);
  const response = await apiFetch(`/cursos/${cursoId}/tareas`, {
    method: "POST",
    secure: true,
    jwtToken,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error al crear tarea");
  }
  return await response.json() as Tarea;
}

/**
 * Actualiza una tarea existente
 */
export async function updateTarea(
  request: Request,
  cursoId: number,
  tareaId: number,
  data: {
    titulo: string;
    descripcion?: string;
    fechaInicio?: string;
    fechaFin?: string;
  }
): Promise<Tarea> {
  const jwtToken = await getValidJWTToken(request);
  const response = await apiFetch(`/cursos/${cursoId}/tareas/${tareaId}`, {
    method: "PUT",
    secure: true,
    jwtToken,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error al actualizar tarea");
  }
  return await response.json() as Tarea;
}

/**
 * Elimina una tarea
 */
export async function deleteTarea(request: Request, cursoId: number, tareaId: number): Promise<boolean> {
  const jwtToken = await getValidJWTToken(request);
  const response = await apiFetch(`/cursos/${cursoId}/tareas/${tareaId}`, {
    method: "DELETE",
    secure: true,
    jwtToken,
  });

  if (!response.ok) throw new Error("Error al eliminar tarea");
  return true;
}

/**
 * Obtiene recursos de una tarea
 */
export async function getRecursosTarea(request: Request, cursoId: number, tareaId: number): Promise<Recurso[]> {
  try {
    const jwtToken = await getValidJWTToken(request);

    const response = await apiFetch(`/cursos/${cursoId}/tareas/${tareaId}/recursos`, {
      method: "GET",
      secure: true,
      jwtToken,
    });

    if (!response.ok) {
      // console.error(`Error fetching recursos for task ${tareaId}:`, response.status, response.statusText);
      return [];
    }
    return await response.json() as Recurso[];
  } catch (error) {
    console.error(`Exception getting recursos for task ${tareaId}:`, error);
    return [];
  }
}

/**
 * Obtiene URL de descarga de un recurso
 */
export async function getRecursoUrl(request: Request, cursoId: number, tareaId: number, recursoId: number): Promise<string> {
  const jwtToken = await getValidJWTToken(request);
  const response = await apiFetch(`/cursos/${cursoId}/tareas/${tareaId}/recursos/${recursoId}/download`, {
    method: "GET",
    secure: true,
    jwtToken,
  });

  if (!response.ok) throw new Error("Error al obtener URL del recurso");
  const data = await response.json() as { url: string };
  return data.url;
}

/**
 * Sube un recurso a una tarea
 */
export async function uploadRecursoTarea(
  request: Request,
  cursoId: number,
  tareaId: number,
  nombre: string,
  file: File
): Promise<Recurso> {
  const jwtToken = await getValidJWTToken(request);
  const formData = new FormData();
  formData.append('nombre', nombre);
  formData.append('archivo', file);

  const response = await apiFetch(`/cursos/${cursoId}/tareas/${tareaId}/recursos`, {
    method: "POST",
    secure: true,
    jwtToken,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error al subir recurso");
  }
  return await response.json() as Recurso;
}

/**
 * Elimina un recurso de una tarea
 */
export async function deleteRecursoTarea(
  request: Request,
  cursoId: number,
  tareaId: number,
  recursoId: number
): Promise<boolean> {
  const jwtToken = await getValidJWTToken(request);
  const response = await apiFetch(`/cursos/${cursoId}/tareas/${tareaId}/recursos/${recursoId}`, {
    method: "DELETE",
    secure: true,
    jwtToken,
  });

  if (!response.ok) throw new Error("Error al eliminar recurso");
  return true;
}

/**
 * Obtiene entregas de una tarea
 */
export async function getEntregasTarea(request: Request, cursoId: number, tareaId: number): Promise<Entrega[]> {
  try {
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch(`/cursos/${cursoId}/tareas/${tareaId}/entregas`, {
      method: "GET",
      secure: true,
      jwtToken,
    });

    if (!response.ok) {
      console.error(`Error fetching entregas for task ${tareaId}:`, response.status, response.statusText);
      return [];
    }
    return await response.json() as Entrega[];
  } catch (error) {
    console.error(`Exception getting entregas for task ${tareaId}:`, error);
    return [];
  }
}

/**
 * Sube una entrega para una tarea
 */
export async function uploadEntrega(
  request: Request,
  cursoId: number,
  tareaId: number,
  file: File
): Promise<Entrega> {
  const jwtToken = await getValidJWTToken(request);
  const formData = new FormData();
  formData.append('archivo', file);

  const response = await apiFetch(`/cursos/${cursoId}/tareas/${tareaId}/entregas`, {
    method: "POST",
    secure: true,
    jwtToken,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Error al subir entrega");
  }
  return await response.json() as Entrega;
}

/**
 * Obtiene URL de descarga de una entrega
 */
export async function getEntregaUrl(
  request: Request,
  cursoId: number,
  tareaId: number,
  estudianteId: number
): Promise<string> {
  const jwtToken = await getValidJWTToken(request);
  const response = await apiFetch(
    `/cursos/${cursoId}/tareas/${tareaId}/entregas/estudiantes/${estudianteId}/archivo`,
    {
      method: "GET",
      secure: true,
      jwtToken,
    }
  );

  if (!response.ok) throw new Error("Error al obtener URL de entrega");
  const data = await response.json() as { url: string };
  return data.url;
}

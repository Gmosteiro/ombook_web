import { useEffect, useState } from "react";
import { useLoaderData, useOutletContext, Link, Form, useFetcher } from "react-router";
import { getValidJWTToken, getUserRole } from "~/services/session.server";
import { apiFetch } from "../../auth/utils/methods";
import { UploadResourceDialog } from "./UploadResourceDialog";
import useRecursosPorTasks from "../hooks/useRecursosPorTasks";
import type { Course } from "../types/types";

type Tarea = {
  id: number;
  titulo: string;
  descripcion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  fechaCreacion?: string;
  visibilidad?: string;
  cursoId?: number;
  creador?: number; // user id
};

type Recurso = {
  id: number;
  nombreOriginal: string;
  ownerRecurso: string;
  ownerId: number;
  contentType?: string;
  sizeBytes?: number;
  fechaSubida?: string;
  subidoPorUsuarioId?: number;
};

export async function loader({ params, request }: { params: { id: string }, request: Request }) {
  const { id } = params;
  try {
    const jwtToken = await getValidJWTToken(request);
    const userRole = await getUserRole(request);

    const res = await apiFetch(`/cursos/${id}/tareas`, {
      method: 'GET',
      secure: true,
      jwtToken
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const tareas: Tarea[] = await res.json();

    return {
      tareas,
      jwtToken,
      isProfesor: userRole === 'PROFESOR'
    };
  } catch (err) {
    console.error("Error fetching tareas:", err);
    return {
      tareas: [] as Tarea[],
      jwtToken: '',
      isProfesor: false
    };
  }
}

export default function CourseTasks() {
  const context = useOutletContext<{ course: Course }>();
  const course = context?.course;

  const loaderData = useLoaderData() as { tareas: Tarea[]; jwtToken: string; isProfesor: boolean };
  const tareas = loaderData?.tareas || [];
  const jwtToken = loaderData?.jwtToken || '';
  const isProfesor = loaderData?.isProfesor || false;

  const deleteFetcher = useFetcher();
  const uploadFetcher = useFetcher();

  // Hook that centralizes recursos per tarea
  const recursosHook = useRecursosPorTasks(course?.id as number | undefined, jwtToken || undefined);
  const { resourcesByTask, getRecursosForTask, removeResource, getRecursoUrl, uploadRecursoForTask } = recursosHook;

  // NOTE: upload/delete action handlers are registered below (after state declarations)

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  // resourcesByTask is managed by useRecursosPorTasks
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showUploadFor, setShowUploadFor] = useState<number | null>(null);


  // Handle delete results from the action (if deletion failed, refetch current expanded task recursos)
  useEffect(() => {
    if (deleteFetcher && deleteFetcher.data) {
      try {
        const data = deleteFetcher.data as any;
        if (data && data.error) {
          console.error('Error deleting recurso via action:', data.error);
          if (expandedId) getRecursosForTask(expandedId);
        }
      } catch (err) {
        console.error('Error processing delete recurso result:', err);
      }
    }
  }, [deleteFetcher.data, expandedId, getRecursosForTask]);

  // Handle upload results from the action
  useEffect(() => {
    if (uploadFetcher && uploadFetcher.data) {
      try {
        const data = uploadFetcher.data as any;
        if (data && data.error) {
          console.error('Error uploading recurso via action:', data.error);
        } else if (data && data.success) {
          console.log('Recurso uploaded successfully');
          setShowUploadFor(null);
          if (showUploadFor) getRecursosForTask(showUploadFor);
        }
      } catch (err) {
        console.error('Error processing upload recurso result:', err);
      }
    }
  }, [uploadFetcher.data, showUploadFor, getRecursosForTask]);

  useEffect(() => {
    if (jwtToken) {
      try {
        const payload = JSON.parse(atob(jwtToken.split('.')[1]));
        setCurrentUserId(payload.id || payload.sub);
      } catch (e) {
        // ignore
      }
    }
  }, [jwtToken]);

  const canEdit = (t: Tarea) => isProfesor || currentUserId === t.creador;

  const toggleExpand = async (t: Tarea) => {
    const next = expandedId === t.id ? null : t.id;
    setExpandedId(next);
    if (next) {
      // load recursos for this tarea via hook
      try {
        await getRecursosForTask(t.id);
      } catch (err) {
        console.error('Error fetching recursos for tarea', t.id, err);
      }
    }
  };

  const handleUploadResource = async (nombre: string, file: File) => {
    const tareaId = showUploadFor;
    if (!course?.id || !tareaId) return;
    const formData = new FormData();
    formData.append('_action', 'uploadResource');
    formData.append('cursoId', String(course.id));
    formData.append('tareaId', String(tareaId));
    formData.append('nombre', nombre);
    formData.append('file', file);
    uploadFetcher.submit(formData, { method: 'POST' });
  };

  const handleDownloadResource = async (recurso: Recurso) => {
    if (!course?.id) return;
    try {
      const url = await getRecursoUrl(recurso.id);
      if (url) window.open(url, '_blank');
    } catch (err) {
      console.error('Error getting download url:', err);
    }
  };

  const handleDeleteResource = async (recurso: Recurso) => {
    if (!course?.id) return;
    if (!window.confirm('¿Eliminar recurso?')) return;
    const formData = new FormData();
    formData.append('_action', 'deleteResource');
    formData.append('cursoId', String(course.id));
    formData.append('recursoId', String(recurso.id));
    deleteFetcher.submit(formData, { method: 'DELETE' });
    // Optimistically update UI
    removeResource(recurso.ownerId, recurso.id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Tareas</h1>
        {isProfesor && (
          <div>
            <button onClick={() => setShowNewTask(s => !s)} className="px-3 py-1 bg-blue-600 text-white rounded">
              {showNewTask ? 'Cancelar' : 'Crear Tarea'}
            </button>
          </div>
        )}
      </div>

      {showNewTask && (
        <Form method="POST" className="mb-4 bg-white p-4 rounded-md shadow">
          <input type="hidden" name="_action" value="createTask" />
          <input type="hidden" name="cursoId" value={course?.id || ''} />
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label htmlFor="new-titulo" className="block text-sm font-medium">Título</label>
              <input id="new-titulo" name="titulo" placeholder="Título" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" required />
            </div>
            <div>
              <label htmlFor="new-descripcion" className="block text-sm font-medium">Descripción</label>
              <textarea id="new-descripcion" name="descripcion" placeholder="Descripción" rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="new-fechaInicio" className="block text-sm font-medium">Fecha inicio</label>
                <input id="new-fechaInicio" name="fechaInicio" type="datetime-local" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
              <div>
                <label htmlFor="new-fechaFin" className="block text-sm font-medium">Fecha fin</label>
                <input id="new-fechaFin" name="fechaFin" type="datetime-local" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewTask(false)} className="px-3 py-1 border rounded">Cancelar</button>
              <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Crear</button>
            </div>
          </div>
        </Form>
      )}

      <div className="space-y-4">
        {tareas.length === 0 && <div className="text-gray-500">No hay tareas.</div>}
        {tareas.map(t => (
          <div key={t.id} className="bg-white rounded-md shadow overflow-hidden">
            <div className="p-4 flex justify-between items-start">
              <div>
                <div className="text-lg font-semibold">{t.titulo}</div>
                <div className="text-xs text-gray-500">{t.fechaCreacion ? new Date(t.fechaCreacion).toLocaleString() : ''}</div>
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">{t.descripcion}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  {canEdit(t) && (
                    <>
                      <button onClick={() => setEditingId(editingId === t.id ? null : t.id)} className="text-blue-600 text-sm">{editingId === t.id ? 'Cancelar' : 'Editar'}</button>
                    </>
                  )}
                  {isProfesor ? (
                    <Link to={`tasks/${t.id}/submissions`} className="px-3 py-1 bg-gray-100 rounded text-sm">Detalles de Entregas</Link>
                  ) : (
                    <button className="px-3 py-1 bg-gray-100 rounded text-sm" disabled>Entregar</button>
                  )}
                </div>
                <button onClick={() => toggleExpand(t)} className="text-sm text-gray-500">{expandedId === t.id ? 'Cerrar' : 'Ver detalles'}</button>
              </div>
            </div>

            {editingId === t.id && (
              <Form method="PATCH" className="p-4 border-t bg-gray-50">
                <input type="hidden" name="_action" value="updateTask" />
                <input type="hidden" name="cursoId" value={course?.id || ''} />
                <input type="hidden" name="tareaId" value={t.id} />
                <div className="space-y-2">
                  <div>
                    <label htmlFor={`edit-titulo-${t.id}`} className="block text-sm font-medium">Título</label>
                    <input id={`edit-titulo-${t.id}`} name="titulo" placeholder="Título" defaultValue={t.titulo} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                  </div>
                  <div>
                    <label htmlFor={`edit-desc-${t.id}`} className="block text-sm font-medium">Descripción</label>
                    <textarea id={`edit-desc-${t.id}`} name="descripcion" placeholder="Descripción" defaultValue={t.descripcion} rows={3} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor={`edit-fechaInicio-${t.id}`} className="block text-sm font-medium">Fecha inicio</label>
                        <input id={`edit-fechaInicio-${t.id}`} name="fechaInicio" type="datetime-local" title="Fecha inicio" defaultValue={t.fechaInicio ? new Date(t.fechaInicio).toISOString().slice(0,16) : ''} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                    </div>
                    <div>
                      <label htmlFor={`edit-fechaFin-${t.id}`} className="block text-sm font-medium">Fecha fin</label>
                      <input id={`edit-fechaFin-${t.id}`} name="fechaFin" type="datetime-local" title="Fecha fin" defaultValue={t.fechaFin ? new Date(t.fechaFin).toISOString().slice(0,16) : ''} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 border rounded">Cancelar</button>
                    <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Guardar</button>
                  </div>
                </div>
              </Form>
            )}

            {expandedId === t.id && (
              <div className="p-4 border-t space-y-4">
                <div>
                  <div className="text-sm font-medium">Descripción</div>
                  <div className="text-sm text-gray-700 whitespace-pre-line mt-1">{t.descripcion}</div>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <div>Inicio: {t.fechaInicio ? new Date(t.fechaInicio).toLocaleString() : '-'}</div>
                  <div>Fin: {t.fechaFin ? new Date(t.fechaFin).toLocaleString() : '-'}</div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Recursos</div>
                  <div className="space-y-2">
                    {(resourcesByTask[t.id] || []).length === 0 && <div className="text-gray-500">No hay recursos.</div>}
                    {(resourcesByTask[t.id] || []).map(r => (
                      <div key={r.id} className="flex justify-between items-center bg-white border rounded p-2">
                        <div className="text-sm">{r.nombreOriginal}</div>
                        <div className="flex gap-2">
                          <button onClick={() => handleDownloadResource(r)} className="text-blue-600 text-sm">Descargar</button>
                          {isProfesor && (
                            <button onClick={() => handleDeleteResource(r)} className="text-red-600 text-sm">Eliminar</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isProfesor && (
                    <div className="mt-3 border-t pt-3">
                      <button onClick={() => setShowUploadFor(t.id)} className="px-3 py-1 bg-green-600 text-white rounded">Subir recurso</button>
                      <UploadResourceDialog
                        isOpen={showUploadFor === t.id}
                        onClose={() => setShowUploadFor(null)}
                        onUpload={handleUploadResource}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const action = formData.get('_action') as string;

  if (action === 'uploadResource') {
    const cursoId = formData.get('cursoId') as string;
    const tareaId = formData.get('tareaId') as string;
    const nombre = formData.get('nombre') as string;
    const file = formData.get('file') as File;

    if (!cursoId || !tareaId || !nombre || !file) {
      return { error: 'Missing required fields' };
    }

    try {
      const jwtToken = await getValidJWTToken(request);
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('nombre', nombre);

      const res = await apiFetch(`/cursos/${cursoId}/tareas/${tareaId}/recursos`, {
        method: 'POST',
        secure: true,
        jwtToken,
        body: uploadFormData
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Upload failed:', errorText);
        return { error: `HTTP ${res.status}: ${errorText}` };
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error uploading resource:', err);
      return { error: err.message || 'Upload failed' };
    }
  }

  return { error: 'Unknown action' };
}


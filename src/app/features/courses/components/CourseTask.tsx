import { useEffect, useState } from "react";
import { useLoaderData, useOutletContext, Link } from "react-router";
import { getValidJWTToken, getUserRole } from "~/services/session.server";
import { UploadResourceDialog } from "./UploadResourceDialog";
import useRecursosPorTasks from "../hooks/useRecursosPorTasks";
import type { Course, Tarea, Recurso } from "../types/types";

export async function loader({ params, request }: { params: { id: string }, request: Request }) {
  const { id } = params;
  try {
    const jwtToken = await getValidJWTToken(request);
    const userRole = await getUserRole(request);

    return {
      jwtToken,
      isProfesor: userRole === 'PROFESOR'
    };
  } catch (err) {
    console.error("Error in loader:", err);
    return {
      jwtToken: '',
      isProfesor: false
    };
  }
}

export default function CourseTasks() {
  const context = useOutletContext<{ course: Course }>();
  const course = context?.course;

  const loaderData = useLoaderData() as { jwtToken: string; isProfesor: boolean };
  const jwtToken = loaderData?.jwtToken || '';
  const isProfesor = loaderData?.isProfesor || false;

  // Hook that centralizes tareas and recursos per tarea
  const recursosHook = useRecursosPorTasks(course?.id as number | undefined, jwtToken || undefined);
  const { tasks, resourcesByTask, getRecursosForTask, removeResource, getRecursoUrl, uploadRecursoForTask, deleteRecursoForTask, createTask, updateTask } = recursosHook;

  // NOTE: upload/delete action handlers are registered below (after state declarations)

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  // resourcesByTask is managed by useRecursosPorTasks
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showUploadFor, setShowUploadFor] = useState<number | null>(null);

  // Form states
  const [newTaskData, setNewTaskData] = useState({
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: ''
  });
  const [editTaskData, setEditTaskData] = useState({
    titulo: '',
    descripcion: '',
    fechaInicio: '',
    fechaFin: ''
  });



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
    if (!tareaId) return;
    const result = await uploadRecursoForTask(tareaId, nombre, file, jwtToken);
    if (result) {
      setShowUploadFor(null);
      getRecursosForTask(tareaId);
    }
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
    if (!window.confirm('¿Eliminar recurso?')) return;
    const success = await deleteRecursoForTask(recurso.ownerId, recurso.id);
    if (success) {
      // already updated in hook
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createTask(
      newTaskData.titulo,
      newTaskData.descripcion,
      newTaskData.fechaInicio || undefined,
      newTaskData.fechaFin || undefined
    );
    if (result) {
      setNewTaskData({ titulo: '', descripcion: '', fechaInicio: '', fechaFin: '' });
      setShowNewTask(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const success = await updateTask(
      editingId,
      editTaskData.titulo,
      editTaskData.descripcion,
      editTaskData.fechaInicio || undefined,
      editTaskData.fechaFin || undefined
    );
    if (success) {
      setEditingId(null);
      setEditTaskData({ titulo: '', descripcion: '', fechaInicio: '', fechaFin: '' });
    }
  };

  const startEditing = (t: Tarea) => {
    setEditingId(t.id);
    setEditTaskData({
      titulo: t.titulo,
      descripcion: t.descripcion || '',
      fechaInicio: t.fechaInicio ? new Date(t.fechaInicio).toISOString().slice(0,16) : '',
      fechaFin: t.fechaFin ? new Date(t.fechaFin).toISOString().slice(0,16) : ''
    });
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
        <form onSubmit={handleCreateTask} className="mb-4 bg-white p-4 rounded-md shadow">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <label htmlFor="new-titulo" className="block text-sm font-medium">Título</label>
              <input
                id="new-titulo"
                value={newTaskData.titulo}
                onChange={(e) => setNewTaskData(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Título"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label htmlFor="new-descripcion" className="block text-sm font-medium">Descripción</label>
              <textarea
                id="new-descripcion"
                value={newTaskData.descripcion}
                onChange={(e) => setNewTaskData(prev => ({ ...prev, descripcion: e.target.value }))}
                placeholder="Descripción"
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="new-fechaInicio" className="block text-sm font-medium">Fecha inicio</label>
                <input
                  id="new-fechaInicio"
                  value={newTaskData.fechaInicio}
                  onChange={(e) => setNewTaskData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                  type="datetime-local"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="new-fechaFin" className="block text-sm font-medium">Fecha fin</label>
                <input
                  id="new-fechaFin"
                  value={newTaskData.fechaFin}
                  onChange={(e) => setNewTaskData(prev => ({ ...prev, fechaFin: e.target.value }))}
                  type="datetime-local"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowNewTask(false)} className="px-3 py-1 border rounded">Cancelar</button>
              <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Crear</button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {tasks.length === 0 && <div className="text-gray-500">No hay tareas.</div>}
        {tasks.map((t: Tarea) => (
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
                      <button onClick={() => editingId === t.id ? setEditingId(null) : startEditing(t)} className="text-blue-600 text-sm">{editingId === t.id ? 'Cancelar' : 'Editar'}</button>
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
              <form onSubmit={handleUpdateTask} className="p-4 border-t bg-gray-50">
                <div className="space-y-2">
                  <div>
                    <label htmlFor={`edit-titulo-${t.id}`} className="block text-sm font-medium">Título</label>
                    <input
                      id={`edit-titulo-${t.id}`}
                      value={editTaskData.titulo}
                      onChange={(e) => setEditTaskData(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Título"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label htmlFor={`edit-desc-${t.id}`} className="block text-sm font-medium">Descripción</label>
                    <textarea
                      id={`edit-desc-${t.id}`}
                      value={editTaskData.descripcion}
                      onChange={(e) => setEditTaskData(prev => ({ ...prev, descripcion: e.target.value }))}
                      placeholder="Descripción"
                      rows={3}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor={`edit-fechaInicio-${t.id}`} className="block text-sm font-medium">Fecha inicio</label>
                      <input
                        id={`edit-fechaInicio-${t.id}`}
                        value={editTaskData.fechaInicio}
                        onChange={(e) => setEditTaskData(prev => ({ ...prev, fechaInicio: e.target.value }))}
                        type="datetime-local"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                    <div>
                      <label htmlFor={`edit-fechaFin-${t.id}`} className="block text-sm font-medium">Fecha fin</label>
                      <input
                        id={`edit-fechaFin-${t.id}`}
                        value={editTaskData.fechaFin}
                        onChange={(e) => setEditTaskData(prev => ({ ...prev, fechaFin: e.target.value }))}
                        type="datetime-local"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button type="button" onClick={() => setEditingId(null)} className="px-3 py-1 border rounded">Cancelar</button>
                    <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Guardar</button>
                  </div>
                </div>
              </form>
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



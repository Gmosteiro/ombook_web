import { useEffect, useState } from "react";
import { useLoaderData, useOutletContext, Link, Outlet, useLocation } from "react-router";
import { getValidJWTToken, getUserRole } from "~/services/session.server";
import { UploadResourceDialog } from "./UploadResourceDialog";
import useRecursosPorTasks from "../hooks/useRecursosPorTasks";
import type { Course, Tarea, Recurso, Entrega } from "../types/types";

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
  const location = useLocation();

  const loaderData = useLoaderData() as { jwtToken: string; isProfesor: boolean };
  const jwtToken = loaderData?.jwtToken || '';
  const isProfesor = loaderData?.isProfesor || false;

  const recursosHook = useRecursosPorTasks(course?.id as number | undefined, jwtToken || undefined);
  const { tasks, resourcesByTask, getRecursosForTask, getRecursoUrl, uploadRecursoForTask, deleteRecursoForTask, createTask, updateTask } = recursosHook;


  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showUploadFor, setShowUploadFor] = useState<number | null>(null);
  const [submissionsByTask, setSubmissionsByTask] = useState<Record<number, Entrega[]>>({});
  const [showUploadSubmissionFor, setShowUploadSubmissionFor] = useState<number | null>(null);
  const [uploadSubmissionError, setUploadSubmissionError] = useState<string>('');

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
      }
    }
  }, [jwtToken]);

  const canEdit = (t: Tarea) => isProfesor || currentUserId === t.creador;

  const getTaskStatus = (t: Tarea) => {
    if (t.fechaFin) {
      const now = new Date();
      const fin = new Date(t.fechaFin);
      if (fin < now) {
        return 'overdue';
      }
    }
    return 'pending';
  };

  const toggleExpand = async (t: Tarea) => {
    const next = expandedId === t.id ? null : t.id;
    setExpandedId(next);
    if (next) {
      try {
        await getRecursosForTask(t.id);
        await getSubmissionsForTask(t.id);
      } catch (err) {
        console.error('Error fetching recursos for tarea', t.id, err);
      }
    }
  };

  const getSubmissionsForTask = async (tareaId: number) => {
    if (!course?.id) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cursos/${course.id}/tareas/${tareaId}/entregas`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      });
      if (response.ok) {
        const data: Entrega[] = await response.json();
        setSubmissionsByTask(prev => ({ ...prev, [tareaId]: data }));
      } else {
        console.error('Error fetching submissions:', response.statusText);
      }
    } catch (err) {
      console.error('Error fetching submissions:', err);
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

  const handleUploadSubmission = async (file: File) => {
    const tareaId = showUploadSubmissionFor;
    if (!tareaId || !course?.id) return;

    const allowedExtensions = ['.txt', '.doc', '.docx', '.pdf', '.zip', '.rar'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      setUploadSubmissionError('Formato de archivo no permitido. Los formatos permitidos son: .txt, .doc, .docx, .pdf, .zip, .rar');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('archivo', file);
      console.log("Upload → curso:", course?.id, "tarea:", tareaId, "file:", file);
      console.log("URL usada:", `${import.meta.env.VITE_API_URL}/cursos/${course?.id}/tareas/${tareaId}/entregas`);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/cursos/${course.id}/tareas/${tareaId}/entregas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: formData,
      });

      if (response.ok) {
        setUploadSubmissionError('');
        setShowUploadSubmissionFor(null);
        getSubmissionsForTask(tareaId);
      } else {
        try {
          const errorData = await response.json();
          setUploadSubmissionError(errorData.message || 'Error al subir la entrega');
        } catch {
          setUploadSubmissionError('Error al subir la entrega');
        }
      }
    } catch (err) {
      console.error('Error uploading submission:', err);
      setUploadSubmissionError('Error de conexión al subir la entrega');
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

  const handleDownloadSubmission = async (tareaId: number, entrega: Entrega) => {
    if (!course?.id) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/cursos/${course.id}/tareas/${tareaId}/entregas/estudiantes/${entrega.estudianteId}/archivo`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.url) window.open(data.url, '_blank');
      } else {
        console.error('Error getting submission download url:', response.statusText);
      }
    } catch (err) {
      console.error('Error getting submission download url:', err);
    }
  };

  const handleDeleteResource = async (recurso: Recurso) => {
    if (!window.confirm('¿Eliminar recurso?')) return;
    const success = await deleteRecursoForTask(recurso.ownerId, recurso.id);
    if (success) {

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


  const isInSubmissionsView = location.pathname.includes('/submissions');

  return (
    <div>
      {!isInSubmissionsView && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-semibold">Tareas</h1>
            {isProfesor && (
              <div>
                <button onClick={() => setShowNewTask(s => !s)} className={showNewTask ? "ombook-btn ombook-btn-secondary" : "ombook-btn ombook-btn-primary"}>
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
                  <button type="button" onClick={() => setShowNewTask(false)} className="ombook-btn ombook-btn-secondary">Cancelar</button>
                  <button type="submit" className="ombook-btn ombook-btn-primary">Crear</button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {tasks.length === 0 && <div className="text-gray-500">No hay tareas.</div>}
            {tasks.map((t: Tarea) => (
          <div key={t.id} className={`bg-white rounded-md shadow overflow-hidden cursor-pointer ${getTaskStatus(t) === 'overdue' ? 'ombook-border-brown border-l-4' : ''}`} onClick={() => toggleExpand(t)}>
            <div className="p-4 flex justify-between items-start">
               <div>
                 <div className="flex items-center gap-2">
                   <div className="text-lg font-semibold">{t.titulo}</div>
                   <span className={`ombook-badge ${getTaskStatus(t) === 'overdue' ? 'ombook-badge-brown' : 'ombook-badge-green'}`}>{getTaskStatus(t) === 'overdue' ? 'Vencida' : 'En Fecha'}</span>
                 </div>
                 <div className="text-xs text-gray-500">{t.fechaCreacion ? new Date(t.fechaCreacion).toLocaleString() : ''}</div>
                 <p className="text-sm text-gray-700 mt-2 line-clamp-2">{t.descripcion}</p>
               </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  {canEdit(t) && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); editingId === t.id ? setEditingId(null) : startEditing(t); }} className="ombook-text-green text-sm">{editingId === t.id ? 'Cancelar' : 'Editar'}</button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {editingId === t.id && (
              <form onSubmit={(e) => { e.stopPropagation(); handleUpdateTask(e); }} onClick={(e) => e.stopPropagation()} className="p-4 border-t bg-gray-50">
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
                    <button type="button" onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="ombook-btn ombook-btn-secondary">Cancelar</button>
                    <button type="submit" className="ombook-btn ombook-btn-primary">Guardar</button>
                  </div>
                </div>
              </form>
            )}

            {expandedId === t.id && (
              <div className="p-4 border-t space-y-4" onClick={(e) => e.stopPropagation()}>
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
                          <button onClick={(e) => { e.stopPropagation(); handleDownloadResource(r); }} className="ombook-text-green text-sm">Descargar</button>
                          {isProfesor && (
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteResource(r); }} className="ombook-text-brown-dark text-sm">Eliminar</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {isProfesor && (
                    <div className="mt-3 border-t pt-3">
                      <button onClick={(e) => { e.stopPropagation(); setShowUploadFor(t.id); }} className="ombook-btn ombook-btn-primary">Subir recurso</button>
                      <UploadResourceDialog
                        isOpen={showUploadFor === t.id}
                        onClose={() => setShowUploadFor(null)}
                        onUpload={handleUploadResource}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Entrega</div>
                  {isProfesor ? (
                    <Link to={`${t.id}/submissions`} onClick={(e) => e.stopPropagation()} className="px-3 py-1 bg-gray-100 rounded text-sm">Ver Entregas</Link>
                  ) : (
                    <div className="space-y-2">
                      {(submissionsByTask[t.id] || []).length === 0 ? (
                        <div>
                          <div className="text-gray-500">No hay entregas</div>
                          <button onClick={(e) => { e.stopPropagation(); setUploadSubmissionError(''); setShowUploadSubmissionFor(t.id); }} className="ombook-btn ombook-btn-primary mt-2">Entregar</button>
                        </div>
                      ) : (
                        (submissionsByTask[t.id] || []).map(entrega => (
                          <div key={entrega.id} className="bg-white border rounded p-2">
                            <div className="text-sm">Entregado el {entrega.fechaEnvio ? new Date(entrega.fechaEnvio).toLocaleString() : '-'}</div>
                            <div className="text-sm">Estado: {entrega.estado}</div>
                            {entrega.calificacion !== undefined && <div className="text-sm">Calificación: {entrega.calificacion}</div>}
                            <div className="flex gap-2 mt-2">
                              <button onClick={(e) => { e.stopPropagation(); handleDownloadSubmission(t.id, entrega); }} className="ombook-text-green text-sm">Descargar</button>
                              <Link
  to={`${t.id}/submissions/${entrega.id}`}
  onClick={(e) => e.stopPropagation()}
  className="ombook-text-blue text-sm"
>
  Ver más detalles
</Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  <UploadResourceDialog
                    isOpen={showUploadSubmissionFor === t.id}
                    onClose={() => setShowUploadSubmissionFor(null)}
                    onUpload={(nombre, file) => handleUploadSubmission(file)}
                    showNombre={false}
                  />
                  {uploadSubmissionError && <div className="text-red-500 text-sm mt-2">{uploadSubmissionError}</div>}
                </div>
              </div>
            )}
          </div>
            ))}
          </div>
        </>
      )}

      <Outlet context={{ course }} />

    </div>
  );
}





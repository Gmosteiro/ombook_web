import { useState } from "react";
import { useLoaderData, useOutletContext, Outlet, useLocation, redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from "react-router";
import { getUserRole, getCurrentUserId } from "~/services/session.server";
import { UserRole } from "~/features/auth/types";
import { UploadResourceDialog } from "./UploadResourceDialog";
import type { Course } from "../types/types";
import { TaskList } from "./tasks/TaskList";
import { TaskForm } from "./tasks/TaskForm";
import {
  getTareas,
  createTarea,
  updateTarea,
  getRecursosTarea,
  getRecursoUrl,
  uploadRecursoTarea,
  deleteRecursoTarea,
  getEntregasTarea,
  uploadEntrega,
  getEntregaUrl,
  type Tarea,
  type Recurso,
  type Entrega,
} from "~/routes/api.tareas";

type LoaderData = {
  isProfesor: boolean;
  currentUserId: number;
  tasks: Tarea[];
  taskDetails?: {
    recursos: Record<number, Recurso[]>;
    entregas: Record<number, Entrega[]>;
  };
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  // REMOVE the try-catch - let redirects propagate
  const userRole = await getUserRole(request);
  const currentUserId = await getCurrentUserId(request);
  const courseId = parseInt(params.id || '0');

  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const tasks = await getTareas(request, courseId);

  // Pre-load recursos and entregas for all tasks
  const taskDetails: { recursos: Record<number, Recurso[]>; entregas: Record<number, Entrega[]> } = {
    recursos: {},
    entregas: {}
  };

  // Keep try-catch only around optional data loading, not session checks
  await Promise.all(
    tasks.map(async (task) => {
      try {
        const [recursos, entregas] = await Promise.all([
          getRecursosTarea(request, courseId, task.id),
          getEntregasTarea(request, courseId, task.id)
        ]);
        taskDetails.recursos[task.id] = recursos;
        taskDetails.entregas[task.id] = entregas;
      } catch (err) {
        console.error(`Error loading details for task ${task.id}:`, err);
        taskDetails.recursos[task.id] = [];
        taskDetails.entregas[task.id] = [];
      }
    })
  );

  return {
    isProfesor: userRole === UserRole.PROFESOR,
    currentUserId,
    tasks,
    taskDetails,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const courseId = parseInt(params.id || '0');
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  const formData = await request.formData();
  const _action = formData.get("_action") as string;

  try {
    switch (_action) {
      case "createTask": {
        const titulo = formData.get("titulo") as string;
        const descripcion = formData.get("descripcion") as string;
        const fechaInicio = formData.get("fechaInicio") as string;
        const fechaFin = formData.get("fechaFin") as string;

        await createTarea(request, courseId, {
          titulo,
          descripcion: descripcion || undefined,
          fechaInicio: fechaInicio || undefined,
          fechaFin: fechaFin || undefined,
        });

        // Redirect limpia el estado y recarga los datos
        return redirect(`/courses/${courseId}/tasks`);
      }

      case "updateTask": {
        const tareaId = parseInt(formData.get("tareaId") as string);
        const titulo = formData.get("titulo") as string;
        const descripcion = formData.get("descripcion") as string;
        const fechaInicio = formData.get("fechaInicio") as string;
        const fechaFin = formData.get("fechaFin") as string;

        await updateTarea(request, courseId, tareaId, {
          titulo,
          descripcion: descripcion || undefined,
          fechaInicio: fechaInicio || undefined,
          fechaFin: fechaFin || undefined,
        });

        return redirect(`/courses/${courseId}/tasks`);
      }

      case "uploadRecurso": {
        const tareaId = parseInt(formData.get("tareaId") as string);
        const nombre = formData.get("nombre") as string;
        const archivo = formData.get("archivo") as File;

        await uploadRecursoTarea(request, courseId, tareaId, nombre, archivo);
        return redirect(`/courses/${courseId}/tasks`);
      }

      case "deleteRecurso": {
        const tareaId = parseInt(formData.get("tareaId") as string);
        const recursoId = parseInt(formData.get("recursoId") as string);

        await deleteRecursoTarea(request, courseId, tareaId, recursoId);
        return redirect(`/courses/${courseId}/tasks`);
      }

      case "uploadEntrega": {
        const tareaId = parseInt(formData.get("tareaId") as string);
        const archivo = formData.get("archivo") as File;

        await uploadEntrega(request, courseId, tareaId, archivo);
        return redirect(`/courses/${courseId}/tasks`);
      }

      case "downloadRecurso": {
        const tareaId = parseInt(formData.get("tareaId") as string);
        const recursoId = parseInt(formData.get("recursoId") as string);

        const url = await getRecursoUrl(request, courseId, tareaId, recursoId);
        return { url };
      }

      case "downloadEntrega": {
        const tareaId = parseInt(formData.get("tareaId") as string);
        const estudianteId = parseInt(formData.get("estudianteId") as string);

        const url = await getEntregaUrl(request, courseId, tareaId, estudianteId);
        return { url };
      }

      default:
        return { error: "Unknown action" };
    }
  } catch (error) {
    console.error("Error in action: case " + _action, error);
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export default function CourseTasks() {
  const context = useOutletContext<{ course: Course }>();
  const course = context?.course;
  const location = useLocation();

  const { isProfesor, currentUserId, tasks, taskDetails } = useLoaderData<LoaderData>();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [showUploadFor, setShowUploadFor] = useState<number | null>(null);
  const [showUploadSubmissionFor, setShowUploadSubmissionFor] = useState<number | null>(null);
  const [uploadSubmissionError, setUploadSubmissionError] = useState<string>('');

  const resourcesByTask = taskDetails?.recursos || {};
  const submissionsByTask = taskDetails?.entregas || {};

  const handleToggleExpand = (taskId: number) => {
    setExpandedId(expandedId === taskId ? null : taskId);
  };

  const handleDownloadRecurso = async (recurso: Recurso) => {
    if (!course?.id) return;
    const formData = new FormData();
    formData.append('_action', 'downloadRecurso');
    formData.append('tareaId', recurso.ownerId.toString());
    formData.append('recursoId', recurso.id.toString());

    try {
      const response = await fetch(`/courses/${course.id}/tasks`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Error getting download url:', err);
    }
  };

  const handleDownloadEntrega = async (tareaId: number, entrega: Entrega) => {
    if (!course?.id) return;
    const formData = new FormData();
    formData.append('_action', 'downloadEntrega');
    formData.append('tareaId', tareaId.toString());
    formData.append('estudianteId', entrega.estudianteId.toString());

    try {
      const response = await fetch(`/courses/${course.id}/tasks`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.url) window.open(data.url, '_blank');
    } catch (err) {
      console.error('Error getting submission download url:', err);
    }
  };

  const handleUploadResource = async (nombre: string, file: File) => {
    const tareaId = showUploadFor;
    if (!tareaId || !course?.id) return;

    const formData = new FormData();
    formData.append('_action', 'uploadRecurso');
    formData.append('tareaId', tareaId.toString());
    formData.append('nombre', nombre);
    formData.append('archivo', file);

    try {
      const response = await fetch(`/courses/${course.id}/tasks`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setShowUploadFor(null);
        window.location.reload(); // Recargar para obtener datos actualizados
      }
    } catch (err) {
      console.error('Error uploading resource:', err);
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

    const formData = new FormData();
    formData.append('_action', 'uploadEntrega');
    formData.append('tareaId', tareaId.toString());
    formData.append('archivo', file);

    try {
      const response = await fetch(`/courses/${course.id}/tasks`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadSubmissionError('');
        setShowUploadSubmissionFor(null);
        window.location.reload(); // Recargar para obtener datos actualizados
      } else {
        const errorData = await response.json();
        setUploadSubmissionError(errorData.message || 'Error al subir la entrega');
      }
    } catch (err) {
      console.error('Error uploading submission:', err);
      setUploadSubmissionError('Error de conexión al subir la entrega');
    }
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
                <button
                  onClick={() => setShowNewTask(s => !s)}
                  className={showNewTask ? "ombook-btn ombook-btn-secondary" : "ombook-btn ombook-btn-primary"}
                >
                  {showNewTask ? 'Cancelar' : 'Crear Tarea'}
                </button>
              </div>
            )}
          </div>

          {showNewTask && (
            <TaskForm
              key="create-task-form"
              mode="create"
              onCancel={() => setShowNewTask(false)}
            />
          )}

          <TaskList
            tasks={tasks}
            resourcesByTask={resourcesByTask}
            submissionsByTask={submissionsByTask}
            expandedId={expandedId}
            editingId={editingId}
            currentUserId={currentUserId}
            isProfesor={isProfesor}
            onToggleExpand={handleToggleExpand}
            onStartEdit={setEditingId}
            onCancelEdit={() => setEditingId(null)}
            onDownloadRecurso={handleDownloadRecurso}
            onDownloadEntrega={handleDownloadEntrega}
            onShowUploadRecurso={setShowUploadFor}
            onShowUploadEntrega={setShowUploadSubmissionFor}
          />

          <UploadResourceDialog
            isOpen={showUploadFor !== null}
            onClose={() => setShowUploadFor(null)}
            onUpload={handleUploadResource}
          />

          <UploadResourceDialog
            isOpen={showUploadSubmissionFor !== null}
            onClose={() => setShowUploadSubmissionFor(null)}
            onUpload={(_, file) => handleUploadSubmission(file)}
            showNombre={false}
          />

          {uploadSubmissionError && (
            <div className="text-red-500 text-sm mt-2">{uploadSubmissionError}</div>
          )}
        </>
      )}

      <Outlet context={{ course }} />
    </div>
  );
}

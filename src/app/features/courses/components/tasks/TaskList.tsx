import { TaskItem } from "./TaskItem";

type Tarea = {
    id: number;
    titulo: string;
    descripcion?: string;
    fechaInicio?: string;
    fechaFin?: string;
    fechaCreacion?: string;
    creador: number;
};

type Recurso = {
    id: number;
    nombreOriginal: string;
    ownerId: number;
    tipoOwner: string;
};

type Entrega = {
    id: number;
    estudianteId: number;
    tareaId: number;
    fechaEnvio?: string;
    estado: string;
    calificacion?: number;
};

type TaskListProps = {
    tasks: Tarea[];
    resourcesByTask: Record<number, Recurso[]>;
    submissionsByTask: Record<number, Entrega[]>;
    expandedId: number | null;
    editingId: number | null;
    currentUserId: number | null;
    isProfesor: boolean;
    onToggleExpand: (taskId: number) => void;
    onStartEdit: (taskId: number) => void;
    onCancelEdit: () => void;
    onDownloadRecurso: (recurso: Recurso) => void;
    onDownloadEntrega: (taskId: number, entrega: Entrega) => void;
    onShowUploadRecurso: (taskId: number) => void;
    onShowUploadEntrega: (taskId: number) => void;
};

export function TaskList({
    tasks,
    resourcesByTask,
    submissionsByTask,
    expandedId,
    editingId,
    currentUserId,
    isProfesor,
    onToggleExpand,
    onStartEdit,
    onCancelEdit,
    onDownloadRecurso,
    onDownloadEntrega,
    onShowUploadRecurso,
    onShowUploadEntrega,
}: TaskListProps) {
    const canEdit = (task: Tarea) => isProfesor || currentUserId === task.creador;

    const getTaskStatus = (task: Tarea): 'pending' | 'overdue' => {
        if (task.fechaFin) {
            const now = new Date();
            const fin = new Date(task.fechaFin);
            if (fin < now) {
                return 'overdue';
            }
        }
        return 'pending';
    };

    if (tasks.length === 0) {
        return <div className="text-gray-500">No hay tareas.</div>;
    }

    return (
        <div className="space-y-4">
            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    recursos={resourcesByTask[task.id] || []}
                    entregas={submissionsByTask[task.id] || []}
                    isExpanded={expandedId === task.id}
                    isEditing={editingId === task.id}
                    canEdit={canEdit(task)}
                    isProfesor={isProfesor}
                    status={getTaskStatus(task)}
                    onToggleExpand={() => onToggleExpand(task.id)}
                    onStartEdit={() => onStartEdit(task.id)}
                    onCancelEdit={onCancelEdit}
                    onDownloadRecurso={onDownloadRecurso}
                    onDownloadEntrega={(entrega) => onDownloadEntrega(task.id, entrega)}
                    onShowUploadRecurso={() => onShowUploadRecurso(task.id)}
                    onShowUploadEntrega={() => onShowUploadEntrega(task.id)}
                />
            ))}
        </div>
    );
}

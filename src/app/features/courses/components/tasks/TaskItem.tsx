import { TaskForm } from "./TaskForm";
import { TaskResourceList } from "./TaskResourceList";
import { TaskSubmissionList } from "./TaskSubmissionList";
import { formatDateForInput, formatDateDisplay } from "~/features/common/utils/Utils";

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

export enum TaskStatus {
    SCHEDULED = 'scheduled',
    PENDING = 'pending',
    OVERDUE = 'overdue',
}

type Entrega = {
    id: number;
    estudianteId: number;
    tareaId: number;
    fechaEnvio?: string;
    estado: string;
    calificacion?: number;
};

type TaskItemProps = {
    task: Tarea;
    recursos: Recurso[];
    entregas: Entrega[];
    isExpanded: boolean;
    isEditing: boolean;
    canEdit: boolean;
    isProfesor: boolean;
    status: TaskStatus;
    onToggleExpand: () => void;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onDownloadRecurso: (recurso: Recurso) => void;
    onDownloadEntrega: (entrega: Entrega) => void;
    onShowUploadRecurso: () => void;
    onShowUploadEntrega: () => void;
};

export function TaskItem({
    task,
    recursos,
    entregas,
    isExpanded,
    isEditing,
    canEdit,
    isProfesor,
    status,
    onToggleExpand,
    onStartEdit,
    onCancelEdit,
    onDownloadRecurso,
    onDownloadEntrega,
    onShowUploadRecurso,
    onShowUploadEntrega,
}: TaskItemProps) {
    const editFormData = {
        titulo: task.titulo,
        descripcion: task.descripcion || '',
        fechaInicio: formatDateForInput(task.fechaInicio),
        fechaFin: formatDateForInput(task.fechaFin)
    };

    return (
        <div
            className={`bg-white rounded-md shadow overflow-hidden cursor-pointer ${status === 'overdue' ? 'ombook-border-brown border-l-4' : ''
                }`}
            onClick={onToggleExpand}
        >
            <div className="p-4 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="text-lg font-semibold">{task.titulo}</div>
                        <span
                            className={`ombook-badge ${status === 'overdue'
                                ? 'ombook-badge-brown'
                                : status === 'scheduled'
                                    ? 'ombook-badge-yellow'
                                    : 'ombook-badge-green'
                                }`}
                        >
                            {status === 'overdue' ? 'Vencida' : status === 'scheduled' ? 'Programada' : 'En Fecha'}
                        </span>
                    </div>
                    <div className="text-xs text-gray-500">
                        {task.fechaCreacion ? formatDateDisplay(task.fechaCreacion) : ''}
                    </div>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{task.descripcion}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                        {canEdit && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    isEditing ? onCancelEdit() : onStartEdit();
                                }}
                                className="ombook-text-green text-sm cursor-pointer"
                                tabIndex={0}
                                aria-label={isEditing ? 'Cancelar edición' : 'Editar tarea'}
                            >
                                {isEditing ? 'Cancelar' : 'Editar'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {isEditing && (
                <div onClick={(e) => e.stopPropagation()} className="p-4 border-t bg-gray-50">
                    <TaskForm
                        mode="edit"
                        tareaId={task.id}
                        defaultValues={editFormData}
                        onCancel={onCancelEdit}
                    />
                </div>
            )}

            {isExpanded && (
                <div className="p-4 border-t space-y-4" onClick={(e) => e.stopPropagation()}>
                    <div>
                        <div className="text-sm font-medium">Descripción</div>
                        <div className="text-sm text-gray-700 whitespace-pre-line mt-1">
                            {task.descripcion}
                        </div>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600">
                        <div>Inicio: {formatDateDisplay(task.fechaInicio)}</div>
                        <div>Fin: {formatDateDisplay(task.fechaFin)}</div>
                    </div>

                    <TaskResourceList
                        recursos={recursos}
                        tareaId={task.id}
                        isProfesor={isProfesor}
                        onDownload={onDownloadRecurso}
                        onShowUpload={onShowUploadRecurso}
                    />

                    <TaskSubmissionList
                        entregas={entregas}
                        tareaId={task.id}
                        isProfesor={isProfesor}
                        onDownload={onDownloadEntrega}
                        onShowUpload={onShowUploadEntrega}
                        taskStatus={status}

                    />
                </div>
            )}
        </div>
    );
}

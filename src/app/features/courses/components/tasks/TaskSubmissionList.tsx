import { Link } from "react-router";

type Entrega = {
    id: number;
    estudianteId: number;
    tareaId: number;
    fechaEnvio?: string;
    estado: string;
    calificacion?: number;
};

type TaskSubmissionListProps = {
    entregas: Entrega[];
    tareaId: number;
    isProfesor: boolean;
    onDownload: (entrega: Entrega) => void;
    onShowUpload: () => void;
};

export function TaskSubmissionList({
    entregas,
    tareaId,
    isProfesor,
    onDownload,
    onShowUpload
}: TaskSubmissionListProps) {
    if (isProfesor) {
        return (
            <div>
                <div className="text-sm font-semibold mb-2">Entrega</div>
                <Link
                    to={`${tareaId}/submissions`}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-1 bg-gray-100 rounded text-sm"
                >
                    Ver Entregas
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="text-sm font-semibold mb-2">Entrega</div>
            <div className="space-y-2">
                {entregas.length === 0 ? (
                    <div>
                        <div className="text-gray-500">No hay entregas</div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onShowUpload();
                            }}
                            className="ombook-btn ombook-btn-primary mt-2"
                        >
                            Entregar
                        </button>
                    </div>
                ) : (
                    entregas.map(entrega => (
                        <div key={entrega.id} className="bg-white border rounded p-2">
                            <div className="text-sm">
                                Entregado el {entrega.fechaEnvio ? new Date(entrega.fechaEnvio).toLocaleString() : '-'}
                            </div>
                            <div className="text-sm">Estado: {entrega.estado}</div>
                            {entrega.calificacion !== undefined && (
                                <div className="text-sm">Calificación: {entrega.calificacion}</div>
                            )}
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDownload(entrega);
                                    }}
                                    className="ombook-text-green text-sm"
                                >
                                    Descargar
                                </button>
                                <Link
                                    to={`${tareaId}/submissions/${entrega.id}`}
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
        </div>
    );
}

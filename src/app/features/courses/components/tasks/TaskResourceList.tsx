import { Form } from "react-router";

type Recurso = {
    id: number;
    nombreOriginal: string;
    ownerId: number;
    tipoOwner: string;
};

type TaskResourceListProps = {
    recursos: Recurso[];
    tareaId: number;
    isProfesor: boolean;
    onDownload: (recurso: Recurso) => void;
    onShowUpload: () => void;
};

export function TaskResourceList({ recursos, tareaId, isProfesor, onDownload, onShowUpload }: TaskResourceListProps) {
    return (
        <div>
            <div className="text-sm font-semibold mb-2">Recursos</div>
            <div className="space-y-2">
                {recursos.length === 0 && <div className="text-gray-500">No hay recursos.</div>}
                {recursos.map(r => (
                    <div key={r.id} className="flex justify-between items-center bg-white border rounded p-2">
                        <div className="text-sm">{r.nombreOriginal}</div>
                        <div className="flex gap-2">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDownload(r);
                                }}
                                className="ombook-text-green text-sm"
                            >
                                Descargar
                            </button>
                            {isProfesor && (
                                <Form method="post" className="inline">
                                    <input type="hidden" name="_action" value="deleteRecurso" />
                                    <input type="hidden" name="tareaId" value={tareaId} />
                                    <input type="hidden" name="recursoId" value={r.id} />
                                    <button
                                        type="submit"
                                        onClick={(e) => {
                                            if (!window.confirm('¿Eliminar recurso?')) {
                                                e.preventDefault();
                                            }
                                            e.stopPropagation();
                                        }}
                                        className="ombook-text-brown-dark text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </Form>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {isProfesor && (
                <div className="mt-3 border-t pt-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onShowUpload();
                        }}
                        className="ombook-btn ombook-btn-primary"
                    >
                        Subir recurso
                    </button>
                </div>
            )}
        </div>
    );
}

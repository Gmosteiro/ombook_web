import { useFetcher } from "react-router";
import { useEffect } from "react";

type TaskFormProps = {
    mode: 'create' | 'edit';
    tareaId?: number;
    defaultValues?: {
        titulo: string;
        descripcion: string;
        fechaInicio: string;
        fechaFin: string;
    };
    onCancel: () => void;
};

export function TaskForm({ mode, tareaId, defaultValues, onCancel }: TaskFormProps) {
    const isCreate = mode === 'create';
    const fetcher = useFetcher();

    // Cerrar el formulario cuando se complete exitosamente
    useEffect(() => {
        if (fetcher.state === 'idle' && fetcher.data && !fetcher.data.error) {
            onCancel(); // Cierra el formulario
        }
    }, [fetcher.state, fetcher.data, onCancel]);

    return (
        <fetcher.Form method="post" className="mb-4 bg-white p-4 rounded-md shadow">
            <input type="hidden" name="_action" value={isCreate ? 'createTask' : 'updateTask'} />
            {!isCreate && tareaId && <input type="hidden" name="tareaId" value={tareaId} />}

            <div className="grid grid-cols-1 gap-2">
                <div>
                    <label htmlFor="titulo" className="block text-sm font-medium">Título</label>
                    <input
                        id="titulo"
                        name="titulo"
                        defaultValue={defaultValues?.titulo}
                        placeholder="Título"
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium">Descripción</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        defaultValue={defaultValues?.descripcion}
                        placeholder="Descripción"
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label htmlFor="fechaInicio" className="block text-sm font-medium">Fecha inicio</label>
                        <input
                            id="fechaInicio"
                            name="fechaInicio"
                            defaultValue={defaultValues?.fechaInicio}
                            type="datetime-local"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="fechaFin" className="block text-sm font-medium">Fecha fin</label>
                        <input
                            id="fechaFin"
                            name="fechaFin"
                            defaultValue={defaultValues?.fechaFin}
                            type="datetime-local"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="ombook-btn ombook-btn-secondary"
                        disabled={fetcher.state !== 'idle'}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="ombook-btn ombook-btn-primary"
                        disabled={fetcher.state !== 'idle'}
                    >
                        {fetcher.state !== 'idle' ? 'Guardando...' : (isCreate ? 'Crear' : 'Guardar')}
                    </button>
                </div>
            </div>
        </fetcher.Form>
    );
}

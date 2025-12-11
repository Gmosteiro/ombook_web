import { useFetcher } from "react-router";
import { useEffect, useState } from "react";

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
    const [validationError, setValidationError] = useState<string>('');

    // Cerrar el formulario cuando se complete exitosamente
    useEffect(() => {
        if (fetcher.state === 'idle' && fetcher.data && !fetcher.data.error) {
            onCancel(); // Cierra el formulario
        }
    }, [fetcher.state, fetcher.data, onCancel]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        const fechaInicio = formData.get('fechaInicio') as string;
        const fechaFin = formData.get('fechaFin') as string;

        // Validar que ambas fechas estén presentes
        if (!fechaInicio || !fechaFin) {
            e.preventDefault();
            setValidationError('Debe especificar fecha de inicio y fecha de fin');
            return;
        }

        // Validar que fecha fin sea posterior a fecha inicio
        if (new Date(fechaInicio) >= new Date(fechaFin)) {
            e.preventDefault();
            setValidationError('La fecha de fin debe ser posterior a la fecha de inicio');
            return;
        }

        setValidationError('');
    };

    return (
        <fetcher.Form
            key={`${mode}-${tareaId}-${defaultValues?.titulo}-${defaultValues?.fechaInicio}`}
            method="post"
            className="mb-4 bg-white p-4 rounded-md shadow"
            onSubmit={handleSubmit}
        >
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
                        <label htmlFor="fechaInicio" className="block text-sm font-medium">
                            Fecha inicio <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="fechaInicio"
                            name="fechaInicio"
                            defaultValue={defaultValues?.fechaInicio}
                            type="datetime-local"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="fechaFin" className="block text-sm font-medium">
                            Fecha fin <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="fechaFin"
                            name="fechaFin"
                            defaultValue={defaultValues?.fechaFin}
                            type="datetime-local"
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                            required
                        />
                    </div>
                </div>

                {validationError && (
                    <div className="text-red-500 text-sm">{validationError}</div>
                )}

                {fetcher.data?.error && (
                    <div className="text-red-500 text-sm">{fetcher.data.error}</div>
                )}

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

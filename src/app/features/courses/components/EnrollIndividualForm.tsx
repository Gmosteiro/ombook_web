import React, { useState } from "react";
import type { IndividualFormProps } from "../../common/components/EntityCreate";
import type { UsuarioVinculado } from "../types/types";
import { useEstudiantes } from "~/features/users/hooks/useUsers";

const EnrollIndividualForm: React.FC<IndividualFormProps> = ({ onSubmit, submitting }) => {
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<UsuarioVinculado | null>(null);
    const { estudiantes, error, loadEstudiantes } = useEstudiantes();

    // Buscar estudiantes al enviar el formulario
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadEstudiantes(); //TODO agregar filtro de búsqueda
    };

    // Confirmar matrícula
    const handleMatricular = () => {
        if (selected) {
            onSubmit({ usuarioId: selected.id });
        }
    };
    if (estudiantes.length > 0) {
        debugger
    }

    return (
        <>
            <form onSubmit={handleSearch} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar usuario por nombre, apellido, correo o cédula
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        name="search"
                        className="flex-1 border rounded px-3 py-2 border-gray-300"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        disabled={submitting}
                        placeholder="Ej: Juan, juan@mail.com, 12345678"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        disabled={submitting || !search}
                    >
                        Buscar
                    </button>
                </div>
                {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            </form>

            {estudiantes.length > 0 && (
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Selecciona un usuario para matricular
                    </label>
                    <ul className="border rounded divide-y max-h-56 overflow-y-auto">
                        {estudiantes.map(user => (
                            <li
                                key={user.id}
                                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${selected?.id === user.id ? "bg-blue-100" : ""}`}
                                onClick={() => setSelected(user)}
                            >
                                <div className="font-medium">{user.nombre} {user.apellido}</div>
                                <div className="text-xs text-gray-500">{user.correo}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={handleMatricular}
                    disabled={submitting || !selected}
                    className={`min-w-[200px] bg-blue-600 text-white py-2 px-4 rounded font-semibold
                        ${submitting || !selected ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"}`}
                >
                    {submitting ? "Matriculando..." : "Matricular usuario"}
                </button>
            </div>
        </>
    );
};

export default EnrollIndividualForm;
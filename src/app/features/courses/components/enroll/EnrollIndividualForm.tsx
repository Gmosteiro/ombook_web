import React, { useState } from "react";
import { useFetcher } from "react-router";
import type { IndividualFormProps } from "../../../common/components/EntityCreate";
import type { UsuarioListaResponse } from "../../../../routes/api.users.server";

const EnrollIndividualForm: React.FC<IndividualFormProps> = ({ onSubmit, submitting }) => {
    const fetcher = useFetcher();
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<UsuarioListaResponse | null>(null);
    const [intent, setIntent] = useState<"buscar" | "matricular">("buscar");

    const estudiantes: UsuarioListaResponse[] = fetcher.data?.estudiantes ?? [];

    return (
        <>
            <fetcher.Form
                method="post"
                className="mb-4"
                onSubmit={() => setIntent("buscar")}
            >
                <input type="hidden" name="intent" value="buscar" />
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar usuario por nombre, apellido o cédula
                </label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        name="search"
                        className="flex-1 border rounded px-3 py-2 border-gray-300"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        disabled={submitting}
                        placeholder="Ej: Juan,  12345678"
                    />
                    <button
                        type="submit"
                        className={`ombook-btn ombook-btn-primary px-4 py-2 rounded font-semibold
                            ${submitting || !search || fetcher.state === "submitting" ? "opacity-60 cursor-not-allowed" : "ombook-btn-primary"}`}
                        disabled={submitting || !search || fetcher.state === "submitting"}
                    >
                        {fetcher.state === "submitting" && intent === "buscar"
                            ? "Buscando..."
                            : "Buscar"}
                    </button>
                </div>
                {fetcher.data && estudiantes.length === 0 && (
                    <p className="text-red-500 text-xs mt-1">No se encontraron estudiantes.</p>
                )}
            </fetcher.Form>

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
                    onClick={() => {
                        if (selected) onSubmit({ usuarioId: selected.id });
                    }}
                    disabled={submitting || !selected}
                    className={`min-w-[200px] ombook-btn ombook-btn-primary
                        ${submitting || !selected ? "opacity-60 cursor-not-allowed" : "ombook-btn-primary"}`}
                >
                    {submitting ? "Matriculando..." : "Matricular usuario"}
                </button>
            </div>
        </>
    );
};

export default EnrollIndividualForm;
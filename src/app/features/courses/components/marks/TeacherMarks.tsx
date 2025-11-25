


import { useState } from "react";
import { useFetcher } from "react-router";
import type { MarksListResponse } from "../../../../routes/api.marks";
import { UsuarioListaResponse } from "../../../../routes/api.users.server";
// MarksListResponse = CalificacionFinalResponse[]

type Props = { teacherMarks: MarksListResponse, estudiantes: UsuarioListaResponse };

export default function TeacherMarks({ teacherMarks, estudiantes }: Props) {
    const fetcher = useFetcher();
    const [localMarks, setLocalMarks] = useState<MarksListResponse>(teacherMarks || []);

    // CalificacionFinalResponse: estudianteId, nombreEstudiante, nota, observacion, estado
    const handleChange = (idx: number, field: "nota" | "observacion", value: string | number) => {
        setLocalMarks((prev) =>
            prev.map((m, i) =>
                i === idx ? { ...m, [field]: value } : m
            )
        );
    };

    // Save marks via action
    const handleSave = () => {
        const formData = new FormData();
        formData.append("intent", "save");
        formData.append("marks", JSON.stringify(localMarks));
        fetcher.submit(formData, { method: "POST" });
    };

    // Publish marks via action
    const handlePublish = () => {
        const formData = new FormData();
        formData.append("intent", "publish");
        fetcher.submit(formData, { method: "POST" });
    };

    const saving = fetcher.state === "submitting" && fetcher.formData?.get("intent") === "save";
    const publishing = fetcher.state === "submitting" && fetcher.formData?.get("intent") === "publish";
    const successMsg = fetcher.data?.successMsg;
    const error = fetcher.data?.error;

    return (
        <div className="ombook-card p-6">
            <h2 className="ombook-heading ombook-heading-md mb-4">Calificaciones finales</h2>
            {successMsg && <div className="text-green-600 mb-2">{successMsg}</div>}
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <table className="w-full mb-4">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Calificación</th>
                        <th>Observación</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {localMarks.map((m, idx) => (
                        <tr key={m.estudianteId}>
                            <td>{m.nombreEstudiante}</td>
                            <td>
                                <input
                                    type="number"
                                    min={1}
                                    max={10}
                                    value={m.nota ?? ""}
                                    onChange={e => handleChange(idx, "nota", Number(e.target.value))}
                                    className="ombook-input w-20"
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={m.observacion || ""}
                                    onChange={e => handleChange(idx, "observacion", e.target.value)}
                                    className="ombook-input w-full"
                                />
                            </td>
                            <td>{m.estado}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex gap-3">
                <button
                    className="ombook-btn ombook-btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? "Guardando..." : "Guardar"}
                </button>
                <button
                    className="ombook-btn ombook-btn-success"
                    onClick={handlePublish}
                    disabled={publishing}
                >
                    {publishing ? "Publicando..." : "Publicar calificaciones"}
                </button>
            </div>
        </div>
    );
}

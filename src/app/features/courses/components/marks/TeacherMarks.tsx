


import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import type { MarksListResponse } from "../../../../routes/api.marks";
import { UsuarioListaResponse } from "../../../../routes/api.users.server";
// MarksListResponse = CalificacionFinalResponse[]

type Props = { teacherMarks: MarksListResponse, estudiantes: UsuarioListaResponse[] };

export default function TeacherMarks({ teacherMarks, estudiantes }: Props) {
    const [draftSaved, setDraftSaved] = useState(false);
    const fetcher = useFetcher();
    // Actualizar localMarks si el action retorna marks actualizados tras publicar
    useEffect(() => {
        if (fetcher.data?.marks && fetcher.formData?.get("intent") === "publish") {
            setLocalMarks(fetcher.data.marks);
        }
    }, [fetcher.data, fetcher.formData]);
    // Generar lista cruzada estudiantes + calificaciones
    const initialMarks: MarksListResponse = estudiantes.map(est => {
        const mark = teacherMarks.find(m => m.estudianteId === est.id);
        return mark ?? {
            estudianteId: est.id,
            nombreEstudiante: `${est.nombre} ${est.apellido}`,
            nota: undefined,
            observacion: "",
            estado: "BORRADOR"
        };
    });
    const [localMarks, setLocalMarks] = useState<MarksListResponse>(initialMarks);

    // Solo se pueden editar los que no están publicados
    const handleChange = (idx: number, field: "nota" | "observacion", value: string | number) => {
        setLocalMarks((prev) =>
            prev.map((m, i) =>
                i === idx && m.estado !== "PUBLICADA" ? { ...m, [field]: value } : m
            )
        );
    };

    // Save marks via action
    const handleSave = () => {
        const formData = new FormData();
        formData.append("intent", "save");
        // Solo enviar los que tienen nota definida
        const marksToSend = localMarks.filter(m => typeof m.nota === "number" && !isNaN(m.nota));
        formData.append("marks", JSON.stringify(marksToSend));
        setDraftSaved(false);
        fetcher.submit(formData, { method: "POST" });
    };

    // Publish marks via action
    const handlePublish = () => {
        const formData = new FormData();
        formData.append("intent", "publish");
        // Solo enviar los que tienen nota definida
        const marksToSend = localMarks.filter(m => typeof m.nota === "number" && !isNaN(m.nota) && m.estado === "BORRADOR");
        formData.append("marks", JSON.stringify(marksToSend));
        fetcher.submit(formData, { method: "POST" });
    };

    const saving = fetcher.state === "submitting" && fetcher.formData?.get("intent") === "save";
    const publishing = fetcher.state === "submitting" && fetcher.formData?.get("intent") === "publish";
    const successMsg = fetcher.data?.successMsg;
    const error = fetcher.data?.error;

    // Detectar si el borrador fue guardado exitosamente
    if (successMsg && !saving && !publishing && !draftSaved) {
        setDraftSaved(true);
    }

    return (
        <div className="ombook-card ombook-bg-light p-8 shadow-lg rounded-xl border ombook-border-green">
            <h2 className="ombook-heading ombook-heading-md mb-6 text-center ombook-text-green">Calificaciones finales</h2>
            {successMsg && <div className="ombook-alert ombook-alert-success mb-4 text-center font-semibold">{successMsg}</div>}
            {error && <div className="ombook-alert ombook-alert-info mb-4 text-center font-semibold">{error}</div>}
            <div className="overflow-x-auto">
                <table className="w-full mb-6 border-separate border-spacing-y-2">
                    <thead>
                        <tr className="ombook-bg-gray-light">
                            <th className="text-left px-4 py-2 ">Nombre</th>
                            <th className="text-center px-4 py-2 ">Calificación</th>
                            <th className="text-center px-4 py-2 ">Observación</th>
                            <th className="text-center px-4 py-2 ">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {localMarks.map((m, idx) => (
                            <tr key={m.estudianteId} className={idx % 2 === 0 ? "ombook-bg-light" : "bg-white"}>
                                <td className="px-4 py-2 font-medium ombook-text-gray">{m.nombreEstudiante}</td>
                                <td className="px-4 py-2 text-center">
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        step={0.01}
                                        value={m.nota ?? ""}
                                        onChange={e => handleChange(idx, "nota", parseFloat(e.target.value))}
                                        className={`ombook-input w-20 text-center ombook-border-green ${m.estado === "PUBLICADA" ? "bg-gray-200 cursor-not-allowed" : ""}`}
                                        disabled={m.estado === "PUBLICADA"}
                                    />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <input
                                        type="text"
                                        value={m.observacion || ""}
                                        onChange={e => handleChange(idx, "observacion", e.target.value)}
                                        className={`ombook-input w-full text-center  ${m.estado === "PUBLICADA" ? "ombook-border-green bg-gray-200 cursor-not-allowed" : ""}`}
                                        disabled={m.estado === "PUBLICADA"}
                                    />
                                </td>
                                <td className={`px-4 py-2 text-center font-semibold ${m.estado === "PUBLICADA" ? "ombook-text-green" : "ombook-text-gray"}`}>{m.estado}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-4 justify-start mt-2">
                {localMarks.some(m => m.estado === "BORRADOR" && typeof m.nota === "number" && !isNaN(m.nota)) && (
                    <button
                        className="ombook-btn ombook-btn-primary px-6 py-2 text-lg ombook-hover-bg-green"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Guardando..." : "Guardar Borrador"}
                    </button>
                )}
                {draftSaved && localMarks.some(m => m.estado === "BORRADOR" && typeof m.nota === "number" && !isNaN(m.nota)) && (
                    <button
                        className="ombook-btn ombook-btn-outline px-6 py-2 text-lg ombook-hover-bg-green"
                        onClick={handlePublish}
                        disabled={publishing}
                    >
                        {publishing ? "Publicando..." : "Publicar calificaciones"}
                    </button>
                )}
            </div>
        </div>
    );
}

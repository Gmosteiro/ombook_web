import { useState, useEffect, useRef, useCallback } from "react";
import { useFetcher } from "react-router";
import type { MarksListResponse } from "../../../../routes/api.marks";
import { UsuarioListaResponse } from "../../../../routes/api.users.server";

type Props = {
    teacherMarks: MarksListResponse;
    estudiantes: UsuarioListaResponse[];
};

function getInitialMarks(estudiantes: UsuarioListaResponse[], teacherMarks: MarksListResponse): MarksListResponse {
    return estudiantes.map(est => {
        const mark = teacherMarks.find(m => m.estudianteId === est.id);
        return (
            mark ?? {
                estudianteId: est.id,
                nombreEstudiante: `${est.nombre} ${est.apellido}`,
                nota: undefined,
                observacion: "",
                estado: "BORRADOR",
            }
        );
    });
}

const formatResponseMessage = (message: string) => {
    try {
        const data = JSON.parse(message);
        let summary = `Importados: ${data.correctos} / ${data.total}`;
        if (data.errores > 0 && Array.isArray(data.detalleErrores)) {
            summary += "\nErrores:";
            summary += data.detalleErrores
                .map(
                    (err: { linea: number; motivo: string }) =>
                        `\n• Línea ${err.linea}: ${err.motivo}`
                )
                .join("");
        }
        return summary;
    } catch {
        return message;
    }
}

export default function TeacherMarks({ teacherMarks, estudiantes }: Props) {
    const fetcher = useFetcher();
    const csvInputRef = useRef<HTMLInputElement>(null);

    const [localMarks, setLocalMarks] = useState<MarksListResponse>(() =>
        getInitialMarks(estudiantes, teacherMarks)
    );
    const [draftSaved, setDraftSaved] = useState(false);

    // Actualiza localMarks si teacherMarks o estudiantes cambian
    useEffect(() => {
        setLocalMarks(getInitialMarks(estudiantes, teacherMarks));
    }, [teacherMarks, estudiantes]);

    // Actualiza localMarks si se publican calificaciones
    useEffect(() => {
        if (fetcher.data?.marks && fetcher.formData?.get("intent") === "publish") {
            setLocalMarks(fetcher.data.marks);
        }
    }, [fetcher.data]);

    // Detecta si el borrador fue guardado exitosamente
    useEffect(() => {
        if (fetcher.data?.successMsg && !saving && !publishing) {
            setDraftSaved(true);
        }
    }, [fetcher.data?.successMsg]);

    // Handlers
    const handleChange = useCallback((idx: number, field: "nota" | "observacion", value: string | number) => {
        setLocalMarks(prev =>
            prev.map((m, i) =>
                i === idx && m.estado !== "PUBLICADA" ? { ...m, [field]: value } : m
            )
        );
    }, []);

    const handleSave = useCallback(() => {
        const formData = new FormData();
        formData.append("intent", "save");
        const marksToSend = localMarks.filter(m => typeof m.nota === "number" && !isNaN(m.nota));
        formData.append("marks", JSON.stringify(marksToSend));
        setDraftSaved(false);
        fetcher.submit(formData, { method: "POST" });
    }, [localMarks, fetcher]);

    const handlePublish = useCallback(() => {
        const formData = new FormData();
        formData.append("intent", "publish");
        const marksToSend = localMarks.filter(
            m => typeof m.nota === "number" && !isNaN(m.nota) && m.estado === "BORRADOR"
        );
        formData.append("marks", JSON.stringify(marksToSend));
        fetcher.submit(formData, { method: "POST" });
    }, [localMarks, fetcher]);

    // Nueva función para importar usando fetcher
    const handleImportMarks = useCallback(async (file: File) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64Content = reader.result as string;
            const formData = new FormData();
            formData.append("intent", "import");
            formData.append("fileName", file.name);
            formData.append("fileSize", file.size.toString());
            formData.append("fileType", file.type);
            formData.append("fileContent", base64Content);
            fetcher.submit(formData, { method: "POST" });
        };
        reader.readAsDataURL(file);
    }, [fetcher]);

    // Estados de envío
    const saving = fetcher.state === "submitting" && fetcher.formData?.get("intent") === "save";
    const publishing = fetcher.state === "submitting" && fetcher.formData?.get("intent") === "publish";


    const importResponse = fetcher.data?.successMsg && formatResponseMessage(fetcher.data?.successMsg)

    return (
        <div className="ombook-card ombook-bg-light p-8 shadow-lg rounded-xl border ombook-border-green">
            <div className="flex items-center mb-6">
                {localMarks.some(m => typeof m.nota !== "number" || isNaN(m.nota)) && (
                    <button
                        type="button"
                        className="ombook-btn ombook-btn-outline px-4 py-2 mr-4 ombook-hover-bg-green"
                        onClick={() => csvInputRef.current?.click()}
                    >
                        Importar CSV
                    </button>
                )}
                <h2 className="ombook-heading ombook-heading-md text-center ombook-text-green flex-1">
                    Calificaciones finales
                </h2>
            </div>
            <div className="mb-2">
                <input
                    type="file"
                    accept=".csv"
                    ref={csvInputRef}
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) handleImportMarks(file);
                    }}
                    style={{ display: "none" }}
                />
                <a
                    href="/plantillas/calificaciones.csv"
                    download
                    className="ombook-link ombook-text-green underline ml-2"
                    style={{ display: "inline-block", marginTop: "8px" }}
                >
                    Descargar modelo CSV
                </a>
            </div>
            <div className="mb-2">
                {importResponse && (
                    <div className="ombook-alert ombook-alert-success mt-2">{importResponse}</div>
                )}
                {fetcher.data?.error && (
                    <div className="ombook-alert ombook-alert-info mt-2">{fetcher.data.error}</div>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full mb-6 border-separate border-spacing-y-2">
                    <thead>
                        <tr className="ombook-bg-gray-light">
                            <th className="text-left px-4 py-2">Nombre</th>
                            <th className="text-center px-4 py-2">Calificación</th>
                            <th className="text-center px-4 py-2">Observación</th>
                            <th className="text-center px-4 py-2">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {localMarks.map((m, idx) => (
                            <tr
                                key={m.estudianteId}
                                className={idx % 2 === 0 ? "ombook-bg-light" : "bg-white"}
                            >
                                <td className="px-4 py-2 font-medium ombook-text-gray">
                                    {m.nombreEstudiante}
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <input
                                        type="number"
                                        min={1}
                                        max={10}
                                        step={0.01}
                                        value={m.nota ?? ""}
                                        onChange={e =>
                                            handleChange(idx, "nota", parseFloat(e.target.value))
                                        }
                                        className={`ombook-input w-20 text-center ombook-border-green ${m.estado === "PUBLICADA"
                                            ? "bg-gray-200 cursor-not-allowed"
                                            : ""
                                            }`}
                                        disabled={m.estado === "PUBLICADA"}
                                    />
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <input
                                        type="text"
                                        value={m.observacion || ""}
                                        onChange={e =>
                                            handleChange(idx, "observacion", e.target.value)
                                        }
                                        className={`ombook-input w-full text-center ${m.estado === "PUBLICADA"
                                            ? "ombook-border-green bg-gray-200 cursor-not-allowed"
                                            : ""
                                            }`}
                                        disabled={m.estado === "PUBLICADA"}
                                    />
                                </td>
                                <td
                                    className={`px-4 py-2 text-center font-semibold ${m.estado === "PUBLICADA"
                                        ? "ombook-text-green"
                                        : "ombook-text-gray"
                                        }`}
                                >
                                    {m.estado}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex gap-4 justify-start mt-2">
                {localMarks.some(
                    m =>
                        m.estado === "BORRADOR" &&
                        typeof m.nota === "number" &&
                        !isNaN(m.nota)
                ) && (
                        <button
                            className="ombook-btn ombook-btn-primary px-6 py-2 text-lg ombook-hover-bg-green"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Guardando..." : "Guardar Borrador"}
                        </button>
                    )}
                {draftSaved &&
                    localMarks.some(
                        m =>
                            m.estado === "BORRADOR" &&
                            typeof m.nota === "number" &&
                            !isNaN(m.nota)
                    ) && (
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

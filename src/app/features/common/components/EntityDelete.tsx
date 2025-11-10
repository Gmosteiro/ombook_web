import React, { useState, useMemo } from "react";
import { formatFileSize } from "../../common/utils/Utils";


export type EntityDeleteProps = {
    entityName: string;
    title?: string;
    deleteMasive?: (file: File) => Promise<void> | void;
    bulk?: {
        accept?: string;
        maxSizeMB?: number;
        helpText?: string;
        templateUrl?: string;
    };
    labels?: {
        tabBulk?: string;
        submitBulk?: string;
        subtitle?: string;
        confirmSingle?: (entityName: string) => string;
    };
    className?: string;
    isLoading?: boolean;
    error?: string;
    success?: string;
};

const EntityDelete: React.FC<EntityDeleteProps> = ({
    entityName,
    title,
    deleteMasive,
    bulk,
    labels,
    className,
    isLoading = false,
    error,
    success,
}) => {
    // estados masivo
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const endsWithS = entityName.toLowerCase().endsWith("s");

    const l = useMemo(
        () => ({
            tabBulk: labels?.tabBulk ?? "Masiva",
            submitBulk:
                labels?.submitBulk ??
                `Eliminar ${entityName}${endsWithS ? "" : "s"}`,
            subtitle:
                labels?.subtitle ??
                `Selecciona el archivo CSV con los ${entityName.toLowerCase()} a borrar.`,
            header: title ?? `Eliminar ${entityName}${endsWithS ? "" : "s"}`,
        }),
        [labels, entityName, title, endsWithS]
    );

    const bulkCfg = {
        enabled: !!deleteMasive,
        accept: bulk?.accept ?? ".csv",
        maxSizeMB: bulk?.maxSizeMB ?? 10,
        helpText: bulk?.helpText ?? `CSV hasta ${bulk?.maxSizeMB ?? 10}MB`,
        templateUrl: bulk?.templateUrl,
    };

    // Masivo
    const onFilePick = (f: File | null) => {
        if (!f) return;
        if (f.size > bulkCfg.maxSizeMB * 1024 * 1024) {
            alert(`El archivo supera ${bulkCfg.maxSizeMB}MB`);
            return;
        }
        setFile(f);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const f = e.dataTransfer.files?.[0];
        onFilePick(f ?? null);
    };

    const handleUpload = async () => {
        if (!file || !deleteMasive) return;
        try {
            setUploading(true);
            await deleteMasive(file); // el backend interpreta el CSV (IDs/emails/etc.)
            setFile(null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <section className={`bg-white border border-gray-200 rounded-xl p-6 ${className ?? ""}`}>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{l.header}</h2>
            <p className="text-gray-500 mb-5">{l.subtitle}</p>

            {/* Mostrar mensajes de error y éxito */}
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    <strong>Éxito:</strong> {success}
                </div>
            )}

            <div>
                <div
                    onDragOver={e => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={e => {
                        e.preventDefault();
                        setDragOver(false);
                    }}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 text-center
              ${dragOver ? "border-red-400 bg-red-50" : "border-red-200 bg-red-50/40"} text-gray-600`}
                >
                    <div className="text-3xl text-red-500 mb-2" aria-hidden>
                        🗑️
                    </div>
                    <div className="mb-2">
                        <label
                            htmlFor="entity-bulk-delete-file"
                            className="text-red-700 font-semibold cursor-pointer mr-1"
                        >
                            Sube un archivo
                        </label>
                        o arrástralo aquí
                    </div>
                    <input
                        id="entity-bulk-delete-file"
                        type="file"
                        accept={bulkCfg.accept}
                        onChange={e => onFilePick(e.target.files?.[0] ?? null)}
                        className="hidden"
                    />
                    <div className="text-xs text-gray-500">{bulkCfg.helpText}</div>

                    {file && (
                        <div className="mt-3 text-sm">
                            Archivo seleccionado: <strong>{file.name}</strong>{" "}
                            ({formatFileSize(file.size)})
                        </div>
                    )}

                    {bulkCfg.templateUrl && (
                        <div className="mt-2">
                            <a
                                href={bulkCfg.templateUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-red-700 font-semibold"
                            >
                                Descargar plantilla CSV
                            </a>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={!file || uploading || isLoading}
                        className={`min-w-[220px] bg-red-600 text-white py-2 px-4 rounded font-semibold
                ${!file || uploading || isLoading ? "opacity-60 cursor-not-allowed" : "hover:bg-red-700"}`}
                    >
                        {(uploading || isLoading) ? "Eliminando..." : l.submitBulk}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default EntityDelete;
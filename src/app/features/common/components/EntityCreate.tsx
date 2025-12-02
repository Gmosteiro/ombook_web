import React, { useMemo, useState } from "react";
import { formatFileSize } from "../../common/utils/Utils";

export type IndividualFormProps = {
    onSubmit: (values: any) => Promise<void> | void;
    submitting: boolean;
};

export type EntityCreateProps = {
    entityName: string;
    title?: string;
    IndividualForm: React.ComponentType<IndividualFormProps>;
    addSingle: (values: any) => Promise<void> | void;
    addMasive?: (file: File) => Promise<void> | void;
    bulk?: {
        accept?: string;
        maxSizeMB?: number;
        helpText?: string;
        templateUrl?: string;
    };
    labels?: {
        tabIndividual?: string;
        tabBulk?: string;
        submitBulk?: string;
        subtitle?: string;
    };
    className?: string;
    // Nuevos props para estados externos
    isLoading?: boolean;
    error?: string;
    success?: string;
};



const EntityCreate: React.FC<EntityCreateProps> = ({
    entityName,
    title,
    IndividualForm,
    addSingle,
    addMasive,
    bulk,
    labels,
    className,
    isLoading = false,
    error,
    success,
}) => {
    const [activeTab, setActiveTab] = useState<"individual" | "bulk">("individual");
    const [submittingSingle, setSubmittingSingle] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const l = useMemo(
        () => ({
            tabIndividual: labels?.tabIndividual ?? "Individual",
            tabBulk: labels?.tabBulk ?? "Masiva",
            submitBulk:
                labels?.submitBulk ??
                `Importar ${entityName}${entityName.toLowerCase().endsWith("s") ? "" : "s"}`,
            subtitle:
                labels?.subtitle ??
                `Selecciona la modalidad y completa los datos para añadir nuevos ${entityName.toLowerCase()}s.`,
            header: title ?? `Crear Nuevo ${entityName}`,
        }),
        [labels, entityName, title]
    );

    const bulkCfg = {
        enabled: !!addMasive,
        accept: bulk?.accept ?? ".csv",
        maxSizeMB: bulk?.maxSizeMB ?? 10,
        helpText: bulk?.helpText ?? `CSV hasta ${bulk?.maxSizeMB ?? 10}MB`,
        templateUrl: bulk?.templateUrl,
    };

    // Handler que el formulario individual usará para enviar los valores
    const handleSingleSubmit = async (values: any) => {
        try {
            setSubmittingSingle(true);
            await addSingle(values);
        } finally {
            setSubmittingSingle(false);
        }
    };

    const handleUpload = async () => {
        if (!file || !addMasive) return;
        try {
            setUploading(true);
            await addMasive(file); // el backend se encarga del CSV
            setFile(null);
        } finally {
            setUploading(false);
        }
    };

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

    return (
        <section className={`bg-white ombook-border-gray rounded-xl p-6 ${className ?? ""}`}>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">{l.header}</h2>
            <p className="text-gray-500 mb-5">{l.subtitle}</p>

            {/* Mostrar mensajes de error y éxito */}
            {error && (
                <div className="ombook-alert ombook-alert-info border-l-4 border-ombook-brown text-ombook-brown mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {success && (
                <div className="ombook-alert ombook-alert-success border-l-4 border-ombook-green text-ombook-green mb-4">
                    <strong>Éxito:</strong> {success}
                </div>
            )}

            <div className="mb-5">
                <div className="inline-flex w-full max-w-md rounded-lg ombook-bg-light p-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab("individual")}
                        className={`flex-1 px-4 py-2 rounded-md font-semibold transition
              ${activeTab === "individual" ? "ombook-bg-green ombook-text-gray border ombook-border-green" : "ombook-text-gray"}`}
                    >
                        {l.tabIndividual}
                    </button>
                    <button
                        type="button"
                        disabled={!bulkCfg.enabled}
                        onClick={() => setActiveTab("bulk")}
                        className={`flex-1 px-4 py-2 rounded-md font-semibold transition
              ${activeTab === "bulk" ? "ombook-bg-green ombook-text-gray border ombook-border-green" : "ombook-text-gray"}
              ${!bulkCfg.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {l.tabBulk}
                    </button>
                </div>
            </div>

            {activeTab === "individual" && (
                <div>
                    <IndividualForm
                        onSubmit={handleSingleSubmit}
                        submitting={submittingSingle || isLoading}
                    />
                </div>
            )}

            {activeTab === "bulk" && bulkCfg.enabled && (
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
                        className={`ombook-border-green border-2 border-dashed rounded-xl p-8 text-center
              ${dragOver ? "ombook-border-green ombook-bg-green-light" : "ombook-border-green ombook-bg-light"} text-gray-600`}
                    >
                        <div className="text-3xl ombook-text-green mb-2" aria-hidden>
                            ⛅
                        </div>
                        <div className="mb-2">
                            <label
                                htmlFor="entity-bulk-file"
                                className="ombook-text-green font-semibold cursor-pointer mr-1"
                            >
                                Sube un archivo
                            </label>
                            o arrástralo aquí
                        </div>
                        <input
                            id="entity-bulk-file"
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
                                    className="ombook-link font-semibold"
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
                            className={`min-w-[200px] ombook-btn ombook-btn-primary
                ${!file || uploading || isLoading ? "opacity-60 cursor-not-allowed" : "ombook-btn-primary"}`}
                        >
                            {(uploading || isLoading) ? "Importando..." : l.submitBulk}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default EntityCreate;
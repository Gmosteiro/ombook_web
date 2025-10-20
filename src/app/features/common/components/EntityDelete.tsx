import React, { useMemo, useState } from "react";

export type SearchListProps<T = any> = {
    onSelect: (item: T | null) => void;
    selected: T | null;
    // Renombrado a 'busy' para uso común
    busy: boolean;
};

export type EntityDeleteProps = {
    entityName: string; // "Usuario", "Curso", etc.
    title?: string;

    // Lista buscable para seleccionar la entidad a borrar.
    SearchList: React.ComponentType<SearchListProps>;

    // Callbacks provistos por cada feature
    deleteSingle: (entity: any) => Promise<void> | void;
    deleteMasive?: (file: File) => Promise<void> | void;

    bulk?: {
        accept?: string; // default ".csv"
        maxSizeMB?: number; // default 10
        helpText?: string; // texto bajo el dropzone
        templateUrl?: string; // URL para descargar plantilla
    };

    labels?: {
        tabIndividual?: string;
        tabBulk?: string;
        submitBulk?: string;
        subtitle?: string;
        deleteSelected?: string;
        confirmSingle?: (entityName: string) => string; // mensaje confirmación
    };

    className?: string;
};

const EntityDelete: React.FC<EntityDeleteProps> = ({
    entityName,
    title,
    SearchList,
    deleteSingle,
    deleteMasive,
    bulk,
    labels,
    className,
}) => {
    const [activeTab, setActiveTab] = useState<"individual" | "bulk">("individual");

    // estados individual
    const [selected, setSelected] = useState<any | null>(null);
    const [deletingSingleState, setDeletingSingleState] = useState(false);

    // estados masivo
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const endsWithS = entityName.toLowerCase().endsWith("s");

    const l = useMemo(
        () => ({
            tabIndividual: labels?.tabIndividual ?? "Individual",
            tabBulk: labels?.tabBulk ?? "Masiva",
            submitBulk:
                labels?.submitBulk ??
                `Eliminar ${entityName}${endsWithS ? "" : "s"}`,
            deleteSelected: labels?.deleteSelected ?? `Eliminar ${entityName} seleccionado`,
            subtitle:
                labels?.subtitle ??
                `Selecciona la modalidad y elige los ${entityName.toLowerCase()} a borrar.`,
            header: title ?? `Eliminar ${entityName}${endsWithS ? "" : "s"}`,
            confirmSingle:
                labels?.confirmSingle ??
                ((name: string) => `¿Confirmas eliminar este ${name.toLowerCase()}? Esta acción no se puede deshacer.`),
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

    // Individual
    const handleDeleteSelected = async () => {
        if (!selected) return;
        const ok = window.confirm(typeof l.confirmSingle === "function" ? l.confirmSingle(entityName) : l.confirmSingle);
        if (!ok) return;

        try {
            setDeletingSingleState(true);
            await deleteSingle(selected);
            setSelected(null);
        } finally {
            setDeletingSingleState(false);
        }
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

            <div className="mb-5">
                <div className="inline-flex w-full max-w-md rounded-lg bg-gray-100 p-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab("individual")}
                        className={`flex-1 px-4 py-2 rounded-md font-semibold transition
              ${activeTab === "individual" ? "bg-red-50 text-red-700 border border-red-200" : "text-gray-700"}`}
                    >
                        {l.tabIndividual}
                    </button>
                    <button
                        type="button"
                        disabled={!bulkCfg.enabled}
                        onClick={() => setActiveTab("bulk")}
                        className={`flex-1 px-4 py-2 rounded-md font-semibold transition
              ${activeTab === "bulk" ? "bg-red-50 text-red-700 border border-red-200" : "text-gray-700"}
              ${!bulkCfg.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                        {l.tabBulk}
                    </button>
                </div>
            </div>

            {activeTab === "individual" && (
                <div>
                    <SearchList selected={selected} onSelect={setSelected} busy={deletingSingleState} />

                    <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            onClick={handleDeleteSelected}
                            disabled={!selected || deletingSingleState}
                            className={`min-w-[220px] bg-red-600 text-white py-2 px-4 rounded font-semibold
                ${!selected || deletingSingleState ? "opacity-60 cursor-not-allowed" : "hover:bg-red-700"}`}
                        >
                            {deletingSingleState ? "Eliminando..." : l.deleteSelected}
                        </button>
                    </div>
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
                                ({(file.size / (1024 * 1024)).toFixed(2)} MB)
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
                            disabled={!file || uploading}
                            className={`min-w-[220px] bg-red-600 text-white py-2 px-4 rounded font-semibold
                ${!file || uploading ? "opacity-60 cursor-not-allowed" : "hover:bg-red-700"}`}
                        >
                            {uploading ? "Eliminando..." : l.submitBulk}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default EntityDelete;
import React, { useEffect, useMemo, useState } from "react";

export type CommonSearchListProps<T> = {
    mode?: "select" | "browse";
    // Fuente de datos remota (si se provee, se usa con debounce al buscar)
    fetch?: (query: string) => Promise<T[]>;
    // Fuente de datos local (si no hay fetch, se filtra localmente)
    items?: T[];
    getKey: (item: T) => React.Key;
    getLabel: (item: T) => string;

    // Selección controlada (solo en modo "select")
    selected?: T | null;
    onSelect?: (item: T | null) => void;

    // Estado neutral para deshabilitar interacciones
    busy?: boolean;

    // UI
    placeholder?: string;
    emptyText?: string;
    className?: string;
    searchDelayMs?: number;

    // Extra opcional por item (chips, subtítulos, etc.)
    renderItemExtra?: (item: T) => React.ReactNode;
};

const SearchList = <T,>({
    mode = "select",
    fetch,
    items,
    getKey,
    getLabel,
    selected,
    onSelect,
    busy = false,
    placeholder = "Buscar...",
    emptyText = "Sin resultados",
    className,
    searchDelayMs = 250,
    renderItemExtra,
}: CommonSearchListProps<T>) => {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<T[]>(items ?? []);

    // Sin fetch: mantener items sincronizados
    useEffect(() => {
        if (!fetch && items) setData(items);
    }, [items, fetch]);

    // Con fetch: debounced search
    useEffect(() => {
        if (!fetch) return;
        let cancelled = false;
        const t = setTimeout(async () => {
            try {
                setLoading(true);
                const res = await fetch(query);
                if (!cancelled) setData(res);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, searchDelayMs);
        return () => {
            cancelled = true;
            clearTimeout(t);
        };
    }, [query, fetch, searchDelayMs]);

    const filtered = useMemo(() => {
        if (fetch) return data;
        if (!query) return data;
        const q = query.toLowerCase();
        return data.filter((i) => getLabel(i).toLowerCase().includes(q));
    }, [data, query, fetch, getLabel]);

    return (
        <div className={className}>
            <div className="mb-3">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    disabled={busy}
                />
            </div>

            <div className="border border-gray-200 rounded-lg divide-y max-h-80 overflow-auto bg-white">
                {loading && <div className="p-3 text-sm text-gray-500">Buscando...</div>}
                {!loading && filtered.length === 0 && (
                    <div className="p-3 text-sm text-gray-500">{emptyText}</div>
                )}
                {!loading &&
                    filtered.map((item) => {
                        const key = getKey(item);
                        const label = getLabel(item);
                        const isSelected =
                            !!selected &&
                            (getKey(selected as T) === key ||
                                getLabel(selected as T) === label);
                        const clickable = mode === "select" && !!onSelect;

                        return (
                            <div
                                key={key as any}
                                role={clickable ? "button" : undefined}
                                onClick={clickable && !busy ? () => onSelect?.(item) : undefined}
                                className={`px-3 py-2 flex items-center justify-between ${clickable ? "cursor-pointer" : ""
                                    } ${isSelected ? "bg-blue-50" : "bg-white"} hover:bg-gray-50`}
                                aria-disabled={busy}
                            >
                                <div className="truncate">
                                    <span className="font-medium text-gray-800">{label}</span>
                                </div>
                                {renderItemExtra && (
                                    <div className="ml-3 shrink-0">{renderItemExtra(item)}</div>
                                )}
                            </div>
                        );
                    })}
            </div>

            {mode === "select" && onSelect && (
                <div className="flex justify-between mt-2">
                    <button
                        type="button"
                        onClick={() => onSelect(null)}
                        disabled={busy}
                        className="text-sm text-gray-600 hover:text-gray-800"
                    >
                        Limpiar selección
                    </button>
                    {selected && (
                        <span className="text-xs text-gray-500 truncate">
                            Seleccionado: {getLabel(selected)}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchList;
// (El tipo CommonSearchListProps ya está exportado por su declaración arriba.)
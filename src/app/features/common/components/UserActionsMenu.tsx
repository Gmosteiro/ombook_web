import { useRef, useEffect, useState } from "react";

interface ActionOption {
    label: string;
    onClick: () => void;
}

interface Props {
    options: ActionOption[];
}

export default function UserActionsMenu({ options }: Props) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
                Acciones
            </button>
            <div
                className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 transition ${open ? "block" : "hidden"}`}
            >
                {options.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            opt.onClick();
                            setOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700"
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
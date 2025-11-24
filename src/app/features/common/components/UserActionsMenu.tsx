import { useRef, useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { UserRole } from "../../auth/types";

export interface ActionOption {
    label: string;
    onClick: () => void;
    roles: UserRole[];
}

interface Props {
    options: ActionOption[];
}

export default function UserActionsMenu({ options }: Props) {
    const { userRole } = useLoaderData() as { userRole: UserRole };
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

    const visibleOptions = options.filter(
        (opt) => !opt.roles || opt.roles.includes(userRole)
    );

    if (visibleOptions.length === 0) return null;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="ombook-btn ombook-btn-primary"
            >
                Acciones
            </button>
            <div
                className={`absolute right-0 mt-2 w-48 bg-white ombook-border-gray border rounded-md shadow-lg z-50 transition ${open ? "block" : "hidden"}`}
            >
                {visibleOptions.map((opt, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            opt.onClick();
                            setOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-green-50 ombook-text-gray"
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
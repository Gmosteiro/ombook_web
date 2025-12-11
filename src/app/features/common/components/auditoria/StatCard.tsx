import { ReactNode } from "react";

interface StatCardProps {
    label: string;
    value: number;
    icon: ReactNode;
    color: string;
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
    return (
        <div className="ombook-card flex items-start gap-4">
            <div className={`p-3 rounded-full ${color}`}>
                {icon}
            </div>
            <div className="flex flex-col gap-1">
                <span className="ombook-text-gray text-sm font-medium">{label}</span>
                <span className="ombook-heading ombook-heading-lg">{value?.toLocaleString?.() ?? 0}</span>
            </div>
        </div>
    );
}

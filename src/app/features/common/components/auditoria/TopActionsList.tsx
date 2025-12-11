export interface TopAction {
    label: string;
    value: number;
}

interface TopActionsListProps {
    topActions: TopAction[];
}

export function TopActionsList({ topActions }: TopActionsListProps) {
    const maxValue = topActions?.[0]?.value || 1;

    return (
        <div className="space-y-3">
            {topActions?.map((action) => (
                <div key={action.label} className="flex items-center gap-3">
                    <span className="ombook-text-gray text-sm w-32">{action.label}</span>
                    <div className="flex-1 h-3 ombook-bg-gray-light rounded-full mr-2">
                        <div
                            className="h-3 rounded-full ombook-bg-green"
                            style={{ width: `${(action.value / maxValue) * 100}%` }}
                        ></div>
                    </div>
                    <span className="ombook-heading ombook-heading-sm">{action.value}</span>
                </div>
            ))}
        </div>
    );
}

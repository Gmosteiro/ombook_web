export interface DonutDatum {
    label: string;
    value: number;
    color: string;
}

interface DonutChartProps {
    donutData: DonutDatum[];
    total: number;
}

export function DonutChart({ donutData, total }: DonutChartProps) {
    return (
        <div className="relative flex items-center justify-center" style={{ width: 192, height: 192 }}>
            <svg viewBox="0 0 36 36" className="w-full h-full">
                <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                {donutData.length > 0 ? donutData.map((d, idx) => {
                    const totalValue = donutData.reduce((acc, cur) => acc + cur.value, 0);
                    const percent = (d.value / totalValue) * 100;
                    const prevPercent = donutData.slice(0, idx).reduce((acc, cur) => acc + (cur.value / totalValue) * 100, 0);
                    return (
                        <circle
                            key={d.label}
                            cx="18"
                            cy="18"
                            r="15.9155"
                            fill="none"
                            stroke={d.color}
                            strokeWidth="3"
                            strokeDasharray={`${percent}, 100`}
                            strokeDashoffset={-prevPercent}
                        />
                    );
                }) : null}
            </svg>
            <div className="absolute flex flex-col items-center justify-center w-full h-full top-0 left-0">
                <span className="ombook-heading ombook-heading-lg">{total}</span>
                <span className="ombook-text-gray text-sm">Total Hoy</span>
            </div>
        </div>
    );
}

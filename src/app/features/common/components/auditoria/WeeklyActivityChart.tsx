import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface WeeklyActivityChartProps {
    weeklyActivity: number[];
    weeklyLabels: string[];
}

export function WeeklyActivityChart({ weeklyActivity, weeklyLabels }: WeeklyActivityChartProps) {
    const data = weeklyLabels.map((label, i) => ({
        name: label,
        value: weeklyActivity[i] ?? 0
    }));

    return (
        <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity={0.01} />
                    </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#colorActivity)" strokeWidth={3} />
            </AreaChart>
        </ResponsiveContainer>
    );
}

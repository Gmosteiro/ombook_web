// Puedes poner esto en /src/components/MaterialIcon.tsx
interface MaterialIconProps {
    name: string;
    color?: string;
    size?: number | string;
    className?: string;
}
export function MaterialIcon({ name, color = "#2563eb", size = 32, className = "" }: MaterialIconProps) {
    return (
        <span
            className={`material-symbols-outlined ${className}`}
            style={{ color, fontSize: size, lineHeight: 1 }}
        >
            {name}
        </span>
    );
}
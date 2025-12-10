export const isClient = typeof window !== 'undefined';

// En Vite, usar import.meta.env tanto en cliente como servidor
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';


// Función helper para formatear el tamaño del archivo
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    const size = bytes / Math.pow(k, i);

    // Si es menor a 1 KB, mostrar en bytes
    if (i === 0) {
        return `${bytes} ${sizes[i]}`;
    }

    // Para KB y MB, mostrar con decimales apropiados
    const decimals = i === 1 ? 1 : 2; // KB con 1 decimal, MB+ con 2 decimales

    return `${size.toFixed(decimals)} ${sizes[i]}`;
};



export const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';

    // Si la fecha ya está en formato ISO, extraer directamente
    // Formato esperado: "YYYY-MM-DDTHH:mm:ss" o "YYYY-MM-DDTHH:mm"
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (isoMatch) {
        return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T${isoMatch[4]}:${isoMatch[5]}`;
    }

    // Fallback: parsear la fecha (puede causar problemas de timezone)
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Formatea una fecha ISO para mostrar al usuario
 * Formato: "DD/MM/YYYY HH:mm"
 */
export const formatDateDisplay = (dateString?: string | null): string => {
    if (!dateString) return 'No programada';

    // Extraer componentes directamente del string ISO sin parsear con Date
    // Formato esperado: "YYYY-MM-DDTHH:mm:ss" o "YYYY-MM-DDTHH:mm"
    const isoMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (isoMatch) {
        const [, year, month, day, hours, minutes] = isoMatch;
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }

    // Fallback: si no es ISO estándar, intentar parsear
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Fecha inválida

        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch {
        return dateString; // Si todo falla, retornar el string original
    }
};
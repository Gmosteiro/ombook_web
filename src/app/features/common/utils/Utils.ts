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
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};
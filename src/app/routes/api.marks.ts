


// Types for API responses
export type MarkResponse = {
    calificacion: number;
    comentarios?: string;
    publicada: boolean;
};

export type MarksListResponse = Array<{
    usuarioId: number;
    nombre: string;
    apellido: string;
    calificacion: number;
    comentarios?: string;
    publicada: boolean;
}>;

export type SaveMarksResponse = {
    success: boolean;
    message?: string;
};

export type PublishMarksResponse = {
    success: boolean;
    notified: boolean;
    message?: string;
};

const API_BASE = "/cursos";


export async function listMarks(cursoId: string): Promise<MarksListResponse> {
    const res = await fetch(`${API_BASE}/${cursoId}/calificaciones-finales`, {
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Error al listar calificaciones");
    return res.json();
}


export async function saveMarks(cursoId: string, data: any): Promise<SaveMarksResponse> {
    const res = await fetch(`${API_BASE}/${cursoId}/calificaciones-finales`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Error al guardar calificaciones");
    return res.json();
}


export async function publishMarks(cursoId: string): Promise<PublishMarksResponse> {
    const res = await fetch(`${API_BASE}/${cursoId}/calificaciones-finales/publicacion`, {
        method: "POST",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Error al publicar calificaciones");
    return res.json();
}


export async function getMyMark(cursoId: string): Promise<MarkResponse> {
    const res = await fetch(`${API_BASE}/${cursoId}/calificaciones-finales/mi`, {
        method: "GET",
        credentials: "include",
    });
    if (!res.ok) throw new Error("Error al obtener mi calificación");
    return res.json();
}

import { getValidJWTToken } from "~/services/session.server";
import { apiFetch } from "~/features/auth/utils/methods";

export type PaginaTematica = {
    id: number;
    titulo: string;
    contenido: string;
    fechaCreacion: string;
    fechaProgramada: string;
    cursoId: number;
    creadorId: number;
    recursos?: Recurso[];
};

export type Recurso = {
    id: number;
    nombreOriginal: string;
    ownerRecurso: "PAGINA" | "TAREA" | "ENTREGA";
    ownerId: number;
    contentType: string;
    sizeBytes: number;
    fechaSubida: string;
    subidoPorUsuarioId: number;
};

/**
 * Obtiene todas las páginas temáticas de un curso con sus recursos
 */
export async function getPaginasTematicas(request: Request, cursoId: number): Promise<PaginaTematica[]> {
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch(`/cursos/${cursoId}/paginas`, {
        method: "GET",
        secure: true,
        jwtToken,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const paginas: PaginaTematica[] = await response.json();

    // Obtener recursos para cada página
    const paginasConRecursos = await Promise.all(
        paginas.map(async (pagina) => {
            try {
                const recursosRes = await apiFetch(`/cursos/${cursoId}/recursos?ownerRecurso=PAGINA&ownerId=${pagina.id}`, {
                    method: 'GET',
                    secure: true,
                    jwtToken
                });
                let recursos: Recurso[] = [];
                if (recursosRes.ok) {
                    recursos = await recursosRes.json();
                }
                return { ...pagina, recursos };
            } catch (error) {
                console.error(`Error fetching recursos for pagina ${pagina.id}:`, error);
                return { ...pagina, recursos: [] };
            }
        })
    );

    return paginasConRecursos.sort((a, b) => a.id - b.id);
}

/**
 * Obtiene una página temática específica
 */
export async function getPaginaTematica(request: Request, cursoId: number, paginaId: number): Promise<PaginaTematica> {
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch(`/cursos/${cursoId}/paginas/${paginaId}`, {
        method: "GET",
        secure: true,
        jwtToken,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json() as PaginaTematica;
}

/**
 * Crea una nueva página temática
 */
export async function createPaginaTematica(
    request: Request,
    cursoId: number,
    data: {
        titulo: string;
        contenido: string;
        fechaProgramada?: string | null;
    }
): Promise<PaginaTematica> {
    const jwtToken = await getValidJWTToken(request);

    const response = await apiFetch(`/cursos/${cursoId}/paginas`, {
        method: "POST",
        secure: true,
        jwtToken,
        body: JSON.stringify({
            ...data,
            cursoId,
            fechaProgramada: data.fechaProgramada || null
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return await response.json() as PaginaTematica;
}

/**
 * Actualiza una página temática existente
 */
export async function updatePaginaTematica(
    request: Request,
    cursoId: number,
    paginaId: number,
    data: {
        titulo: string;
        contenido: string;
        fechaProgramada?: string | null;
    }
): Promise<PaginaTematica> {
    const jwtToken = await getValidJWTToken(request);

    console.log("Updating pagina tematica with data:", data);
    const response = await apiFetch(`/cursos/${cursoId}/paginas/${paginaId}`, {
        method: "PUT",
        secure: true,
        jwtToken,
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return await response.json() as PaginaTematica;
}

/**
 * Elimina una página temática
 */
export async function deletePaginaTematica(request: Request, cursoId: number, paginaId: number): Promise<boolean> {
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch(`/cursos/${cursoId}/paginas/${paginaId}`, {
        method: "DELETE",
        secure: true,
        jwtToken,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return true;
}

/**
 * Obtiene recursos de una página
 */
export async function getRecursosPagina(request: Request, cursoId: number, paginaId: number): Promise<Recurso[]> {
    try {
        const jwtToken = await getValidJWTToken(request);
        const response = await apiFetch(`/cursos/${cursoId}/recursos?ownerRecurso=PAGINA&ownerId=${paginaId}`, {
            method: "GET",
            secure: true,
            jwtToken,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json() as Recurso[];
    } catch (error) {
        console.error(`Error fetching recursos for pagina ${paginaId}:`, error);
        return [];
    }
}

/**
 * Obtiene URL de descarga de un recurso
 */
export async function getRecursoUrl(request: Request, cursoId: number, recursoId: number): Promise<string> {
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch(`/cursos/${cursoId}/recursos/${recursoId}/descargar-url`, {
        method: "GET",
        secure: true,
        jwtToken,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json() as { url: string };
    return data.url;
}

/**
 * Sube un recurso a una página
 */
export async function uploadRecursoPagina(
    request: Request,
    cursoId: number,
    paginaId: number,
    nombre: string,
    file: File
): Promise<Recurso> {
    const jwtToken = await getValidJWTToken(request);
    const formData = new FormData();
    formData.append('ownerRecurso', 'PAGINA');
    formData.append('ownerId', paginaId.toString());
    formData.append('nombre', "ArchivoPagina");
    formData.append('archivo', file);

    const response = await apiFetch(`/cursos/${cursoId}/recursos`, {
        method: "POST",
        secure: true,
        jwtToken,
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    return await response.json() as Recurso;
}

/**
 * Elimina un recurso de una página
 */
export async function deleteRecursoPagina(
    request: Request,
    cursoId: number,
    recursoId: number
): Promise<boolean> {
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch(`/cursos/${cursoId}/recursos/${recursoId}`, {
        method: "DELETE",
        secure: true,
        jwtToken,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return true;
}

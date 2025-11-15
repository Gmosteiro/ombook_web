import { apiFetch } from "../features/auth/utils/methods";

// Individual enroll (matricular estudiante en curso)
export async function enrollUser(request: Request, usuarioId: number, cursoId: number) {
    const { getValidJWTToken } = await import("../services/session.server");
    const response = await apiFetch(`/cursos/${cursoId}/matriculas`, {
        method: "POST",
        body: JSON.stringify(usuarioId),
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });
    return response;
}

// Mass enroll (CSV)
export async function enrollUsersMassive(request: Request, cursoId: number, file: File) {
    const { getValidJWTToken } = await import("../services/session.server");
    const formData = new FormData();
    formData.append("csvFile", file);

    // Usar endpoint correcto para alta masiva
    const response = await apiFetch(`/cursos/${cursoId}/matriculas/importaciones-alta`, {
        method: "POST",
        body: formData,
        secure: true,
        jwtToken: await getValidJWTToken(request)
    });
    return response;
}

// Individual unenroll (desmatricular estudiante de curso)
export async function unenrollUser(request: Request, cursoId: number, estudianteId: number) {
    const { getValidJWTToken } = await import("../services/session.server");
    const response = await apiFetch(`/cursos/${cursoId}/matriculas/${estudianteId}`, {
        method: "DELETE",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });
    return response;
}

// Mass unenroll (CSV)
export async function unenrollUsersMassive(request: Request, cursoId: number, file: File) {
    const { getValidJWTToken } = await import("../services/session.server");
    const formData = new FormData();
    formData.append("csvFile", file);

    // Usar endpoint correcto para baja masiva
    const response = await apiFetch(`/cursos/${cursoId}/matriculas/importaciones-baja`, {
        method: "POST",
        body: formData,
        secure: true,
        jwtToken: await getValidJWTToken(request)
    });
    return response;
}
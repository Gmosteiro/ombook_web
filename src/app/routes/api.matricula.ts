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

    const response = await apiFetch(`/matricula/alta/masiva?cursoId=${cursoId}`, {
        method: "POST",
        body: formData,
        secure: true,
        jwtToken: await getValidJWTToken(request)
    });
    return response;
}
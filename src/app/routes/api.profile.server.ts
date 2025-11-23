import { apiFetch } from "../features/auth/utils/methods";
import type { components } from "../../types/openapi";

// Tipos
export type UsuarioBasicoResponse = components["schemas"]["UsuarioBasicoResponse"];
export type ActualizarPerfilRequest = components["schemas"]["ActualizarPerfilRequest"];

// Obtener perfil del usuario actual
export async function getPerfil(request: Request): Promise<UsuarioBasicoResponse> {
    const { getValidJWTToken } = await import("../services/session.server");
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch("/usuarios/me", {
        method: "GET",
        secure: true,
        jwtToken,
    });
    if (!response.ok) throw new Error("No se pudo obtener el perfil");


    const res = await response.json() as UsuarioBasicoResponse;
    return res;
}

// Actualizar perfil del usuario actual
export async function actualizarPerfil(request: Request, data: ActualizarPerfilRequest): Promise<UsuarioBasicoResponse> {

    const { getValidJWTToken } = await import("../services/session.server");
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch("/usuarios/me", {
        method: "PATCH",
        secure: true,
        jwtToken,
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("No se pudo actualizar el perfil");

    return getPerfil(request);
}

// Actualizar avatar (PUT)
export async function actualizarAvatar(request: Request, archivo: File): Promise<UsuarioBasicoResponse> {
    const formData = new FormData();
    formData.append("archivo", archivo);

    const { getUserId, getValidJWTToken } = await import("../services/session.server");
    const usuarioId = await getUserId(request);
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch(`/usuarios/${usuarioId}/avatar`, {
        method: "PUT",
        secure: true,
        jwtToken,
        body: formData,
        extraHeaders: {}
    });

    const errorText = await response.text();
    if (!response.ok) throw new Error(errorText || "No se pudo actualizar el avatar");

    return getPerfil(request);
}

// Resetear avatar (DELETE)
export async function resetAvatar(request: Request): Promise<void> {
    const { getValidJWTToken } = await import("../services/session.server");
    const jwtToken = await getValidJWTToken(request);
    const response = await apiFetch(`/usuarios/me/avatar`, {
        method: "DELETE",
        secure: true,
        jwtToken,
    });
    if (!response.ok) throw new Error("No se pudo resetear el avatar");
}
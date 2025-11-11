import { apiFetch } from "../features/auth/utils/methods";
import { getValidJWTToken, getUserId } from "../services/session.server";
import type { components } from "../../types/openapi";

// Tipos
export type UsuarioBasicoResponse = components["schemas"]["UsuarioBasicoResponse"];
export type ActualizarPerfilRequest = components["schemas"]["ActualizarPerfilRequest"];

// Obtener perfil del usuario actual
export async function getPerfil(request: Request): Promise<UsuarioBasicoResponse> {
    const response = await apiFetch("/usuarios/me", {
        method: "GET",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });
    if (!response.ok) throw new Error("No se pudo obtener el perfil");


    const res = await response.json() as UsuarioBasicoResponse;
    console.log("Fetched user profile:", res);
    return res;
}

// Actualizar perfil del usuario actual
export async function actualizarPerfil(request: Request, data: ActualizarPerfilRequest): Promise<UsuarioBasicoResponse> {

    const response = await apiFetch("/usuarios/me", {
        method: "PATCH",
        secure: true,
        jwtToken: await getValidJWTToken(request),
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("No se pudo actualizar el perfil");

    return getPerfil(request);
}

// Actualizar avatar (PUT)
export async function actualizarAvatar(request: Request, archivo: File): Promise<UsuarioBasicoResponse> {
    const formData = new FormData();
    formData.append("archivo", archivo);

    const usuarioId = await getUserId(request);
    const response = await apiFetch(`/usuarios/${usuarioId}/avatar`, {
        method: "PUT",
        secure: true,
        jwtToken: await getValidJWTToken(request),
        body: formData,
        extraHeaders: {}
    });

    const errorText = await response.text();
    console.log("Avatar update response error text:", errorText);

    if (!response.ok) throw new Error(errorText || "No se pudo actualizar el avatar");
    console.log("Avatar updated successfully.");
    return getPerfil(request);
}

// Resetear avatar (DELETE)
export async function resetAvatar(request: Request): Promise<void> {
    const response = await apiFetch(`/usuarios/me/avatar`, {
        method: "DELETE",
        secure: true,
        jwtToken: await getValidJWTToken(request),
    });
    if (!response.ok) throw new Error("No se pudo resetear el avatar");
}
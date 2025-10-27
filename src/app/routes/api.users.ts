import { ActionFunctionArgs } from "react-router";
import { getValidJWTToken } from "~/services/session.server";
import { apiFetch } from "~/features/auth/utils/methods";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "loadUsers") {
        try {
            const jwtToken = await getValidJWTToken(request);
            const queryType = formData.get("queryType") as string;
            const userId = formData.get("userId") as string;


            let endpoint: string;

            switch (queryType) {
                case 'profesores':
                    endpoint = "/usuarios/profesores";
                    break;
                case 'listar':
                    endpoint = "/usuarios/listar";
                    break;
                case 'byId':
                    if (!userId) {
                        return new Response(JSON.stringify({
                            success: false,
                            error: "ID de usuario requerido",
                        }), {
                            status: 400,
                            headers: { "Content-Type": "application/json" }
                        });
                    }
                    endpoint = `/usuarios/${userId}`;
                    break;
                default:
                    return new Response(JSON.stringify({
                        success: false,
                        error: "Tipo de consulta no válido",
                    }), {
                        status: 400,
                        headers: { "Content-Type": "application/json" }
                    });
            }


            const response = await apiFetch(endpoint, {
                method: 'GET',
                secure: true,
                jwtToken: jwtToken,
            });


            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            // console.log("API: Data received:", data);

            return new Response(JSON.stringify({
                success: true,
                data: data,
            }), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            console.error("API: Error loading users:", error);
            return new Response(JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Error al cargar usuarios",
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    return new Response(JSON.stringify({
        success: false,
        error: "Intent no reconocido",
    }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
    });
}

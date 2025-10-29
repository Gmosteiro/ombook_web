import { ActionFunctionArgs } from "react-router";
import { getUserId, getUserRole, getValidJWTToken } from "~/services/session.server";
import { API_URL } from "~/features/common/utils/Utils";

export async function action({ request }: ActionFunctionArgs) {
    try {
        const jsonData = await request.json();

        const {
            allowedRoles,
            backendEndpoint,
            successMessage,
            fileName,
            fileType,
            fileContent
        } = jsonData;

        if (!allowedRoles || !backendEndpoint || !fileName || !fileContent) {
            return Response.json({
                success: false,
                error: "Datos incompletos"
            }, { status: 400 });
        }

        const userId = await getUserId(request);
        const userRole = await getUserRole(request);

        if (!userId || !userRole || !allowedRoles.includes(userRole)) {
            return Response.json({
                success: false,
                error: "No tienes permisos para realizar esta operación"
            }, { status: 403 });
        }

        const jwtToken = await getValidJWTToken(request);

        // Reconstruir archivo desde base64
        const binaryString = atob(fileContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const reconstructedFile = new File([bytes], fileName, {
            type: fileType || 'text/csv'
        });

        const backendFormData = new FormData();
        backendFormData.append('csvFile', reconstructedFile, fileName);

        console.log('Submitting CSV Import to backend:', {
            backendEndpoint,
            fileName,
            fileType,
            fileSize: reconstructedFile.size
        });

        const response = await fetch(`${API_URL}${backendEndpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: backendFormData,
        });

        console.log('CSV Import Response Status:', response.status);
        const responseBody = await response.clone().text();
        console.log('CSV Import Response Body:', responseBody);

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const errorText = await response.text();
                if (errorText) {
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.message || errorJson.error || errorText;
                    } catch {
                        errorMessage = errorText;
                    }
                }
            } catch {
                // usar errorMessage por defecto
            }

            return Response.json({
                success: false,
                error: `Error del backend: ${errorMessage}`
            }, { status: response.status });
        }

        try {
            const responseData = await response.json();

            // Construir mensaje con detalles de errores
            let message = `${responseData.errores === 0 ? successMessage : 'Import con Errores'}: `;

            return Response.json({
                success: responseData.errores === 0, // Solo es éxito si no hay errores
                message: message,
                data: responseData,
                // Incluir detalles separadamente para el frontend
                errorDetails: responseData.detalleErrores || []
            });
        } catch {
            return Response.json({
                success: true,
                message: successMessage
            });
        }

    } catch (error) {
        console.error('CSV Import Error:', error);
        return Response.json({
            success: false,
            error: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`
        }, { status: 500 });
    }
}
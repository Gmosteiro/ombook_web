import { ActionFunctionArgs } from "react-router";
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


        console.log('CSV Import Action Invoked with data:', {
            allowedRoles,
            backendEndpoint,
            fileName,
            fileType,
            fileContentPresent: !!fileContent
        });

        if (!allowedRoles || !backendEndpoint || !fileName || !fileContent) {
            return Response.json({
                success: false,
                error: "Datos incompletos"
            }, { status: 400 });
        }

        const { getUserId, getUserRole, getValidJWTToken } = await import("~/services/session.server");
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

        const response = await fetch(`${API_URL}${backendEndpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: backendFormData,
        });

        if (!response.ok) {

            console.log('Backend responded with error status:', response.status);
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

            console.log('Parsing backend response as JSON');
            const responseData = await response.json();

            // Construir mensaje detallado
            let message = '';
            if (responseData.errores === 0) {
                message = `${successMessage}: ${responseData.correctos} registros importados correctamente`;
            } else {
                message = `Importación completada con errores: ${responseData.correctos} correctos, ${responseData.errores} errores`;
            }

            return Response.json({
                success: responseData.errores === 0,
                message: message,
                error: responseData.errores > 0 ? message : undefined, // Agregar esto
                data: responseData,
                errorDetails: responseData.detalleErrores || []
            });
        } catch {
            console.log('No JSON response from backend, assuming success.');
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
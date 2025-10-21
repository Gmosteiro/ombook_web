console.log('📁 api-csv-import.ts MODULE LOADED!');

import { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getUserId, getUserRole, getValidJWTToken } from "~/services/session.server";
import { UserRole } from "~/features/auth/types";
import { API_URL } from "~/features/common/utils/Utils";

export async function loader({ request }: LoaderFunctionArgs) {
    console.log('🟢 api-csv-import LOADER called - route is detected!');

    // NO hacer verificación de auth en el loader - solo información pública
    return Response.json({
        message: "CSV Import endpoint is available",
        timestamp: new Date().toISOString(),
        allowedMethods: ["POST"]
    });
}

export async function action({ request }: ActionFunctionArgs) {
    console.log('🟢 api-csv-import ACTION called!');

    try {
        // *** LEER COMO JSON EN LUGAR DE FORMDATA ***
        const jsonData = await request.json();

        console.log('=== JSON DATA DEBUG ===');
        console.log('Received:', {
            ...jsonData,
            fileContent: `base64 string (length: ${jsonData.fileContent?.length})`
        });
        console.log('=== END DEBUG ===');

        const {
            allowedRoles,
            backendEndpoint,
            successMessage,
            fileName,
            fileSize,
            fileType,
            fileContent
        } = jsonData;

        // Resto de validaciones...
        if (!allowedRoles || !backendEndpoint || !fileName || !fileContent) {
            return Response.json({
                success: false,
                error: "Datos incompletos"
            }, { status: 400 });
        }

        // Auth checks...
        const userId = await getUserId(request);
        const userRole = await getUserRole(request);

        if (!userId || !userRole || !allowedRoles.includes(userRole)) {
            return Response.json({
                success: false,
                error: "No tienes permisos para realizar esta operación"
            }, { status: 403 });
        }

        const jwtToken = await getValidJWTToken(request);
        if (!jwtToken) {
            return Response.json({
                success: false,
                error: "Error de autenticación"
            }, { status: 401 });
        }

        // Reconstruir archivo
        const binaryString = atob(fileContent);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const reconstructedFile = new File([bytes], fileName, {
            type: fileType || 'text/csv'
        });

        console.log('✅ File reconstructed for backend');

        // Enviar al backend como MultipartFile normal
        const backendFormData = new FormData();
        backendFormData.append('csvFile', reconstructedFile, fileName);

        const response = await fetch(`${API_URL}${backendEndpoint}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: backendFormData, // ← Backend recibe MultipartFile normal
        });

        // Resto del manejo de respuesta...
        if (!response.ok) {
            const errorText = await response.text();
            return Response.json({
                success: false,
                error: `Error del backend: ${errorText}`
            }, { status: response.status });
        }

        const responseData = await response.json();
        return Response.json({
            success: true,
            message: `${successMessage}: ${responseData.correctos} correctos, ${responseData.errores} errores`,
            data: responseData
        });

    } catch (error) {
        console.error('❌ CSV Import Error:', error);
        return Response.json({
            success: false,
            error: `Error interno: ${error instanceof Error ? error.message : String(error)}`
        }, { status: 500 });
    }
}
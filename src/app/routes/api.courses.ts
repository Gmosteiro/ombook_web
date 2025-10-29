import { ActionFunctionArgs } from "react-router";
import { getValidJWTToken } from "~/services/session.server";
import { apiFetch } from "~/features/auth/utils/methods";

export async function action({ request }: ActionFunctionArgs) {
    const contentType = request.headers.get("content-type");

    // Manejar requests JSON (para imports masivos)
    if (contentType?.includes("application/json")) {
        try {
            const requestBody = await request.json();
            const { backendEndpoint } = requestBody;

            if (backendEndpoint === "/cursos/eliminar/masivo") {
                return await handleMassiveDeletion(request, requestBody);
            }

            // Otros endpoints JSON aquí...
            return new Response(JSON.stringify({
                success: false,
                error: "Endpoint no reconocido",
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });

        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: "Error procesando request JSON",
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    // Manejar requests FormData (para operaciones individuales)
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "deleteCourse") {
        try {
            const jwtToken = await getValidJWTToken(request);
            const courseId = formData.get("courseId") as string;

            if (!courseId) {
                return new Response(JSON.stringify({
                    success: false,
                    error: "ID del curso requerido",
                }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            const response = await apiFetch(`/cursos/${courseId}`, {
                method: 'DELETE',
                secure: true,
                jwtToken: jwtToken,
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            return new Response(JSON.stringify({
                success: true,
                message: "Curso eliminado exitosamente",
            }), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: "Error al eliminar el curso",
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    if (intent === "loadCourses") {
        try {
            const jwtToken = await getValidJWTToken(request);
            const queryType = formData.get("queryType") as string;
            const courseId = formData.get("courseId") as string;

            let endpoint: string;

            switch (queryType) {
                case 'listar':
                    endpoint = "/cursos/listar";
                    break;
                case 'byId':
                    if (!courseId) {
                        return new Response(JSON.stringify({
                            success: false,
                            error: "ID del curso requerido",
                        }), {
                            status: 400,
                            headers: { "Content-Type": "application/json" }
                        });
                    }
                    endpoint = `/cursos/${courseId}`;
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
                if (response.status === 404 && queryType === 'listar') {
                    return new Response(JSON.stringify({
                        success: true,
                        data: [],
                    }), {
                        headers: { "Content-Type": "application/json" }
                    });
                }
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            return new Response(JSON.stringify({
                success: true,
                data: data,
            }), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: "Error al cargar cursos",
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    if (intent === "createCourse") {
        try {
            const jwtToken = await getValidJWTToken(request);

            // Parse profesores y extraer solo los IDs
            const profesoresRaw = formData.get("profesoresResponsables") as string;
            let profesoresResponsables: number[] = [];

            if (profesoresRaw) {
                try {
                    const profesoresObj = JSON.parse(profesoresRaw);
                    profesoresResponsables = profesoresObj.map((p: any) => p.id);
                } catch (e) { }
            }

            const courseData = {
                nombre: formData.get("nombre") as string,
                codigo: formData.get("codigo") as string,
                descripcion: formData.get("descripcion") as string,
                periodoAcademico: formData.get("periodoAcademico") as string,
                profesoresResponsables: profesoresResponsables
            };

            if (!courseData.nombre || !courseData.codigo || !courseData.descripcion) {
                return new Response(JSON.stringify({
                    success: false,
                    error: "Nombre, código y descripción son campos requeridos",
                }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            const response = await apiFetch("/cursos/crear", {
                method: 'POST',
                secure: true,
                jwtToken: jwtToken,
                body: courseData,
            });

            if (!response.ok) {
                let errorBody;
                try {
                    errorBody = await response.text();
                } catch (e) { }
                const errorMessage = `Error ${response.status}: ${response.statusText}. Body: ${errorBody || 'No body'}`;
                throw new Error(errorMessage);
            }

            let data = null;
            const contentLength = response.headers.get('content-length');
            if (contentLength && contentLength !== '0') {
                try {
                    data = await response.json();
                } catch (e) {
                    data = { message: "Course created successfully" };
                }
            } else {
                data = { message: "Course created successfully" };
            }

            return new Response(JSON.stringify({
                success: true,
                data: data,
            }), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Error al crear el curso",
            }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    }

    if (intent === "deleteMassive") {
        try {
            const jwtToken = await getValidJWTToken(request);

            const requestBody = await request.json();
            const { backendEndpoint, fileContent, fileName } = requestBody;

            const fileBuffer = Buffer.from(fileContent, 'base64');
            const formData = new FormData();
            const blob = new Blob([fileBuffer], { type: 'text/csv' });
            formData.append('csvFile', blob, fileName);

            const response = await fetch(`${process.env.API_URL}${backendEndpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                },
                body: formData,
            });

            if (!response.ok) {
                let errorBody;
                try {
                    errorBody = await response.text();
                } catch (e) { }
                const errorMessage = `Error ${response.status}: ${response.statusText}. Body: ${errorBody || 'No body'}`;
                throw new Error(errorMessage);
            }

            let data = null;
            const contentLength = response.headers.get('content-length');
            if (contentLength && contentLength !== '0') {
                try {
                    data = await response.json();
                } catch (e) {
                    data = { correctos: 0, errores: 0, total: 0 };
                }
            } else {
                data = { correctos: 0, errores: 0, total: 0 };
            }

            const message = `Cursos eliminados: ${data.correctos || 0} correctos, ${data.errores || 0} errores`;

            return new Response(JSON.stringify({
                success: true,
                message: message,
                data: data,
            }), {
                headers: { "Content-Type": "application/json" }
            });

        } catch (error) {
            return new Response(JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Error al eliminar cursos masivamente",
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

async function handleMassiveDeletion(request: Request, requestBody: any) {
    try {
        const jwtToken = await getValidJWTToken(request);
        const { backendEndpoint, fileContent, fileName } = requestBody;

        const fileBuffer = Buffer.from(fileContent, 'base64');
        const formData = new FormData();
        const blob = new Blob([fileBuffer], { type: 'text/csv' });
        formData.append('csvFile', blob, fileName);

        const response = await apiFetch(`${backendEndpoint}`, {
            method: 'POST',
            secure: true,
            jwtToken: jwtToken,
            body: formData,
        });

        if (!response.ok) {
            let errorBody;
            try {
                errorBody = await response.text();
            } catch (e) { }
            const errorMessage = `Error ${response.status}: ${response.statusText}. Body: ${errorBody || 'No body'}`;
            throw new Error(errorMessage);
        }

        let data = null;
        const contentLength = response.headers.get('content-length');
        if (contentLength && contentLength !== '0') {
            try {
                data = await response.json();
            } catch (e) {
                data = { correctos: 0, errores: 0, total: 0 };
            }
        } else {
            data = { correctos: 0, errores: 0, total: 0 };
        }

        const message = `Cursos eliminados: ${data.correctos || 0} correctos, ${data.errores || 0} errores`;

        return new Response(JSON.stringify({
            success: true,
            message: message,
            data: data,
        }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : "Error al eliminar cursos masivamente",
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

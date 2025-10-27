import { ActionFunctionArgs } from "react-router";
import { getValidJWTToken } from "~/services/session.server";
import { apiFetch } from "~/features/auth/utils/methods";

export async function action({ request }: ActionFunctionArgs) {
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
            console.error("Error deleting course:", error);
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
                    // Asumiendo que existe este endpoint similar a /usuarios/listar
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
                // Si no existe el endpoint /cursos/listar, devolver array vacío por ahora
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
            console.error("Error loading courses:", error);
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

            // Log todos los datos del formData
            console.log("=== CREATE COURSE DEBUG ===");
            console.log("FormData entries:");
            for (const [key, value] of formData.entries()) {
                console.log(`${key}:`, value);
            }

            // Parse profesores y extraer solo los IDs
            const profesoresRaw = formData.get("profesoresResponsables") as string;
            let profesoresResponsables: number[] = [];

            if (profesoresRaw) {
                try {
                    const profesoresObj = JSON.parse(profesoresRaw);
                    // Extraer solo los IDs
                    profesoresResponsables = profesoresObj.map((p: any) => p.id);
                } catch (e) {
                    console.error("Error parsing profesores:", e);
                }
            }

            const courseData = {
                nombre: formData.get("nombre") as string,
                codigo: formData.get("codigo") as string,
                descripcion: formData.get("descripcion") as string,
                periodoAcademico: formData.get("periodoAcademico") as string,
                profesoresResponsables: profesoresResponsables // Solo IDs
            };

            console.log("Parsed courseData:", JSON.stringify(courseData, null, 2));

            // Validar datos requeridos
            if (!courseData.nombre || !courseData.codigo || !courseData.descripcion) {
                console.log("Validation failed: Missing required fields");
                return new Response(JSON.stringify({
                    success: false,
                    error: "Nombre, código y descripción son campos requeridos",
                }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" }
                });
            }

            console.log("Sending request to /cursos/crear with:", JSON.stringify(courseData, null, 2));

            const response = await apiFetch("/cursos/crear", {
                method: 'POST',
                secure: true,
                jwtToken: jwtToken,
                body: courseData, // Enviar el objeto directamente, no como string
            });

            console.log("Response status:", response.status);
            console.log("Response headers:", Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                // Intentar leer el cuerpo de la respuesta para más detalles
                let errorBody;
                try {
                    errorBody = await response.text();
                    console.log("Error response body:", errorBody);
                } catch (e) {
                    console.log("Could not read error response body");
                }

                const errorMessage = `Error ${response.status}: ${response.statusText}. Body: ${errorBody || 'No body'}`;
                console.error("Error creating course:", errorMessage);
                throw new Error(errorMessage);
            }

            // Manejar respuesta exitosa
            let data = null;
            const contentLength = response.headers.get('content-length');
            if (contentLength && contentLength !== '0') {
                try {
                    data = await response.json();
                } catch (e) {
                    console.log("Response has no JSON body");
                    data = { message: "Course created successfully" };
                }
            } else {
                // Respuesta vacía exitosa
                data = { message: "Course created successfully" };
            }

            console.log("Course created successfully:", data);

            return new Response(JSON.stringify({
                success: true,
                data: data,
            }), {
                headers: { "Content-Type": "application/json" }
            });
        } catch (error) {
            console.error("Error creating course:", error);
            return new Response(JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : "Error al crear el curso",
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
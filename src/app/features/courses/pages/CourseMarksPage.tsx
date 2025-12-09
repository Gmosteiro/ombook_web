import { useLoaderData, LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { UserRole } from "~/features/auth/types";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import TeacherMarks from "../components/marks/TeacherMarks";
import StudentMarks from "../components/marks/StudentMarks";
import { getUserRole } from "~/services/session.server";
import { getMyMarks, listMarks, saveMarks, publishMarks } from "../../../routes/api.marks";
import { MarksListResponse, CalificacionFinalEstudianteResponse } from "../../../routes/api.marks";
import { getEstudiantesByCurso, UsuarioListaResponse } from "../../../routes/api.users.server";

import { apiFetch } from "~/features/auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
    requireRoleLoader([UserRole.PROFESOR, UserRole.ESTUDIANTE]);
    const userRole = await getUserRole(request) ?? UserRole.ESTUDIANTE; // Valor por defecto
    const courseId = params.id;

    let result: LoaderData = { userRole };

    if (userRole === UserRole.ESTUDIANTE && courseId) {
        const studentMarks = await getMyMarks(request, courseId);
        result.studentMarks = studentMarks;
    }
    if (userRole === UserRole.PROFESOR && courseId) {
        const teacherMarks = await listMarks(request, courseId);
        const estudiantes = await getEstudiantesByCurso(request, Number(courseId));
        result.teacherMarks = teacherMarks;
        result.estudiantes = estudiantes;
    }

    return new Response(
        JSON.stringify(result),
        {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Pragma": "no-cache",
            },
        }
    );
}

export async function action({ request, params }: ActionFunctionArgs) {
    const userRole = await getUserRole(request);

    if (userRole !== UserRole.PROFESOR) {
        return { error: "No tiene permisos para esta acción." };
    }

    const courseId = params.id;
    if (!courseId) return { error: "Curso no especificado" };

    let form;
    try {
        if (request.headers.get("content-type")?.includes("application/json")) {
            form = await request.json();
        } else {
            form = await request.formData();
        }
    } catch (e) {
        return { error: "Error leyendo datos" };
    }

    const intent = form.intent || form.get?.("intent");

    try {
        if (intent === "save") {
            const marksJson = form.get("marks");
            const marks = typeof marksJson === "string" ? JSON.parse(marksJson) : marksJson;
            await saveMarks(request, courseId, marks);
            return { successMsg: "Calificaciones guardadas correctamente." };
        }

        if (intent === "publish") {
            await publishMarks(request, courseId);
            const teacherMarks = await listMarks(request, courseId);
            return {
                successMsg: "Calificaciones publicadas y notificadas a los estudiantes.",
                marks: teacherMarks
            };
        }

        if (intent === "import") {
            let fileContent = form.get("fileContent");
            // Elimina el prefijo si existe
            if (typeof fileContent === "string" && fileContent.includes(",")) {
                fileContent = fileContent.split(",")[1];
            }
            const fileName = form.get("fileName");
            const fileType = form.get("fileType");

            const formData = new FormData();
            const byteCharacters = atob(fileContent);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: fileType || "text/csv" });
            formData.append("file", blob, fileName);


            const response = await apiFetch(
                `/cursos/${courseId}/calificaciones-finales/importacion`,
                {
                    method: "POST",
                    body: formData,
                    jwtToken: await getValidJWTToken(request),
                    secure: true,
                }
            );

            if (!response.ok) {
                return { error: "Error importando el archivo CSV." };
            }

            return { successMsg: await response.text() };
        }

        return { error: "Intento desconocido" };
    } catch (e) {
        console.error("Action error:", e);
        return { error: "Error procesando la solicitud" };
    }
}

type LoaderData = {
    userRole: UserRole;
    studentMarks?: CalificacionFinalEstudianteResponse;
    teacherMarks?: MarksListResponse;
    estudiantes?: UsuarioListaResponse[]
};

export default function CourseMarksPage() {
    const { userRole, studentMarks, teacherMarks, estudiantes } = useLoaderData<LoaderData>();

    return (
        <div className="ombook-container">
            {userRole === UserRole.ESTUDIANTE ? (
                <StudentMarks mark={studentMarks} />
            ) : (
                <TeacherMarks
                    teacherMarks={teacherMarks ?? []}
                    estudiantes={estudiantes ?? []}
                />
            )}
        </div>
    );
}

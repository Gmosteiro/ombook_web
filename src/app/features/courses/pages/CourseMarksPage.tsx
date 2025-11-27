import { useLoaderData, LoaderFunctionArgs, ActionFunctionArgs, useOutletContext, useFetcher } from "react-router";
import { UserRole } from "~/features/auth/types";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import TeacherMarks from "../components/marks/TeacherMarks";
import StudentMarks from "../components/marks/StudentMarks";
//
import { getUserRole } from "~/services/session.server";
import { getMyMarks, listMarks, saveMarks, publishMarks } from "../../../routes/api.marks";
import { MarksListResponse, CalificacionFinalEstudianteResponse } from "../../../routes/api.marks";
import { getEstudiantesByCurso, UsuarioListaResponse } from "../../../routes/api.users.server";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";
import { Course, ImportMarksData } from "../types/types";

export async function loader({ request, params }: LoaderFunctionArgs) {
    requireRoleLoader([UserRole.PROFESOR, UserRole.ESTUDIANTE]);
    const userRole = await getUserRole(request);
    const courseId = params.id;

    if (userRole === UserRole.ESTUDIANTE && courseId) {
        const studentMarks = await getMyMarks(request, courseId);
        return { userRole, studentMarks };
    }
    if (userRole === UserRole.PROFESOR && courseId) {

        const teacherMarks = await listMarks(request, courseId);
        const estudiantes = await getEstudiantesByCurso(request, Number(courseId));

        return { userRole, teacherMarks, estudiantes };
    }
    return {};
}

export async function action({ request, params }: ActionFunctionArgs) {
    // Only professors may save/publish
    const userRole = await getUserRole(request);
    if (userRole !== UserRole.PROFESOR) {
        return { error: "No tiene permisos para esta acción." };
    }

    const courseId = params.id;
    if (!courseId) return { error: "Curso no especificado" };

    const form = await request.formData();
    const intent = form.get("intent");

    try {
        if (intent === "save") {
            const marksJson = form.get("marks");
            const marks = typeof marksJson === "string" ? JSON.parse(marksJson) : marksJson;
            await saveMarks(request, courseId, marks);
            return { successMsg: "Calificaciones guardadas correctamente." };
        }

        if (intent === "publish") {
            await publishMarks(request, courseId);
            // Obtener las calificaciones actualizadas después de publicar
            const teacherMarks = await listMarks(request, courseId);
            return {
                successMsg: "Calificaciones publicadas y notificadas a los estudiantes.",
                marks: teacherMarks
            };
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

type Ctx = { course: Course };


export default function CourseMarksPage() {
    const { userRole, studentMarks, teacherMarks, estudiantes } = useLoaderData<LoaderData>();
    const context = useOutletContext<Ctx>();
    const course = context?.course;
    const importFetcher = useFetcher<ImportMarksData>();


    if (!studentMarks && !teacherMarks) {
        return <div>No autorizado</div>;
    }

    const marksImport = createCsvImportHandler({
        allowedRoles: [UserRole.PROFESOR],
        backendEndpoint: `/cursos/${course.id}/calificaciones-finales/importacion`,
        successMessage: "Estudiantes Matriculados Correctamente",
    });


    const handleImportMarks = async (file: File) => {
        try {
            const { payload, action } = await marksImport(file);

            console.log('Import payload prepared:', payload, 'Action URL:', action);

            importFetcher.submit(payload, {
                method: "POST",
                action,
                encType: "application/json"
            });
        } catch (error) {
            console.error('Error preparing import:', error);
        }
    };


    return (
        <div className="ombook-container">
            {userRole === UserRole.ESTUDIANTE ? (
                <StudentMarks mark={studentMarks} />
            ) : (
                <TeacherMarks
                    teacherMarks={teacherMarks ?? []}
                    estudiantes={estudiantes ?? []}
                    handleImportMarks={handleImportMarks}
                />
            )}
        </div>
    );
}

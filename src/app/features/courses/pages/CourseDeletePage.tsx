import { ActionFunctionArgs, useFetcher } from "react-router";
import { getValidJWTToken } from "~/services/session.server";
import { UserRole } from "~/features/auth/types";
import EntityDelete from "../../common/components/EntityDelete";
import CourseSearchList from "../components/general/CourseSearchList";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { API_URL } from "../../common/utils/Utils";
import { DeleteCourseResponse } from "../types/types";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";

export const loader = requireRoleLoader([UserRole.ADMINISTRADOR]);

export async function action({ request }: ActionFunctionArgs): Promise<DeleteCourseResponse> {
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "deleteCourse") {
        const jwtToken = await getValidJWTToken(request);
        const courseId = formData.get("courseId") as string;
        return await deleteCourse(courseId, jwtToken);
    }

    return { success: false, error: "Intent no reconocido" };
}

const deleteCourse = async (courseId: string, jwtToken: string): Promise<DeleteCourseResponse> => {
    try {
        const response = await fetch(`${API_URL}/cursos/baja/${courseId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
                'Accept': 'application/json',
            },
        });

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

            return {
                success: false,
                error: `Error al eliminar curso: ${errorMessage}`
            };
        }

        return { success: true, message: "Curso eliminado exitosamente" };

    } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        return {
            success: false,
            error: "Error de conexión. Verifica tu conexión a internet e intenta nuevamente."
        };
    }
};

export default function CourseDeletePage() {
    const fetcher = useFetcher<DeleteCourseResponse>();

    const createCoursesDeleteHandler = createCsvImportHandler({
        allowedRoles: [UserRole.ADMINISTRADOR],
        backendEndpoint: "/cursos/eliminar/masivo",
        successMessage: "Cursos eliminados",
    });

    const handleDeleteCourse = (courseId: string) => {
        try {
            const formData = new FormData();
            formData.append("intent", "deleteCourse");
            formData.append("courseId", courseId);

            fetcher.submit(formData, { method: "POST" });
        } catch (error) {
            console.error("Error al eliminar curso:", error);
        }
    };

    const handleDeleteMasive = async (file: File) => {
        try {
            const { payload, action } = await createCoursesDeleteHandler(file);

            fetcher.submit(payload, {
                method: "POST",
                action,
                encType: "application/json"
            });
        } catch (error) {
            console.error('Error preparing delete:', error);
        }
    };

    const isLoading = fetcher.state === "submitting";
    const error = fetcher.data?.error;
    const success = fetcher.data?.success ? fetcher.data.message : undefined;

    return (
        <div className="max-w-3xl mx-auto">
            <EntityDelete
                entityName="Curso"
                title="Baja de Cursos"
                SearchList={CourseSearchList}
                deleteSingle={handleDeleteCourse}
                deleteMasive={handleDeleteMasive}
                bulk={{ accept: ".csv", templateUrl: "/plantillas/cursos-baja.csv" }}
                labels={{ submitBulk: "Eliminar Cursos" }}
                isLoading={isLoading}
                error={error}
                success={success}
            />
        </div>
    );
}
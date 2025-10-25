import { ActionFunctionArgs, useFetcher } from "react-router";
import { getValidJWTToken } from "~/services/session.server";
import { UserRole } from "~/features/auth/types";
import EntityCreate from "../../common/components/EntityCreate";
import CourseIndividualForm from "../components/CourseForm";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { API_URL } from "../../common/utils/Utils";
import { CreateCourseData, CreateCourseResponse, ImportCoursesResponse } from "../types/types";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";

export const loader = requireRoleLoader([UserRole.ADMINISTRADOR]);

export async function action({ request }: ActionFunctionArgs): Promise<CreateCourseResponse> {
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "createCourse") {
        const jwtToken = await getValidJWTToken(request);
        return await createCourse(formData, jwtToken);
    }

    return { success: false, error: "Intent no reconocido" };
}

const createCourse = async (formData: FormData, jwtToken: string): Promise<CreateCourseResponse> => {
    // Obtener profesores responsables del FormData
    const profesoresResponsablesString = formData.get("profesoresResponsables") as string;
    let profesoresResponsables = [];

    try {
        if (profesoresResponsablesString) {
            profesoresResponsables = JSON.parse(profesoresResponsablesString);
        }
    } catch (error) {
        console.error("Error parsing profesoresResponsables:", error);
    }

    const courseData: CreateCourseData = {
        nombre: formData.get("nombre") as string,
        codigo: formData.get("codigo") as string,
        descripcion: formData.get("descripcion") as string,
        periodoAcademico: formData.get("periodoAcademico") as string,
        profesoresResponsables: profesoresResponsables,
    };


    try {
        const response = await fetch(`${API_URL}/cursos/crear`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify(courseData),
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
                error: `Error al crear curso: ${errorMessage}`
            };
        }

        const createdCourse = await response.json();
        return {
            success: true,
            message: "Curso creado exitosamente",
            data: createdCourse
        };

    } catch (fetchError) {
        console.error('Fetch error:', fetchError);

        return {
            success: false,
            error: "Error de conexión. Verifica tu conexión a internet e intenta nuevamente."
        };
    }
};

export default function CourseCreatePage() {
    const fetcher = useFetcher<CreateCourseResponse>();
    const importFetcher = useFetcher<ImportCoursesResponse>();

    const createCoursesImportHandler = createCsvImportHandler({
        allowedRoles: [UserRole.ADMINISTRADOR],
        backendEndpoint: "/cursos/crear/masivo",
        successMessage: "Cursos importados",
    });

    const handleCreateCourse = (values: CreateCourseData) => {
        try {
            const formData = new FormData();
            formData.append("intent", "createCourse");

            // Agregar campos individuales
            formData.append("nombre", values.nombre);
            formData.append("codigo", values.codigo);
            formData.append("descripcion", values.descripcion);
            formData.append("periodoAcademico", values.periodoAcademico);

            // Agregar profesores responsables como JSON string
            if (values.profesoresResponsables && values.profesoresResponsables.length > 0) {
                formData.append("profesoresResponsables", JSON.stringify(values.profesoresResponsables));
            }

            console.log('Submitting course data:', values);

            fetcher.submit(formData, { method: "POST" });
        } catch (error) {
            console.error("Error al crear curso:", error);
        }
    };

    const handleImportCourses = async (file: File) => {
        try {
            const { payload, action } = await createCoursesImportHandler(file);

            importFetcher.submit(payload, {
                method: "POST",
                action,
                encType: "application/json"
            });
        } catch (error) {
            console.error('Error preparing import:', error);
        }
    };

    const isLoading = fetcher.state === "submitting" || importFetcher.state === "submitting";
    const error = fetcher.data?.error || importFetcher.data?.error;

    const success = (fetcher.data?.success ? fetcher.data.message : undefined) ||
        (importFetcher.data?.success ? importFetcher.data.message : undefined);

    return (
        <div className="max-w-3xl mx-auto">
            <EntityCreate
                entityName="Curso"
                title="Alta de Cursos"
                IndividualForm={CourseIndividualForm}
                addSingle={handleCreateCourse}
                addMasive={handleImportCourses}
                bulk={{ accept: ".csv", templateUrl: "/plantillas/cursos.csv" }}
                labels={{ submitBulk: "Importar Cursos" }}
                isLoading={isLoading}
                error={error}
                success={success}
            />
        </div>
    );
}
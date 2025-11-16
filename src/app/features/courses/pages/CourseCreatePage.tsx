import { useFetcher } from "react-router";
import { UserRole } from "~/features/auth/types";
import EntityCreate from "../../common/components/EntityCreate";
import CourseIndividualForm from "../components/general/CourseForm";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { CreateCourseData, ImportCoursesResponse } from "../types/types";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
    // Verificar roles primero
    await requireRoleLoader([UserRole.ADMINISTRADOR])({ request } as any);

    // Importación dinámica server-side para obtener profesores
    const { getProfesores } = await import("../../../routes/api.users");

    try {
        const profesores = await getProfesores(request);
        return { profesores };
    } catch (error) {
        console.error("Error al cargar profesores:", error);
        return { profesores: [] };
    }
}

export async function action({ request }: ActionFunctionArgs) {
    // Importación dinámica server-side
    const { crearCurso } = await import("../../../routes/api.courses");
    const data = await request.json();

    try {
        await crearCurso(request, data);
        return { success: true, message: "Curso creado exitosamente" };
    } catch (error: any) {
        console.error("Error al crear curso:", error);
        return {
            success: false,
            error: error?.message || "Error inesperado al crear el curso"
        };
    }
}

export default function CourseCreatePage() {
    const importFetcher = useFetcher<ImportCoursesResponse>();
    const createFetcher = useFetcher<{ success: boolean; message?: string; error?: string }>();

    const createCoursesImportHandler = createCsvImportHandler({
        allowedRoles: [UserRole.ADMINISTRADOR],
        backendEndpoint: "/cursos/crear/masivo",
        successMessage: "Cursos importados",
    });

    const handleCreateCourse = async (values: CreateCourseData) => {
        createFetcher.submit(values, {
            method: "POST",
            action: "/courses/create",
            encType: "application/json"
        });
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

    const finalError = createFetcher.data?.error || importFetcher.data?.error;
    const finalSuccess = createFetcher.data?.message || (importFetcher.data?.success ? importFetcher.data.message : undefined);

    // Determinar si hay errores de importación para mostrar diferente
    const hasImportErrors = importFetcher.data && !importFetcher.data.success && importFetcher.data.errorDetails;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Mostrar errores detallados de importación */}
            {hasImportErrors && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.485 3.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 3.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                {importFetcher.data?.message}
                            </h3>
                            {importFetcher.data?.errorDetails && importFetcher.data.errorDetails.length > 0 && (
                                <div className="mt-2">
                                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                                        <strong>Detalles de errores:</strong>
                                    </div>
                                    <ul className="mt-1 list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300">
                                        {importFetcher.data.errorDetails.map((error, index) => (
                                            <li key={index}>
                                                <strong>Línea {error.linea}:</strong> {error.motivo}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <EntityCreate
                entityName="Curso"
                title="Alta de Cursos"
                IndividualForm={CourseIndividualForm}
                addSingle={handleCreateCourse}
                addMasive={handleImportCourses}
                bulk={{ accept: ".csv", templateUrl: "/plantillas/cursos.csv" }}
                labels={{ submitBulk: "Importar Cursos" }}
                isLoading={createFetcher.state === "submitting" || importFetcher.state === "submitting"}
                error={!hasImportErrors ? finalError : undefined}
                success={finalSuccess}
            />
        </div>
    );
}
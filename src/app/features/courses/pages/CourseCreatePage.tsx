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
    const { getProfesores } = await import("../../../routes/api.users.server");

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
    const { crearCurso } = await import("../../../routes/api.courses.server");
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
        backendEndpoint: "/cursos/importaciones",
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

    const isLoading = createFetcher.state === "submitting" || importFetcher.state === "submitting";

    // Construir mensaje de error detallado (igual que en usuarios)
    let errorMessage = createFetcher.data?.error;

    if (importFetcher.data?.errorDetails && importFetcher.data.errorDetails.length > 0) {
        const detalles = importFetcher.data.errorDetails
            .map((e: any) => `Línea ${e.linea}: ${e.motivo}`)
            .join('\n');
        errorMessage = `${importFetcher.data.message}\n\nDetalles:\n${detalles}`;
    } else if (importFetcher.data?.error) {
        errorMessage = importFetcher.data.error;
    }

    const success = createFetcher.data?.message ||
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
                error={errorMessage}
                success={success}
            />
        </div>
    );
}
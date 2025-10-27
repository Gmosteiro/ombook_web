import { useFetcher } from "react-router";
import { UserRole } from "~/features/auth/types";
import EntityCreate from "../../common/components/EntityCreate";
import CourseIndividualForm from "../components/CourseForm";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { CreateCourseData, ImportCoursesResponse } from "../types/types";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";
import { useCoursesApi } from "../hooks/useCoursesApi";
import { useState } from "react";

export const loader = requireRoleLoader([UserRole.ADMINISTRADOR]);

export default function CourseCreatePage() {
    const importFetcher = useFetcher<ImportCoursesResponse>();
    const { createCourse, isLoading, error: apiError } = useCoursesApi();
    const [success, setSuccess] = useState<string | undefined>();
    const [error, setError] = useState<string | undefined>();

    const createCoursesImportHandler = createCsvImportHandler({
        allowedRoles: [UserRole.ADMINISTRADOR],
        backendEndpoint: "/cursos/crear/masivo",
        successMessage: "Cursos importados",
    });

    const handleCreateCourse = async (values: CreateCourseData) => {
        try {
            console.log('Creating course with data:', values);
            setError(undefined);
            setSuccess(undefined);

            const result = await createCourse(values);

            if (result) {
                setSuccess("Curso creado exitosamente");
                console.log('Course created successfully:', result);
            } else {
                setError(apiError || "Error al crear el curso");
            }
        } catch (error) {
            console.error("Error al crear curso:", error);
            setError("Error inesperado al crear el curso");
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

    const finalError = error || apiError || importFetcher.data?.error;
    const finalSuccess = success || (importFetcher.data?.success ? importFetcher.data.message : undefined);

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
                isLoading={isLoading || importFetcher.state === "submitting"}
                error={finalError}
                success={finalSuccess}
            />
        </div>
    );
}
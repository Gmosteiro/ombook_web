import { useFetcher } from "react-router";
import { UserRole } from "~/features/auth/types";
import EntityDelete from "../../common/components/EntityDelete";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { DeleteCourseResponse } from "../types/types";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";

export const loader = requireRoleLoader([UserRole.ADMINISTRADOR])

export default function CourseDeletePage() {
    const fetcher = useFetcher<DeleteCourseResponse>();

    const createCoursesDeleteHandler = createCsvImportHandler({
        allowedRoles: [UserRole.ADMINISTRADOR],
        backendEndpoint: "/cursos/eliminaciones",
        successMessage: "Cursos eliminados",
    });


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
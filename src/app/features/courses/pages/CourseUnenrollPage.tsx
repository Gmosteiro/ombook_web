import { ActionFunctionArgs, useOutletContext, useFetcher } from "react-router";
import { UserRole } from "~/features/auth/types";
import { EnrollUserResponse, EnrollMasivaUserData, Course } from "../types/types";
import EntityCreate from "../../common/components/EntityCreate";
import UnenrollIndividualForm from "../components/enroll/UnenrollIndividualForm";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import React, { useCallback } from "react";

export const loader = requireRoleLoader([UserRole.PROFESOR]);

export async function action({ request }: ActionFunctionArgs): Promise<EnrollUserResponse> {
    const { getUsuariosVinculadosByCurso } = await import("../../../routes/api.users.server");
    const { unenrollUser } = await import("../../../routes/api.matricula.server");

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "buscar") {
        const cursoId = Number(formData.get("cursoId"));
        const search = formData.get("search") as string;
        const paginator = await getUsuariosVinculadosByCurso(request, cursoId, { q: search });
        return { estudiantes: paginator.content ?? [] };
    }

    if (intent === "desmatricular") {
        const usuarioId = Number(formData.get("usuarioId"));
        const cursoId = Number(formData.get("cursoId"));
        const response = await unenrollUser(request, cursoId, usuarioId);

        if (response.ok) {
            return { success: true };
        } else {
            const errorData = await response.json();
            return { success: false, error: errorData.message || "Error al desmatricular usuario" };
        }
    }

    // El masivo ahora lo maneja el endpoint /csv/import vía el helper
    return { error: "Acción no reconocida" };
}

type Ctx = { course: Course };

export default function UserUnenrollPage() {
    const context = useOutletContext<Ctx>();
    const course = context?.course;
    const fetcher = useFetcher<EnrollUserResponse>();
    const importFetcher = useFetcher<EnrollMasivaUserData>();

    const unenrollUserImportHandler = createCsvImportHandler({
        allowedRoles: [UserRole.PROFESOR],
        backendEndpoint: `/cursos/${course.id}/matriculas/importaciones-baja`,
        successMessage: "Usuarios desmatriculados correctamente",
    });

    const handleUnenrollUser = useCallback(
        (data: { usuarioId: number }) => {
            if (!course?.id) return;
            const formData = new FormData();
            formData.append("usuarioId", data.usuarioId.toString());
            formData.append("cursoId", course.id.toString());
            formData.append("intent", "desmatricular");
            fetcher.submit(formData, { method: "POST" });
        },
        [course?.id, fetcher]
    );

    const handleImportUsers = useCallback(
        async (file: File) => {
            if (!course?.id) return;
            try {
                const { payload, action } = await unenrollUserImportHandler(file);
                importFetcher.submit(payload, {
                    method: "POST",
                    action,
                    encType: "application/json"
                });
            } catch (error) {
                console.error('Error preparando importación:', error);
            }
        },
        [course?.id, importFetcher, unenrollUserImportHandler]
    );

    const importResult: any = importFetcher.data;
    const isLoading = fetcher.state === "submitting";
    const error = importResult && !importResult.success ? "Error al desmatricular usuarios" : fetcher.data?.success === false ? "Error desmatriculando usuario" : "";
    const success = importResult && importResult.success ? "Usuario desmatriculado correctamente" : fetcher.data?.success ? "Usuario desmatriculado correctamente" : "";

    return (
        <div className="ombook-container">
            <EntityCreate
                entityName="Usuario"
                title="Desmatricular a un usuario"
                IndividualForm={React.useCallback(
                    props => <UnenrollIndividualForm {...props} cursoId={course?.id} />,
                    [course?.id]
                )}
                addSingle={handleUnenrollUser}
                addMasive={handleImportUsers}
                bulk={{ accept: ".csv", templateUrl: "/plantillas/matricular.csv" }}
                labels={{ submitBulk: "Desmatricular Usuarios" }}
                isLoading={isLoading}
                error={error}
                success={success}
            />
        </div>
    );
}
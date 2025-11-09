import { ActionFunctionArgs, useOutletContext, useFetcher } from "react-router";
import { UserRole } from "~/features/auth/types";
import { EnrollUserResponse, EnrollMasivaUserData, Course } from "../types/types";
import EntityCreate from "../../common/components/EntityCreate";
import UnenrollIndividualForm from "../components/enroll/UnenrollIndividualForm";
import { apiFetch } from "~/features/auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";

export const loader = requireRoleLoader([UserRole.PROFESOR]);

export async function action({ request }: ActionFunctionArgs): Promise<EnrollUserResponse> {
    const formData = await request.formData();
    const usuarioId = formData.get("usuarioId") as string;
    const cursoId = formData.get("cursoId") as string;

    const response = await apiFetch("/matricula/baja", {
        method: "POST",
        body: JSON.stringify({
            estudianteId: Number(usuarioId),
            cursoId: Number(cursoId)
        }),
        secure: true,
        jwtToken: await getValidJWTToken(request)
    })

    if (response.ok) {
        return { success: "true" };
    } else {
        const errorData = await response.json();
        console.log("Error un-enrolling user:", errorData);
        return { success: "false", error: errorData.message || "Error al desmatricular usuario" };
    }
}

type Ctx = { course: Course };

export default function UserEnrollPage() {
    const context = useOutletContext<Ctx>();
    const course = context?.course;
    const fetcher = useFetcher<EnrollUserResponse>();
    const importFetcher = useFetcher<EnrollMasivaUserData>();

    const unEnrollUserImportHandler = createCsvImportHandler({
        allowedRoles: [UserRole.PROFESOR],
        backendEndpoint: `/matricula/baja/masiva?cursoId=${course.id}`,
        successMessage: "Estudiantes Desmatriculados Correctamente",
    });

    const handleUnenrollUser = (data: { usuarioId: number }) => {
        if (!course?.id) return;

        const formData = new FormData();
        formData.append("usuarioId", data.usuarioId.toString());
        formData.append("cursoId", course.id.toString());

        fetcher.submit(formData, { method: "POST" });
    };

    const handleImportUsers = async (file: File) => {
        try {
            const { payload, action } = await unEnrollUserImportHandler(file);

            importFetcher.submit(payload, {
                method: "POST",
                action,
                encType: "application/json"
            });
        } catch (error) {
            console.error('Error preparing import:', error);
        }
    };
    const importResult: any = importFetcher.data;

    const isLoading = fetcher.state === "submitting";
    const error = importResult && !importResult.success ? importResult.error || "Error al desmatricular usuarios" : "";
    const success = importResult && importResult.success ? "Usuario desmatriculado correctamente" : "";

    return (
        <div className="max-w-3xl mx-auto">
            <EntityCreate
                entityName="Usuario"
                title="Desmatricular a un usuario"
                IndividualForm={UnenrollIndividualForm}
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
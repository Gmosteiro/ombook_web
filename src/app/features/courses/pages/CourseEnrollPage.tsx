import { ActionFunctionArgs, useOutletContext, useFetcher } from "react-router";
import { UserRole } from "~/features/auth/types";
import { EnrollUserResponse, EnrollMasivaUserData, Course } from "../types/types";
import EntityCreate from "../../common/components/EntityCreate";
import EnrollIndividualForm from "../components/EnrollIndividualForm";
import { apiFetch } from "~/features/auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";

export const loader = requireRoleLoader([UserRole.PROFESOR]);

export async function action({ request }: ActionFunctionArgs): Promise<EnrollUserResponse> {
    const formData = await request.formData();
    const usuarioId = formData.get("usuarioId") as string;
    const cursoId = formData.get("cursoId") as string;

    const response = await apiFetch("/matricula/alta", {
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
        console.log("Error enrolling user:", errorData);
        return { success: "false", error: errorData.message || "Error al matricular usuario" };
    }
}

type Ctx = { course: Course };

export default function UserEnrollPage() {
    const context = useOutletContext<Ctx>();
    const course = context?.course;
    const fetcher = useFetcher<EnrollUserResponse>();
    const importFetcher = useFetcher<EnrollMasivaUserData>();


    const enrollUserImportHandler = createCsvImportHandler({
        allowedRoles: [UserRole.PROFESOR],
        backendEndpoint: "/matricula/alta/masiva",
        successMessage: "Estudiantes Matriculados Correctamente",
    });

    const handleEnrollUser = (data: { usuarioId: number }) => {
        if (!course?.id) return;

        const formData = new FormData();
        formData.append("usuarioId", data.usuarioId.toString());
        formData.append("cursoId", course.id.toString());

        fetcher.submit(formData, { method: "POST" });
    };

    const handleImportUsers = async (file: File) => {
        try {
            const { payload, action } = await enrollUserImportHandler(file);

            importFetcher.submit(payload, {
                method: "POST",
                action,
                encType: "application/json"
            });
        } catch (error) {
            console.error('Error preparing import:', error);
        }
    };

    const isLoading = fetcher.state === "submitting";
    const error = fetcher.data?.error || "";
    const success = fetcher.data?.success === "true" ? "Usuario matriculado correctamente" : "";

    return (
        <div className="max-w-3xl mx-auto">
            <EntityCreate
                entityName="Usuario"
                title="Matricular a un usuario"
                IndividualForm={EnrollIndividualForm}
                addSingle={handleEnrollUser}
                addMasive={handleImportUsers}
                bulk={{ accept: ".csv", templateUrl: "/plantillas/matricular.csv" }}
                labels={{ submitBulk: "Matricular Usuarios" }}
                isLoading={isLoading}
                error={error}
                success={success}
            />
        </div>
    );
}
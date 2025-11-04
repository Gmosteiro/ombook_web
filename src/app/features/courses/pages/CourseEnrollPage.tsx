import { ActionFunctionArgs, } from "react-router";
import { UserRole } from "~/features/auth/types";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { EnrollUserResponse } from "../types/types";
import EntityCreate from "../../common/components/EntityCreate";
import EnrollIndividualForm from "../components/EnrollIndividualForm";
import { useOutletContext } from "react-router";
import { Course } from "../types/types";
import { useFetcher } from "react-router";
import { apiFetch } from "~/features/auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";

export const loader = requireRoleLoader([UserRole.PROFESOR]);

export async function action({ request }: ActionFunctionArgs): Promise<EnrollUserResponse> {
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "enrollUser") {

        const usuarioId = formData.get("usuarioId") as string;
        const cursoId = formData.get("cursoId") as string;
        console.log("Enroll user", { usuarioId, cursoId });
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

    return { success: "false", error: "Intent no reconocido" };
}

type Ctx = { course: Course };

export default function UserEnrollPage() {
    const context = useOutletContext<Ctx>();
    const course = context?.course;
    const fetcher = useFetcher<EnrollUserResponse>();

    const handleEnrollUser = (data: { usuarioId: number }) => {
        if (!course?.id) return;

        const formData = new FormData();
        formData.append("intent", "enrollUser");
        formData.append("usuarioId", data.usuarioId.toString());
        formData.append("cursoId", course.id.toString());

        fetcher.submit(formData, { method: "POST" });
    };

    const handleImportUsers = async (data: any) => {

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
import { ActionFunctionArgs, useOutletContext, useFetcher } from "react-router";
import { UserRole } from "~/features/auth/types";
import { EnrollUserResponse, EnrollMasivaUserData, Course } from "../types/types";
import EntityCreate from "../../common/components/EntityCreate";
import EnrollIndividualForm from "../components/enroll/EnrollIndividualForm";
import { apiFetch } from "~/features/auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { getEstudiantes } from "../../../routes/api.users";

export const loader = requireRoleLoader([UserRole.PROFESOR]);

export async function action({ request }: ActionFunctionArgs): Promise<EnrollUserResponse> {
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "buscar") {
        const search = formData.get("search") as string;
        const estudiantes = await getEstudiantes(request, { q: search });
        return { estudiantes };
    }

    if (intent === "matricular") {
        const usuarioId = formData.get("usuarioId");
        const cursoId = formData.get("cursoId") as string;

        console.log("Matriculando usuarioId:", usuarioId, "al cursoId:", cursoId);

        const response = await apiFetch("/matricula/alta", {
            method: "POST",
            body: JSON.stringify({
                estudianteId: Number(usuarioId),
                cursoId: Number(cursoId)
            }),
            secure: true,
            jwtToken: await getValidJWTToken(request)
        })


        console.log("Respuesta de la API de matriculación:", response);
        if (response.ok) {
            return { success: "true" };
        } else {
            const errorData = await response.json();
            console.log("Error enrolling user:", errorData);
            return { success: "false", error: errorData.message || "Error al matricular usuario" };
        }
    }

    return { error: "Acción no reconocida" };
}

type Ctx = { course: Course };

export default function UserEnrollPage() {
    const context = useOutletContext<Ctx>();
    const course = context?.course;
    const fetcher = useFetcher<EnrollUserResponse>();
    const importFetcher = useFetcher<EnrollMasivaUserData>();

    const enrollUserImportHandler = createCsvImportHandler({
        allowedRoles: [UserRole.PROFESOR],
        backendEndpoint: `/matricula/alta/masiva?cursoId=${course.id}`,
        successMessage: "Estudiantes Matriculados Correctamente",
    });

    const handleEnrollUser = (data: { usuarioId: number }) => {
        if (!course?.id) return;

        const formData = new FormData();
        formData.append("usuarioId", data.usuarioId.toString());
        formData.append("cursoId", course.id.toString());
        formData.append("intent", "matricular");

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
    const importResult: any = importFetcher.data;

    const isLoading = fetcher.state === "submitting";
    const error = importResult && !importResult.success ? importResult.error || "Error al matricular usuarios" : "";
    const success = importResult && importResult.success ? "Usuario matriculado correctamente" : "";

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
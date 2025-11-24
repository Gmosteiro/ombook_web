import { ActionFunctionArgs, useOutletContext, useFetcher } from "react-router";
import { UserRole } from "~/features/auth/types";
import { EnrollUserResponse, EnrollMasivaUserData, Course } from "../types/types";
import EntityCreate from "../../common/components/EntityCreate";
import EnrollIndividualForm from "../components/enroll/EnrollIndividualForm";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";

export const loader = requireRoleLoader([UserRole.PROFESOR]);

export async function action({ request }: ActionFunctionArgs): Promise<EnrollUserResponse> {
    const { getEstudiantes } = await import("../../../routes/api.users.server");
    const { enrollUser } = await import("../../../routes/api.matricula.server");

    const formData = await request.formData();
    const intent = formData.get("intent");

    if (intent === "buscar") {
        const search = formData.get("search") as string;
        const estudiantes = await getEstudiantes(request, { q: search });
        return { estudiantes };
    }

    if (intent === "matricular") {
        const usuarioId = Number(formData.get("usuarioId"));
        const cursoId = Number(formData.get("cursoId"));

        const response = await enrollUser(request, usuarioId, cursoId);

        if (response.ok) {
            return { success: true };
        } else {
            const errorData = await response.json();
            return { success: false, error: errorData.message || "Error al matricular usuario" };
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
    const error = importResult && !importResult.success ? "Error al matricular usuarios" : fetcher.data?.success === false ? "Error Matriculando Usuario" : "";
    const success = importResult && importResult.success ? "Usuario matriculado correctamente" : fetcher.data?.success ? "Usuario matriculado correctamente" : "";

    return (
        <div className="ombook-container">
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
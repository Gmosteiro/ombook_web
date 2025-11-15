import { ActionFunctionArgs, useOutletContext, useFetcher } from "react-router";
import { UserRole } from "~/features/auth/types";
import { EnrollUserResponse, EnrollMasivaUserData, Course } from "../types/types";
import EntityCreate from "../../common/components/EntityCreate";
import EnrollIndividualForm from "../components/enroll/EnrollIndividualForm";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { getEstudiantes } from "../../../routes/api.users";
import { enrollUser } from "../../../routes/api.matricula";

export const loader = requireRoleLoader([UserRole.PROFESOR]);

export async function action({ request }: ActionFunctionArgs): Promise<EnrollUserResponse> {
    const formData = await request.formData();
    const intent = formData.get("intent");
    console.log("Action intent:", intent);

    if (intent === "buscar") {
        const search = formData.get("search") as string;
        const estudiantes = await getEstudiantes(request, { q: search });
        return { estudiantes };
    }

    if (intent === "matricular") {
        const usuarioId = Number(formData.get("usuarioId"));
        const cursoId = Number(formData.get("cursoId"));

        const response = await enrollUser(request, usuarioId, cursoId);

        console.log("Enrollment response:", response);
        if (response.ok) {
            return { success: "true" };
        } else {
            const errorData = await response.json();
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
        console.log("Submitting enrollment for user:", data.usuarioId, "to course:", course.id);
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
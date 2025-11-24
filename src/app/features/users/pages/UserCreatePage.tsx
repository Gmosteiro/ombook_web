import { ActionFunctionArgs, useFetcher } from "react-router";
import { UserRole } from "~/features/auth/types";
import EntityCreate from "../../common/components/EntityCreate";
import UserIndividualForm from "../components/UserForm";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { CreateUserData, CreateUserResponse, ImportUsersResponse } from "../types";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";

export const loader = requireRoleLoader([UserRole.ADMINISTRADOR]);

export const meta = () => {
    return [{
        title: "Ombook | Alta de Usuarios",
    }]
}

export async function action({ request }: ActionFunctionArgs): Promise<CreateUserResponse> {
    const { crearUsuario } = await import("../../../routes/api.users.server");

    let data: any;
    let intent: string | undefined;

    if (request.headers.get("content-type")?.includes("application/json")) {
        data = await request.json();
        intent = data.intent;
    } else {
        const formData = await request.formData();
        intent = formData.get("intent") as string;
        data = Object.fromEntries(formData.entries());
    }

    if (intent === "createUser") {
        const rawCedula = data.cedula as string;
        const cedula = rawCedula.replace(/\D/g, "");

        const userData: CreateUserData = {
            nombre: data.nombre,
            apellido: data.apellido,
            correo: data.correo,
            cedula,
            fechaNacimiento: data.fechaNacimiento,
            rol: data.rol as UserRole,
        };

        try {
            await crearUsuario(request, {
                ...userData,
                rol: userData.rol as "ADMINISTRADOR" | "PROFESOR" | "ESTUDIANTE"
            });
            return { success: true, message: "Usuario creado exitosamente" };
        } catch (error: any) {
            return {
                success: false,
                error: error?.message || "Error al crear usuario"
            };
        }
    }

    return { success: false, error: "Intent no reconocido" };
}

export default function UserCreatePage() {
    const fetcher = useFetcher<CreateUserResponse>();
    const importFetcher = useFetcher<ImportUsersResponse>();

    const createUsersImportHandler = createCsvImportHandler({
        allowedRoles: [UserRole.ADMINISTRADOR],
        backendEndpoint: "/usuarios/importaciones-alta",
        successMessage: "Usuarios importados",
    });

    const handleCreateUser = (values: CreateUserData) => {
        try {
            fetcher.submit(
                JSON.stringify({
                    intent: "createUser",
                    ...values,
                }),
                {
                    method: "POST",
                    encType: "application/json",
                }
            );
        } catch (error) {
            console.error("Error al crear usuario:", error);
        }
    };

    const handleImportUsers = async (file: File) => {
        try {
            const { payload, action } = await createUsersImportHandler(file);

            importFetcher.submit(payload, {
                method: "POST",
                action,
                encType: "application/json"
            });
        } catch (error) {
            console.error('Error preparing import:', error);
        }
    };

    const isLoading = fetcher.state === "submitting" || importFetcher.state === "submitting";

    // Construir mensaje de error detallado
    let errorMessage = fetcher.data?.error;

    if (importFetcher.data?.errorDetails && importFetcher.data.errorDetails.length > 0) {
        const detalles = importFetcher.data.errorDetails
            .map((e: any) => `Línea ${e.linea}: ${e.motivo}`)
            .join('\n');
        errorMessage = `${importFetcher.data.message}\n\nDetalles:\n${detalles}`;
    } else if (importFetcher.data?.error) {
        errorMessage = importFetcher.data.error;
    }

    const success = fetcher.data?.success ? fetcher.data.message :
        (importFetcher.data?.success ? importFetcher.data.message : undefined);

    return (
        <div className="max-w-3xl mx-auto">
            <EntityCreate
                entityName="Usuario"
                title="Alta de Usuarios"
                IndividualForm={UserIndividualForm}
                addSingle={handleCreateUser}
                addMasive={handleImportUsers}
                bulk={{ accept: ".csv", templateUrl: "/plantillas/usuarios.csv" }}
                labels={{ submitBulk: "Importar Usuarios" }}
                isLoading={isLoading}
                error={errorMessage}
                success={success}
            />
        </div>
    );
}
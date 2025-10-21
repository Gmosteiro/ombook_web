import { ActionFunctionArgs, useFetcher } from "react-router";
import { getUserId, getUserRole, getValidJWTToken } from "~/services/session.server";
import { UserRole } from "~/features/auth/types";
import EntityCreate from "../../common/components/EntityCreate";
import UserIndividualForm from "../components/UserForm";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { API_URL } from "../../common/utils/Utils";
import { CreateUserData, CreateUserResponse, ImportUsersResponse } from "../types";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";

export const loader = requireRoleLoader([UserRole.ADMINISTRADOR]);

export async function action({ request }: ActionFunctionArgs): Promise<CreateUserResponse> {
    const userId = await getUserId(request);
    const userRole = await getUserRole(request);

    if (!userId || userRole !== UserRole.ADMINISTRADOR) {
        throw new Response("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "createUser") {
        const jwtToken = await getValidJWTToken(request);
        if (!jwtToken) {
            return {
                success: false,
                error: "Error de autenticación. Por favor, inicia sesión nuevamente."
            };
        }

        return await createUser(formData, jwtToken);
    }

    return { success: false, error: "Intent no reconocido" };
}

const createUser = async (formData: FormData, jwtToken: string): Promise<CreateUserResponse> => {
    const userData: CreateUserData = {
        nombre: formData.get("nombre") as string,
        apellido: formData.get("apellido") as string,
        correo: formData.get("correo") as string,
        contrasena: formData.get("contrasena") as string,
        cedula: formData.get("cedula") as string,
        fechaNacimiento: formData.get("fechaNacimiento") as string,
        rol: formData.get("rol") as UserRole,
    };

    try {
        const response = await fetch(`${API_URL}/usuarios/alta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}`,
                'Accept': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            try {
                const errorText = await response.text();
                if (errorText) {
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.message || errorJson.error || errorText;
                    } catch {
                        errorMessage = errorText;
                    }
                }
            } catch {
                // usar errorMessage por defecto
            }

            return {
                success: false,
                error: `Error al crear usuario: ${errorMessage}`
            };
        }

        return { success: true, message: "Usuario creado exitosamente" };

    } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        return {
            success: false,
            error: "Error de conexión. Verifica tu conexión a internet e intenta nuevamente."
        };
    }
};

export default function UserCreatePage() {
    const fetcher = useFetcher<CreateUserResponse>();
    const importFetcher = useFetcher<ImportUsersResponse>();

    // Crear handler específico para usuarios
    const createUsersImportHandler = createCsvImportHandler({
        allowedRoles: [UserRole.ADMINISTRADOR],
        backendEndpoint: "/usuarios/alta/masiva",
        fileFormKey: "csvFile",
        successMessage: "Usuarios importados",
    });

    const handleCreateUser = (values: CreateUserData) => {
        try {
            const formData = new FormData();
            formData.append("intent", "createUser");
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value);
            });

            fetcher.submit(formData, { method: "POST" });
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

    // Combinar estados
    const isLoading = fetcher.state === "submitting" || importFetcher.state === "submitting";
    const error = fetcher.data?.error || importFetcher.data?.error;
    const success = (fetcher.data?.success ? fetcher.data.message : undefined) ||
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
                error={error}
                success={success}
            />
        </div>
    );
}
import { ActionFunctionArgs, useFetcher } from "react-router";
import { UserRole } from "~/features/auth/types";
import EntityCreate from "../../common/components/EntityCreate";
import UserIndividualForm from "../components/UserForm";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";
import { CreateUserData, CreateUserResponse, ImportUsersResponse } from "../types";
import { createCsvImportHandler } from "../../common/utils/csvImportHelper";
import { crearUsuario } from "../../../routes/api.users";

export const loader = requireRoleLoader([UserRole.ADMINISTRADOR]);

export async function action({ request }: ActionFunctionArgs): Promise<CreateUserResponse> {
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
        const cedula = rawCedula.replace(/\D/g, ""); // Elimina todo lo que no sea número

        const userData: CreateUserData = {
            nombre: data.nombre,
            apellido: data.apellido,
            correo: data.correo,
            contrasena: data.contrasena,
            cedula, // Usa la cédula limpia
            fechaNacimiento: data.fechaNacimiento,
            rol: data.rol,
        };

        try {
            await crearUsuario(request, userData);
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
        backendEndpoint: "/usuarios/alta/masiva",
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
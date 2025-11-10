import { ActionFunctionArgs, useFetcher } from "react-router";
import { UserRole } from "~/features/auth/types";
import EntityDelete from "../../common/components/EntityDelete";
import { requireRoleLoader } from "../../auth/components/requireRoleLoader";

export const loader = requireRoleLoader([UserRole.ADMINISTRADOR]);

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
        throw new Error("No file provided");
    }

    const deleteFormData = new FormData();
    deleteFormData.append('file', file);

    const response = await fetch('http://localhost:3001/api/users/bulk-delete', {
        method: 'POST',
        headers: {
            'Cookie': request.headers.get('Cookie') || '',
        },
        body: deleteFormData,
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to bulk delete users: ${error}`);
    }

    return { success: true, message: "Usuarios eliminados exitosamente" };
}

export default function UsersDeletePage() {
    const fetcher = useFetcher();

    const handleBulkDelete = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        fetcher.submit(formData, { method: "POST" });
    };

    return (
        <div className="max-w-3xl mx-auto">
            <EntityDelete
                entityName="Usuario"
                deleteMasive={handleBulkDelete}
                bulk={{ accept: ".csv", templateUrl: "/plantillas/usuarios-delete.csv" }}
                isLoading={fetcher.state === "submitting"}
                error={fetcher.data?.error}
                success={fetcher.data?.success ? fetcher.data.message : undefined}
            />
        </div>
    );
}
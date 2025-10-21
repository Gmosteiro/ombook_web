import { UserRole } from "~/features/auth/types";

export type CsvImportConfig = {
    allowedRoles: UserRole[];
    backendEndpoint: string;
    fileFormKey?: string;
    successMessage?: string;
};

// Función para convertir File a base64
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Remover el prefijo "data:type/subtype;base64,"
            const base64 = result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
}

export function createCsvImportHandler(config: CsvImportConfig) {
    const {
        allowedRoles,
        backendEndpoint,
        successMessage = 'Archivo procesado exitosamente',
    } = config;

    return async (file: File) => {
        console.log('📤 Converting file to base64:', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
        });

        try {
            // Convertir archivo a base64
            const base64Content = await fileToBase64(file);

            console.log('✅ File converted to base64, length:', base64Content.length);

            // *** ENVIAR COMO JSON EN LUGAR DE FORMDATA ***
            const jsonPayload = {
                allowedRoles,
                backendEndpoint,
                successMessage,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                fileContent: base64Content
            };

            console.log('📤 JSON payload prepared');

            return {
                payload: JSON.stringify(jsonPayload),
                action: "/csv/import"
            };

        } catch (error) {
            console.error("Error converting file to base64:", error);
            throw error;
        }
    };
}

/*
Example:


// Para cualquier otra importación CSV
const importHandler = createCsvImportHandler({
    allowedRoles: [UserRole.ADMINISTRADOR, UserRole.PROFESOR],
    backendEndpoint: "/cursos/importar",
    successMessage: "Cursos importados"
});

const handleImport = async (file: File) => {
    const { payload, action } = await importHandler(file);
    fetcher.submit(payload, { 
        method: "POST", 
        action,
        encType: "application/json" 
    });
};


*/
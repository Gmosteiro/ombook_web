export const importUsersCsv = async (file: File): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Imported users from CSV file:", file.name);
            resolve();
        }, 1500);
    });
}


export const createUser = async (userData: { nombre: string; email: string; password: string }): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Created user:", userData);
            resolve();
        }, 1000);
    });
};
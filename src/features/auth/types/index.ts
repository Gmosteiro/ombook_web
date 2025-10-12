export interface User {
    id: number;
    email: string;
    name: string;
    // Agregar más campos según tu API
}

export interface LoginResponse {
    user: User;
    tokenAcceso: string;
    message?: string;
}

export interface ApiError {
    message: string;
    statusCode?: number;
}
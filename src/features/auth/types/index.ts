export interface User {
    id: number;
    email: string;
    name: string;
    // Agregar más campos según tu API
}

export interface LoginResponse {
    token: string;
    exp?: number; // expiration timestamp (ms)
    rol?: string;
}

export interface ApiError {
    message: string;
    statusCode?: number;
}

export interface LoginDTO {
    correo: string;
    contrasena: string;
    infoCliente: {
        origen: string;
        ip?: string;
        cliente?: string;
    };
}
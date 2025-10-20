import type { operations, components } from '../../../../types/openapi';


const enum UserRole {
    ADMINISTRADOR = "ADMINISTRADOR",
    PROFESOR = "PROFESOR",
    ESTUDIANTE = "ESTUDIANTE"
}

export type claims = {
    rol: UserRole;
    orige: string;
}
export interface User {
    id?: number;
    email: string;
    name?: string;
    rol: UserRole;
    // Agregar más campos según tu API
}

// Schemas
export type InfoCliente = components['schemas']['InfoCliente'];
export type TokenResponse = components['schemas']['TokenResponse'];
export type CerrarSesionRequest = components['schemas']['CerrarSesionRequest'];

// Operaciones: Login
export type LoginRequest = operations['login']['requestBody']['content']['application/json'];
export type LoginOK = operations['login']['responses'][200]['content']['*/*'];
export type LoginHeaders = operations['login']['parameters']['header'];

// Operaciones: Cerrar sesión
export type CerrarSesionOK = operations['cerrarSesion']['responses'][200]['content']['*/*'];
export type CerrarSesionHeaders = operations['cerrarSesion']['parameters']['header'];

// Mantén el nombre que ya usabas, pero alineado al schema generado
export type LoginResponse = TokenResponse;

export interface ApiError {
    message: string;
    statusCode?: number;
}


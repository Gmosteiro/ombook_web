import type { operations, components } from '../../../../types/openapi';

export const enum UserRole {
    ADMINISTRADOR = "ADMINISTRADOR",
    PROFESOR = "PROFESOR",
    ESTUDIANTE = "ESTUDIANTE"
}

export const enum UserStatus {
    ACTIVO = "ACTIVO",
    INACTIVO = "INACTIVO",
    BLOQUEADO = "BLOQUEADO"
}

export type claims = {
    rol: UserRole;
    orige: string;
}
export interface User {
    id?: number;
    nombre: string;
    apellido: string;
    correo: string;
    cedula: string;
    fechaNacimiento: string;
    rol: UserRole;
    createdAt?: string;
    updatedAt?: string;
}

// Schemas
// export type InfoCliente = components['schemas']['InfoCliente'];
export type TokenResponse = components['schemas']['TokenResponse'];
// export type CerrarSesionRequest = components['schemas']['CerrarSesionRequest'];

// Operaciones: Login
export type LoginRequest = operations['login']['requestBody']['content']['application/json'];
export type LoginOK = operations['login']['responses'][200]['content']['*/*'];
export type LoginHeaders = operations['login']['parameters']['header'];

// Operaciones: Cerrar sesión
export type CerrarSesionOK = operations['cerrarSesion']['responses'][200]['content']['*/*'];
export type CerrarSesionHeaders = operations['cerrarSesion']['parameters']['header'];
export type CerrarSesionRequest = {
    token: string;
};

// Mantén el nombre que ya usabas, pero alineado al schema generado
export type LoginResponse = TokenResponse;

// Tipos para recuperación de contraseña
export interface RecuperacionContrasenaRequest {
    correo: string;
}

export interface RecuperacionContrasenaResponse {
    mensaje: string;
}

export interface VerificarTokenResponse {
    valido: boolean;
}

export interface RestablecerContrasenaRequest {
    token: string;
    nuevaContrasena: string;
    confirmarContrasena: string;
}

export interface RestablecerContrasenaResponse {
    mensaje: string;
}

export interface ErrorResponse {
    error: string;
}

export interface ApiError {
    message: string;
    statusCode?: number;
}


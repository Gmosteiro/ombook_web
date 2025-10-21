import type { operations, components } from '../../../../types/openapi';
import { UserRole } from '../../auth/types';

// Schemas de usuarios
export type AltaUsuarioRequest = components['schemas']['AltaUsuarioRequest'];
export type ResumenCargaMasiva = components['schemas']['ResumenCargaMasiva'];
export type ErrorLineaCSV = components['schemas']['ErrorLineaCSV'];

// Operaciones: Alta Individual
export type AltaIndividualRequest = operations['altaIndividual']['requestBody']['content']['application/json'];
export type AltaIndividualResponse = operations['altaIndividual']['responses'][200]['content']['*/*'];

// Operaciones: Carga Masiva
export type CargaMasivaRequest =
    operations['cargaMasiva']['requestBody'] extends { content: { 'application/json': infer T } }
    ? T
    : never;
export type CargaMasivaResponse = operations['cargaMasiva']['responses'][200]['content']['*/*'];

// Tipos para el formulario (alineados con AltaUsuarioRequest)
export type UserFormValues = {
    nombre: string;
    apellido: string;
    correo: string;
    contrasena: string;
    cedula: string;
    fechaNacimiento: string;
    rol: UserRole;
    confirmarContrasena: string; // Campo adicional solo para el formulario
};

// Tipo para crear usuario (igual que AltaUsuarioRequest pero con UserRole tipado)
export type CreateUserData = {
    nombre: string;
    apellido: string;
    correo: string;
    contrasena: string;
    cedula: string;
    fechaNacimiento: string;
    rol: UserRole;
};

// Tipos para respuestas de la API
export type CreateUserResponse = {
    success: boolean;
    message?: string;
    error?: string;
    data?: any;
};

export type ImportUsersResponse = {
    success: boolean;
    message?: string;
    error?: string;
    data?: {
        correctos: number;
        errores: number;
    };
};

// Tipos para validación
export type UserFormErrors = {
    [K in keyof UserFormValues]?: string;
};

// Tipos para las funciones helper
export type CreateUserFunction = (data: CreateUserData) => Promise<CreateUserResponse>;
export type ImportUsersFunction = (file: File) => Promise<ImportUsersResponse>;

// Interfaz para el usuario completo (si necesitas extender)
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

// Tipos para filtros y búsquedas (para futuras funcionalidades)
export type UserFilters = {
    rol?: UserRole;
    nombre?: string;
    correo?: string;
};

export type UserListResponse = {
    users: User[];
    total: number;
    page: number;
    pageSize: number;
};
import { apiFetch } from "../../auth/utils/methods";
import { ProfesorResponsable, UsuarioListadoResponse, Usuario } from "../types";

export const loadProfesores = async (jwtToken: string): Promise<ProfesorResponsable[]> => {
    try {
        const response = await apiFetch("/usuarios/profesores", {
            method: 'GET',
            secure: true,
            jwtToken: jwtToken,
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: ProfesorResponsable[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error loading profesores:", error);
        throw error;
    }
};

export const loadUsuarios = async (jwtToken: string): Promise<UsuarioListadoResponse[]> => {
    try {
        const response = await apiFetch("/usuarios/listar", {
            method: 'GET',
            secure: true,
            jwtToken: jwtToken,
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: UsuarioListadoResponse[] = await response.json();
        return data;
    } catch (error) {
        console.error("Error loading usuarios:", error);
        throw error;
    }
};

export const loadUsuarioById = async (id: number, jwtToken: string): Promise<Usuario> => {
    try {
        const response = await apiFetch(`/usuarios/${id}`, {
            method: 'GET',
            secure: true,
            jwtToken: jwtToken,
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const data: Usuario = await response.json();
        return data;
    } catch (error) {
        console.error("Error loading usuario:", error);
        throw error;
    }
};

/**
 * Formats a Uruguayan ID (cédula) by automatically adding dots and dash
 * @param value - String with ID digits
 * @returns Formatted string (e.g., "1.234.567-8")
 */
export const formatCedula = (value: string): string => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');

    // Limit to a maximum of 8 digits
    const limitedDigits = digits.slice(0, 8);

    // Format according to length
    if (limitedDigits.length <= 1) {
        return limitedDigits;
    } else if (limitedDigits.length <= 4) {
        return `${limitedDigits.slice(0, 1)}.${limitedDigits.slice(1)}`;
    } else if (limitedDigits.length <= 7) {
        return `${limitedDigits.slice(0, 1)}.${limitedDigits.slice(1, 4)}.${limitedDigits.slice(4)}`;
    } else {
        return `${limitedDigits.slice(0, 1)}.${limitedDigits.slice(1, 4)}.${limitedDigits.slice(4, 7)}-${limitedDigits.slice(7)}`;
    }
};

/**
 * Validates a Uruguayan ID (cédula) using the official algorithm
 * @param cedula - String with the ID, formatted or unformatted
 * @returns boolean - true if the ID is valid
 */
export const validateCedula = (cedula: string): boolean => {
    // Remove dots and dashes
    const digits = cedula.replace(/[.-]/g, '');

    // Must have exactly 8 digits
    if (digits.length !== 8 || !/^\d+$/.test(digits)) {
        return false;
    }

    // Uruguayan ID validation algorithm
    const digitos = digits.split('').map(Number);
    const multiplicadores = [2, 9, 8, 7, 6, 3, 4];

    let suma = 0;
    for (let i = 0; i < 7; i++) {
        suma += digitos[i] * multiplicadores[i];
    }

    const resto = suma % 10;
    const digitoVerificador = resto === 0 ? 0 : 10 - resto;

    return digitoVerificador === digitos[7];
};
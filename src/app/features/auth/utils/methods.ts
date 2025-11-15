import { API_URL } from "../../common/utils/Utils";

interface BaseApiFetchOptions {
    extraHeaders?: Record<string, string>;
    body?: {};
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

interface SecureApiFetchOptions extends BaseApiFetchOptions {
    secure: true;
    jwtToken: string;
}

interface InsecureApiFetchOptions extends BaseApiFetchOptions {
    secure?: false;
    jwtToken?: string;
}

type ApiFetchOptions = SecureApiFetchOptions | InsecureApiFetchOptions;

export const apiFetch = async (
    endpoint: string,
    options: ApiFetchOptions
): Promise<Response> => {
    try {
        const {
            extraHeaders = {},
            body,
            method,
            jwtToken,
            secure = true,
        } = options;

        if (!endpoint.startsWith("/")) {
            if (endpoint.length === 0) {
                throw new Error("Endpoint cannot be an empty string");
            }
            endpoint = `/${endpoint}`;
        }

        // Solo agrega Content-Type si el body NO es FormData
        const headers: Record<string, string> = {
            'Accept': 'application/json',
            ...extraHeaders,
        };

        if (body && !(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (secure) {
            headers['Authorization'] = `Bearer ${jwtToken}`;
        }

        return await fetch(`${API_URL}${endpoint}`, {
            method,
            headers,
            body: method === 'GET' || method === 'DELETE'
                ? undefined
                : body instanceof FormData
                    ? body
                    : typeof body === 'string'
                        ? body
                        : JSON.stringify(body),
        });
    } catch (error) {
        console.error("API Fetch Error:", error);
        throw error;
    }
};

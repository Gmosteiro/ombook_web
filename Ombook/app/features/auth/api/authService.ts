export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user?: any; // You can define a proper User interface later
}

// Custom error class for better error handling
export class AuthError extends Error {
    status?: number;

    constructor({ message, status }: { message: string; status?: number }) {
        super(message);
        this.name = 'AuthError';
        this.status = status;
    }
}

export class AuthService {
    private static readonly BASE_URL = 'http://localhost:8080/api/auth';

    static async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            const response = await fetch(`${this.BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new AuthError({
                    message: errorText || 'Login failed',
                    status: response.status,
                });
            }

            const data = await response.json();
            return data;
        } catch (error) {
            if (error instanceof AuthError) {
                throw error;
            }
            throw new AuthError({
                message: 'Network error or server unavailable',
            });
        }
    }

    static async validateToken(token: string): Promise<boolean> {
        try {
            const response = await fetch(`${this.BASE_URL}/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            return response.ok;
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    }

    static saveToken(token: string): void {
        localStorage.setItem('token', token);
    }

    static getToken(): string | null {
        return localStorage.getItem('token');
    }

    static removeToken(): void {
        localStorage.removeItem('token');
    }

    static isAuthenticated(): boolean {
        return !!this.getToken();
    }
}
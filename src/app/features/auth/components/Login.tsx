import { useState } from "react";
import { Form, redirect, Link, type MetaFunction } from "react-router";
import { Route } from "../../../../.react-router/types/app/features/auth/components/+types/Login";
import { API_URL } from "../../common/utils/Utils";
import { LoginRequest, LoginResponse, UserRole } from "../../auth/types";

export const meta: MetaFunction = () => {
    return [
        { title: "Ombook | Iniciar Sesion" }
    ];
};

export async function loader({ request }: Route.LoaderArgs) {
    const { getUserId } = await import("~/services/session.server");
    const userId = await getUserId(request);
    if (userId) {
        return redirect("/");
    }
    return new Response(
        JSON.stringify(null),
        {
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store, no-cache, must-revalidate",
                "Pragma": "no-cache",
            },
        }
    );
};

export async function action({ request }: Route.ActionArgs) {
    let response: Response;
    try {
        const formData = await request.formData();
        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();

        if (!email || !password) {
            throw new Error("Email and password are required");
        }

        const reqBody: LoginRequest = {
            correo: email,
            contrasena: password,
        };

        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            body: JSON.stringify(reqBody),
            headers: { "Content-Type": "application/json" }
        });


        if (!res.ok) {
            const errorMessage = await res.text();
            throw new Error(errorMessage || "Credenciales inválidas");
        }

        const data: LoginResponse = await res.json();

        let rol = data.contrasenaInicialCambiada === false ? UserRole.SIN_VERIFICAR : data.rol as UserRole;

        // Guardar tokens, rol y exp en la sesión
        const { createUserSession } = await import("~/services/session.server");
        response = await createUserSession({
            request,
            remember: true,
            extraSessionData: {
                token: data.accessToken || "",
                refreshToken: data.refreshToken || "",
                rol: rol,
                exp: data.accessTokenExp || 0,
            },
        });

        if (!response) {
            throw new Error("An error occurred while creating the session");
        }
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message };
        }

        return { error: "An unknown error occurred" };
    }

    throw response;
};

// Permite que actionData sea opcional para facilitar los tests
type LoginProps = { actionData?: { error?: string } };

export default function Login({ actionData }: LoginProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    let error = actionData?.error;
    if (typeof error === "string") {
        try {
            const parsed = JSON.parse(error);
            error = parsed.message || error;
        } catch { }
    }

    return (
        <div className="min-h-screen flex items-center justify-center ombook-bg-light font-sans">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 ombook-card">
                <div className="px-2 pt-2 pb-6">
                    <h1 className="ombook-heading ombook-heading-xl ombook-text-green mb-2">Iniciar Sesión</h1>
                    <p className="ombook-text-gray">Bienvenido de nuevo a tu cuenta.</p>
                </div>
                <Form method="post" className="space-y-6 px-2">
                    {error && <div className="ombook-alert ombook-alert-info text-sm mb-4">{error}</div>}
                    <div className="space-y-2">
                        <label htmlFor="email" className="ombook-label">Correo electrónico</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="ombook-input h-12"
                            placeholder="tucorreo@ejemplo.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="ombook-label">Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="ombook-input h-12"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full ombook-btn ombook-btn-primary h-12 text-base font-bold tracking-wide shadow-lg"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                    <div className="text-center">
                        <Link to="/forgot-password" className="ombook-link text-sm font-medium">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};
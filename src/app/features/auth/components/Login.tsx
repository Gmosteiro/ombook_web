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
    console.log("[Login loader] userId:", userId);
    if (userId) {
        console.log("[Login loader] Redirecting to /");
        return redirect("/");
    }
    return null;
};

export async function action({ request }: Route.ActionArgs) {
    let response: Response;
    try {
        const formData = await request.formData();
        const email = formData.get("email")?.toString();
        const password = formData.get("password")?.toString();

        console.log("[Login action] email:", email);

        if (!email || !password) {
            console.log("[Login action] Missing email or password");
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

        console.log("[Login action] API response status:", res.status);

        if (!res.ok) {
            const errorMessage = await res.text();
            console.log("[Login action] Error response:", errorMessage);
            throw new Error(errorMessage || "Credenciales inválidas");
        }

        const data: LoginResponse = await res.json();
        console.log("[Login action] LoginResponse data:", data);

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

        console.log("[Login action] Session created, response:", response);

        if (!response) {
            console.log("[Login action] Failed to create session");
            throw new Error("An error occurred while creating the session");
        }
    } catch (error) {
        if (error instanceof Error) {
            console.log("[Login action] Caught error:", error.message);
            return { error: error.message };
        }

        console.log("[Login action] Unknown error");
        return { error: "An unknown error occurred" };
    }

    console.log("[Login action] Throwing response for redirect");
    throw response;
};

export default function Login({ actionData }: Route.ComponentProps) {
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
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark font-display">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8">
                <div className="px-2 pt-2 pb-6">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Iniciar Sesión</h1>
                    <p className="text-slate-600 dark:text-slate-400">Bienvenido de nuevo a tu cuenta.</p>
                </div>
                <Form method="post" className="space-y-6 px-2">
                    {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Correo electrónico</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-input w-full rounded-lg border-0 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary h-14 p-4 text-base"
                            placeholder="tucorreo@ejemplo.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="form-input w-full rounded-lg border-0 bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-primary h-14 p-4 text-base"
                            placeholder="Ingresa tu contraseña"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full h-14 rounded-lg bg-[#137fec] text-white text-base font-bold tracking-wide shadow-lg hover:bg-[#0e6ad1] transition-colors focus:outline-none focus:ring-2 focus:ring-[#137fec]"
                        >
                            Iniciar Sesión
                        </button>
                    </div>
                    <div className="text-center">
                        <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </Form>
            </div>
        </div>
    );
};
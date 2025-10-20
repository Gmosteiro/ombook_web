import { useState } from "react";
import { Form } from "react-router";

export default function Login({ actionData }: { actionData?: { error?: string } }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark font-display">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg p-8">
                <div className="px-2 pt-2 pb-6">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Iniciar Sesión</h1>
                    <p className="text-slate-600 dark:text-slate-400">Bienvenido de nuevo a tu cuenta.</p>
                </div>
                <Form method="post" className="space-y-6 px-2">
                    {actionData?.error && <div className="text-red-500 text-sm mb-4">{actionData.error}</div>}
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
                        <a href="#" className="text-sm font-medium text-primary hover:underline">¿Olvidaste tu contraseña?</a>
                    </div>
                </Form>
            </div>
        </div>
    );
}
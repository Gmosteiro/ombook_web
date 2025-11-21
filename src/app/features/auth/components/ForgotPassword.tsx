import { useState } from 'react';
import { Link, Form, useActionData, useNavigation } from 'react-router';

export async function action({ request }: { request: Request }) {
    const { solicitarRecuperacionContrasena } = await import('~/routes/api.auth.server');

    const formData = await request.formData();
    const correo = formData.get('correo') as string;
    try {
        const data = await solicitarRecuperacionContrasena(correo);
        return {
            success: true,
            mensaje: data.mensaje || 'Se envió un enlace de recuperación al correo.',
            correo,
        };
    } catch (error: any) {
        return {
            error: error.message || 'Ocurrió un error al procesar la solicitud.',
        };
    }
}

export function meta() {
    return [{ title: 'Ombook | Recuperar Contraseña' }];
}

export default function ForgotPassword() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();

    const [email, setEmail] = useState('');
    const [showSuccessScreen, setShowSuccessScreen] = useState(false);

    const isSubmitting = navigation.state === 'submitting';

    // Mostrar pantalla de éxito cuando actionData.success es true
    const submitted = actionData?.success && showSuccessScreen;

    // Detectar cuando hay éxito para mostrar pantalla de confirmación
    if (actionData?.success && !showSuccessScreen) {
        setShowSuccessScreen(true);
    }

    return (
        <div className="max-w-md mx-auto mt-8 p-8 border border-gray-200 rounded-lg bg-white shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Recuperar contraseña</h2>
            <p className="text-gray-600 mb-6">
                Ingrese su correo electrónico y le enviaremos un enlace para restablecer su contraseña.
            </p>

            {!submitted ? (
                <Form method="post" className="space-y-4">
                    <div>
                        <label className="block mb-2 text-gray-700 font-medium">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            name="correo"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
                            placeholder="correo@ejemplo.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    {actionData?.error && (
                        <div className="p-3 rounded-lg bg-red-100 text-red-700 border border-red-300">
                            {actionData.error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Enviando...' : 'Enviar enlace de recuperación'}
                    </button>
                </Form>
            ) : (
                <div className="space-y-4">
                    <div className="bg-green-100 text-green-700 p-4 rounded-lg border border-green-300">
                        <p className="font-medium mb-2">✓ Correo enviado</p>
                        <p className="text-sm">
                            Se ha enviado un enlace de recuperación a <strong>{actionData.correo}</strong>.
                            Por favor, revise su bandeja de entrada y siga las instrucciones.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setShowSuccessScreen(false);
                            setEmail('');
                        }}
                        className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition"
                    >
                        Enviar a otro correo
                    </button>
                </div>
            )}

            <div className="mt-6 text-center">
                <Link to="/login" className="text-blue-500 hover:text-blue-600 text-sm">
                    ← Volver al inicio de sesión
                </Link>
            </div>
        </div>
    );
}

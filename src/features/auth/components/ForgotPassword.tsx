import React, { useState } from 'react';

const ForgotPassword: React.FC = () => {
    const [method, setMethod] = useState<'username' | 'email'>('username');
    const [input, setInput] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        // Aquí iría la lógica para enviar la solicitud de recuperación
    };

    return (
        <div className="max-w-md mx-auto mt-8 p-8 border border-gray-200 rounded-lg bg-white shadow">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Olvidé mi contraseña</h2>
            <p className="text-gray-600 mb-6">
                Para reajustar su contraseña, elija cómo desea recuperar el acceso:
            </p>
            <div className="flex mb-4">
                <button
                    type="button"
                    className={`flex-1 py-2 rounded-l-lg border border-gray-300 ${method === 'username' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setMethod('username')}
                >
                    Nombre de usuario
                </button>
                <button
                    type="button"
                    className={`flex-1 py-2 rounded-r-lg border border-gray-300 ${method === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => setMethod('email')}
                >
                    Correo electrónico
                </button>
            </div>
            <form onSubmit={handleSubmit}>
                <label className="block mb-2 text-gray-700 font-medium">
                    {method === 'username' ? 'Nombre de usuario' : 'Correo electrónico'}
                </label>
                <input
                    type={method === 'email' ? 'email' : 'text'}
                    className="w-full px-4 py-2 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900 bg-white"
                    placeholder={method === 'username' ? 'Ingrese su nombre de usuario' : 'Ingrese su correo electrónico'}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    required
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                >
                    Recuperar contraseña
                </button>
            </form>
            {submitted && (
                <div className="mt-4 text-green-600">
                    Si podemos encontrarlo en la base de datos, le enviaremos un email con instrucciones para poder acceder de nuevo.
                </div>
            )}
        </div>
    );
};

export default ForgotPassword;

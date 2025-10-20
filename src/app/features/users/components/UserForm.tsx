import React from "react";
import type { IndividualFormProps } from "../../common/components/EntityCreate";

type UserFormValues = { nombre: string; email: string; password: string };

const UserIndividualForm: React.FC<IndividualFormProps> = ({ onSubmit, submitting }) => {
    const [values, setValues] = React.useState<UserFormValues>({ nombre: "", email: "", password: "" });
    return (
        <form
            onSubmit={e => {
                e.preventDefault();
                onSubmit(values);
            }}
        >
            <div className="mb-4">
                <label className="block text-gray-700 mb-1">Nombre</label>
                <input
                    className="w-full border rounded px-3 py-2"
                    value={values.nombre}
                    onChange={e => setValues(v => ({ ...v, nombre: e.target.value }))}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    className="w-full border rounded px-3 py-2"
                    value={values.email}
                    onChange={e => setValues(v => ({ ...v, email: e.target.value }))}
                    required
                />
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 mb-1">Contraseña</label>
                <input
                    type="password"
                    className="w-full border rounded px-3 py-2"
                    value={values.password}
                    onChange={e => setValues(v => ({ ...v, password: e.target.value }))}
                    required
                />
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={submitting}
                    className={`bg-blue-600 text-white px-4 py-2 rounded font-semibold ${submitting ? "opacity-60" : "hover:bg-blue-700"
                        }`}
                >
                    {submitting ? "Guardando..." : "Agregar Usuario"}
                </button>
            </div>
        </form>
    );
};

export default UserIndividualForm;
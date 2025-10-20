import React from "react";
import type { IndividualFormProps } from "../../common/components/EntityCreate";
import { UserRole } from "../../auth/types"; // Ajusta la ruta según corresponda

type UserFormValues = {
    nombre: string;
    apellido: string;
    correo: string;
    contrasena: string;
    cedula: string;
    fechaNacimiento: string;
    rol: UserRole;
};

const UserIndividualForm: React.FC<IndividualFormProps> = ({ onSubmit, submitting }) => {
    const [values, setValues] = React.useState<UserFormValues>({
        nombre: "",
        apellido: "",
        correo: "",
        contrasena: "",
        cedula: "",
        fechaNacimiento: "",
        rol: "" as UserRole,
    });

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
                <label className="block text-gray-700 mb-1">Apellido</label>
                <input
                    className="w-full border rounded px-3 py-2"
                    value={values.apellido}
                    onChange={e => setValues(v => ({ ...v, apellido: e.target.value }))}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-1">Correo</label>
                <input
                    type="email"
                    className="w-full border rounded px-3 py-2"
                    value={values.correo}
                    onChange={e => setValues(v => ({ ...v, correo: e.target.value }))}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-1">Contraseña</label>
                <input
                    type="password"
                    className="w-full border rounded px-3 py-2"
                    value={values.contrasena}
                    onChange={e => setValues(v => ({ ...v, contrasena: e.target.value }))}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-1">Cédula</label>
                <input
                    className="w-full border rounded px-3 py-2"
                    value={values.cedula}
                    onChange={e => setValues(v => ({ ...v, cedula: e.target.value }))}
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input
                    type="date"
                    className="w-full border rounded px-3 py-2"
                    value={values.fechaNacimiento}
                    onChange={e => setValues(v => ({ ...v, fechaNacimiento: e.target.value }))}
                    required
                />
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 mb-1">Rol</label>
                <select
                    className="w-full border rounded px-3 py-2"
                    value={values.rol}
                    onChange={e => setValues(v => ({ ...v, rol: e.target.value as UserRole }))}
                    required
                >
                    <option value="">Seleccione un rol</option>
                    <option value="ADMINISTRADOR">Administrador</option>
                    <option value="PROFESOR">Profesor</option>
                    <option value="ESTUDIANTE">Estudiante</option>
                </select>
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
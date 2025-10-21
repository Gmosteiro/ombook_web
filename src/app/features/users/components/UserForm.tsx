import React from "react";
import type { IndividualFormProps } from "../../common/components/EntityCreate";
import { UserFormValues, UserFormErrors } from "../types";
import { UserRole } from "../../auth/types";
import { formatCedula, validateCedula } from "../utils/Utils";

const UserIndividualForm: React.FC<IndividualFormProps> = ({ onSubmit, submitting }) => {
    const [values, setValues] = React.useState<UserFormValues>({
        nombre: "",
        apellido: "",
        correo: "",
        contrasena: "",
        confirmarContrasena: "",
        cedula: "",
        fechaNacimiento: "",
        rol: "" as UserRole,
    });

    const [errors, setErrors] = React.useState<UserFormErrors>({});

    const validateForm = (): boolean => {
        const newErrors: UserFormErrors = {};

        if (!values.nombre.trim()) newErrors.nombre = "Nombre es requerido";
        if (!values.apellido.trim()) newErrors.apellido = "Apellido es requerido";
        if (!values.correo.trim()) newErrors.correo = "Correo es requerido";
        if (!values.fechaNacimiento) newErrors.fechaNacimiento = "Fecha de nacimiento es requerida";
        if (!values.rol) newErrors.rol = "Rol es requerido";

        // Validación de cédula
        if (!values.cedula.trim()) {
            newErrors.cedula = "Cédula es requerida";
        } else if (!validateCedula(values.cedula)) {
            newErrors.cedula = "Cédula inválida";
        }

        // Validación específica de contraseña según el backend
        if (!values.contrasena) {
            newErrors.contrasena = "Contraseña es requerida";
        } else if (values.contrasena.length < 8) {
            newErrors.contrasena = "La contraseña debe tener al menos 8 caracteres";
        } else if (values.contrasena.length > 100) {
            newErrors.contrasena = "La contraseña no puede tener más de 100 caracteres";
        }

        // Validación de confirmación de contraseña
        if (!values.confirmarContrasena) {
            newErrors.confirmarContrasena = "Confirmar contraseña es requerido";
        } else if (values.contrasena !== values.confirmarContrasena) {
            newErrors.confirmarContrasena = "Las contraseñas no coinciden";
        }

        // Validación de email
        if (values.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.correo)) {
            newErrors.correo = "Formato de correo inválido";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedValue = formatCedula(e.target.value);
        setValues(v => ({ ...v, cedula: formattedValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // No enviar el campo confirmarContrasena al backend
            const { confirmarContrasena, ...dataToSend } = values;
            onSubmit(dataToSend);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                </label>
                <input
                    type="text"
                    className={`w-full border rounded px-3 py-2 ${errors.nombre ? 'border-red-500' : 'border-gray-300'}`}
                    value={values.nombre}
                    onChange={e => setValues(v => ({ ...v, nombre: e.target.value }))}
                    disabled={submitting}
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre}</p>}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                </label>
                <input
                    type="text"
                    className={`w-full border rounded px-3 py-2 ${errors.apellido ? 'border-red-500' : 'border-gray-300'}`}
                    value={values.apellido}
                    onChange={e => setValues(v => ({ ...v, apellido: e.target.value }))}
                    disabled={submitting}
                />
                {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido}</p>}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo *
                </label>
                <input
                    type="email"
                    className={`w-full border rounded px-3 py-2 ${errors.correo ? 'border-red-500' : 'border-gray-300'}`}
                    value={values.correo}
                    onChange={e => setValues(v => ({ ...v, correo: e.target.value }))}
                    disabled={submitting}
                />
                {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo}</p>}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cédula *
                </label>
                <input
                    type="text"
                    className={`w-full border rounded px-3 py-2 ${errors.cedula ? 'border-red-500' : 'border-gray-300'}`}
                    value={values.cedula}
                    onChange={handleCedulaChange}
                    placeholder="1.234.567-8"
                    maxLength={10}
                    disabled={submitting}
                />
                {errors.cedula && <p className="text-red-500 text-xs mt-1">{errors.cedula}</p>}
                <p className="text-gray-500 text-xs mt-1">Formato: 1.234.567-8</p>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento *
                </label>
                <input
                    type="date"
                    className={`w-full border rounded px-3 py-2 ${errors.fechaNacimiento ? 'border-red-500' : 'border-gray-300'}`}
                    value={values.fechaNacimiento}
                    onChange={e => setValues(v => ({ ...v, fechaNacimiento: e.target.value }))}
                    disabled={submitting}
                />
                {errors.fechaNacimiento && <p className="text-red-500 text-xs mt-1">{errors.fechaNacimiento}</p>}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                </label>
                <input
                    type="password"
                    className={`w-full border rounded px-3 py-2 ${errors.contrasena ? 'border-red-500' : 'border-gray-300'}`}
                    value={values.contrasena}
                    onChange={e => setValues(v => ({ ...v, contrasena: e.target.value }))}
                    minLength={8}
                    maxLength={100}
                    disabled={submitting}
                />
                {errors.contrasena && <p className="text-red-500 text-xs mt-1">{errors.contrasena}</p>}
                <p className="text-gray-500 text-xs mt-1">Mínimo 8 caracteres, máximo 100</p>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña *
                </label>
                <input
                    type="password"
                    className={`w-full border rounded px-3 py-2 ${errors.confirmarContrasena ? 'border-red-500' : 'border-gray-300'}`}
                    value={values.confirmarContrasena}
                    onChange={e => setValues(v => ({ ...v, confirmarContrasena: e.target.value }))}
                    minLength={8}
                    maxLength={100}
                    disabled={submitting}
                />
                {errors.confirmarContrasena && <p className="text-red-500 text-xs mt-1">{errors.confirmarContrasena}</p>}
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol *
                </label>
                <select
                    className={`w-full border rounded px-3 py-2 ${errors.rol ? 'border-red-500' : 'border-gray-300'}`}
                    value={values.rol}
                    onChange={e => setValues(v => ({ ...v, rol: e.target.value as UserRole }))}
                    disabled={submitting}
                >
                    <option value="">Selecciona un rol</option>
                    <option value={UserRole.ADMINISTRADOR}>Administrador</option>
                    <option value={UserRole.PROFESOR}>Profesor</option>
                    <option value={UserRole.ESTUDIANTE}>Estudiante</option>
                </select>
                {errors.rol && <p className="text-red-500 text-xs mt-1">{errors.rol}</p>}
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={submitting}
                    className={`min-w-[200px] bg-blue-600 text-white py-2 px-4 rounded font-semibold
                        ${submitting ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-700"}`}
                >
                    {submitting ? "Creando..." : "Crear Usuario"}
                </button>
            </div>
        </form>
    );
};

export default UserIndividualForm;
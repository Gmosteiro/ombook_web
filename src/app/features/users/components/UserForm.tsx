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

            onSubmit(values);
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
                    className={`min-w-[200px] ombook-btn ombook-btn-primary
                        ${submitting ? "opacity-60 cursor-not-allowed" : "ombook-btn-primary"}`}
                >
                    {submitting ? "Creando..." : "Crear Usuario"}
                </button>
            </div>
        </form>
    );
};

export default UserIndividualForm;
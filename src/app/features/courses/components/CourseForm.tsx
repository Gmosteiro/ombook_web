import { useState, useEffect } from "react";
import { CreateCourseData } from "../types/types";
import { useProfesores } from "../../users/hooks/useUsers";
import { ProfesorResponsable } from "../../users/types";

interface CourseFormProps {
    onSubmit: (data: CreateCourseData) => void;
    isLoading?: boolean;
}

export default function CourseForm({ onSubmit, isLoading }: CourseFormProps) {
    const { profesores, isLoading: isLoadingProfesores, error: profesoresError, loadProfesores } = useProfesores();
    const [selectedProfesores, setSelectedProfesores] = useState<ProfesorResponsable[]>([]);

    // Cargar profesores al montar el componente
    useEffect(() => {
        loadProfesores();
    }, []);

    const handleProfesorSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const profesorId = parseInt(e.target.value);
        if (profesorId) {
            const profesor = profesores.find(p => p.id === profesorId);
            if (profesor && !selectedProfesores.find(p => p.id === profesorId)) {
                setSelectedProfesores([...selectedProfesores, profesor]);
            }
        }
    };

    const removeProfesor = (profesorId: number) => {
        setSelectedProfesores(selectedProfesores.filter(p => p.id !== profesorId));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const year = formData.get("year") as string;
        const semester = formData.get("semester") as string;
        const periodoAcademico = year && semester ? `${year}/${semester}` : "";

        const courseData: CreateCourseData = {
            nombre: formData.get("nombre") as string,
            codigo: formData.get("codigo") as string,
            descripcion: formData.get("descripcion") as string,
            periodoAcademico: periodoAcademico,
            profesoresResponsables: selectedProfesores,
        };

        onSubmit(courseData);
        e.currentTarget.reset();
        setSelectedProfesores([]);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre del curso */}
                <div className="space-y-2">
                    <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre del Curso *
                    </label>
                    <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Ingrese el nombre del curso"
                    />
                </div>

                {/* Código del curso */}
                <div className="space-y-2">
                    <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Código del Curso *
                    </label>
                    <input
                        type="text"
                        id="codigo"
                        name="codigo"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Ej: MAT101"
                    />
                </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descripción *
                </label>
                <textarea
                    id="descripcion"
                    name="descripcion"
                    rows={3}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Describe el contenido y objetivos del curso"
                />
            </div>

            {/* Período Académico */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Período Académico *
                </label>
                <div className="grid grid-cols-2 gap-4">
                    {/* Año */}
                    <div className="space-y-1">
                        <label htmlFor="year" className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Año
                        </label>
                        <input
                            type="number"
                            id="year"
                            name="year"
                            required
                            min="2020"
                            max="2030"
                            defaultValue={new Date().getFullYear()}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="2024"
                        />
                    </div>

                    {/* Semestre */}
                    <div className="space-y-1">
                        <label htmlFor="semester" className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                            Semestre
                        </label>
                        <select
                            id="semester"
                            name="semester"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="">Seleccione</option>
                            <option value="1">Impar</option>
                            <option value="2">Par</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Profesores Responsables */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Profesores Responsables
                </label>

                {/* Mostrar error si hay */}
                {profesoresError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md p-3">
                        <p className="text-sm text-red-600 dark:text-red-400">{profesoresError}</p>
                        <button
                            type="button"
                            onClick={loadProfesores}
                            className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Select para agregar profesores */}
                <div className="space-y-2">
                    <select
                        onChange={handleProfesorSelect}
                        value=""
                        disabled={isLoadingProfesores}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                        <option value="">
                            {isLoadingProfesores ? "Cargando profesores..." : "Seleccione un profesor"}
                        </option>
                        {profesores.map((profesor) => (
                            <option key={profesor.id} value={profesor.id}>
                                {profesor.nombreCompleto}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Lista de profesores seleccionados */}
                {selectedProfesores.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Profesores seleccionados:
                        </p>
                        <div className="space-y-1">
                            {selectedProfesores.map((profesor) => (
                                <div
                                    key={profesor.id}
                                    className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md px-3 py-2"
                                >
                                    <span className="text-sm text-blue-800 dark:text-blue-300">
                                        {profesor.nombreCompleto}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (typeof profesor.id === "number") removeProfesor(profesor.id);
                                        }}
                                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Botón de envío */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    {isLoading ? "Creando..." : "Crear Curso"}
                </button>
            </div>
        </form>
    );
}
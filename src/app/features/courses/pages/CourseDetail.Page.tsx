import { useEffect, useState } from "react";
import { useParams } from "react-router";
import CourseSidebar from "../components/CourseSidebar";
import CourseContentLayout from "../components/CourseContentLayout";
import { Course } from "../types/types";
import { API_URL } from "~/features/common/utils/Utils";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError("ID de curso inválido");
      setLoading(false);
      return;
    }

    const fetchCourse = async () => {
      try {
        const res = await fetch(`${API_URL}/courses/${id}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setCourse(data);
      } catch (err) {
        console.warn("Error al obtener curso desde API, usando mock. Detalle:", err);
        const mock: Course = {
          id: id,
          nombre: `Curso ${id}`,
          codigo: `C-${id}`,
          descripcion: "Descripción de ejemplo (mock)",
          periodoAcademico: "2025 - 1",
          estadoCurso: "ACTIVO",
          docentesAsignados: [{ id: "d1", nombre: "Dra. Ejemplo" }],
        } as Course;
        setCourse(mock);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Cargando curso...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  if (!course) {
    return <div className="p-6 text-center text-gray-500">Curso no encontrado.</div>;
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      {/* Banner ocupa todo el ancho */}
      <div className="w-full h-56 bg-gray-200 flex items-end justify-start relative">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
          alt="Banner curso"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 p-10">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg">
            {course.nombre || "Curso"}
          </h1>
        </div>
      </div>
      {/* Contenido principal con sidebar */}
      <div className="flex flex-row px-8 py-10">
        <CourseSidebar course={course} />
        <main className="flex-1 flex flex-col">
          <div className="ml-8 mr-8 ">
            <div className="bg-white rounded-xl shadow p-8">
              <CourseContentLayout course={course} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import { useLoaderData } from "react-router";
import CourseSidebar from "../components/CourseSidebar";
import CourseContentLayout from "../components/general/CourseContentLayout";
import { Course } from "../types/types";
import { apiFetch } from "../../auth/utils/methods";
import { getValidJWTToken } from "~/services/session.server";

export async function loader({ params, request }: { params: { id: string }, request: Request }) {
  const { id } = params;
  try {
    const res = await apiFetch(`/cursos/buscar?id=${id}`, {
      method: 'GET',
      secure: true,
      jwtToken: await getValidJWTToken(request)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const course: Course = await res.json();

    return course;
  } catch (err) {
    console.error("Error fetching course data:", err);
    return null;
  }
}


export function meta() {
  // const course = useLoaderData() as Course;

  return [
    { title: `Ombook | Cursos` }
  ];
}

export default function CourseDetailPage() {
  const course = useLoaderData() as Course;
  return (
    <div className="min-h-screen bg-[#f6f7f9]">

      <div className="w-full h-56 bg-gray-200 flex items-end justify-start relative">
        <img
          src={course.imagenUrl}
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

      <div className="flex flex-row px-8 py-10">
        <CourseSidebar course={course} />
        <main className="flex-1 flex flex-col">
          <div className="ml-8 mr-8">
            <div className="bg-white rounded-xl shadow p-8">
              <CourseContentLayout course={course} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

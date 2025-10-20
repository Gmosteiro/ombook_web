"use client";
//import React from "react";
import { useState, useEffect } from "react";
import { useCourses } from "../hooks/useCourses";
import { FilterBar } from "../components/FilterBar";
import { CourseCard } from "../components/CourseCard";
import { Pagination } from "../components/Pagination";


import { getCoursesByRole, Course } from "../api/coursesService";

export const CoursesPage = () => {
  //esto es para cuando tengamos auth
  //const { courses, loading } = useCoursesContext();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const mockRole = "Administrador";
  const mockUser = "Ana Gómez";

  useEffect(() => {
    const result = getCoursesByRole(mockRole, mockUser);
    setCourses(result);
    setLoading(false);
  }, []);
  const { filters, setFilters, page, setPage, totalPages, filteredCourses, paginated } = useCourses(courses);

  if (loading) return <div className="p-8 text-gray-500">Cargando cursos...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Cursos</h1>
      <FilterBar filters={filters} setFilters={setFilters} />

      {filteredCourses.length === 0 ? (
        <div className="text-center text-gray-500 mt-12">
          No se encontraron cursos con los criterios seleccionados.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
};

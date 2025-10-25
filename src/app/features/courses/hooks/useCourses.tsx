import { useMemo, useState } from "react";
import { Course } from "../api/coursesService";

export const useCourses = (allCourses: Course[]) => {
  const [filters, setFilters] = useState({
    query: "",
    teacher: "",
    status: "",
    period: ""
  });
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;

  const filteredCourses = useMemo(() => {
    return allCourses.filter((c) => {
      const matchesQuery = c.title.toLowerCase().includes(filters.query.toLowerCase());
      const matchesTeacher = !filters.teacher || c.teacher === filters.teacher;
      const matchesStatus = !filters.status || c.status === filters.status;
      const matchesPeriod = !filters.period || c.period === filters.period;
      return matchesQuery && matchesTeacher && matchesStatus && matchesPeriod;
    });
  }, [filters, allCourses]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginated = filteredCourses.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return { filters, setFilters, page, setPage, totalPages, filteredCourses, paginated };
};

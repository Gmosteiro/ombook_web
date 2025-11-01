import { Filters } from "../pages/CoursesPage";

interface FilterBarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 mb-8 flex flex-wrap gap-3 items-center">
    <div className="relative flex-1 min-w-[220px]">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        {/* Lupa SVG */}
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        type="text"
        placeholder="Buscar por nombre o código."
        className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-gray-700 bg-gray-50"
        value={filters.search}
        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
      />
    </div>
    <select
      className="border border-gray-200 rounded-lg py-2 px-4 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      value={filters.status}
      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
    >
      <option value="">Filtrar por estado</option>
      <option value="ACTIVO">Activo</option>
      <option value="INACTIVO">Inactivo</option>
      <option value="ELIMINADO">Eliminado</option>
    </select>
    <select
      className="border border-gray-200 rounded-lg py-2 px-4 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
      value={filters.teacher || ""}
      onChange={(e) => setFilters({ ...filters, teacher: e.target.value })}
    >
      <option value="">Filtrar por docente</option>
      {/* TODO */}
    </select>
  </div>
);

import { Filters } from "../pages/CoursesPage";

interface FilterBarProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, setFilters }) => (
  <div className="flex flex-wrap gap-3 mb-6">
    <input
      type="text"
      placeholder="Buscar por nombre o código..."
      className="flex-1 border rounded-xl p-2 px-4"
      value={filters.search}
      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
    />
    <select
      className="border rounded-xl p-2"
      value={filters.status}
      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
    >
      <option value="">Filtrar por estado</option>
      <option value="Activo">Activo</option>
      <option value="Archivado">Archivado</option>
    </select>
  </div>
);



export const FilterBar = ({ filters, setFilters }: any) => (
  <div className="flex flex-wrap gap-3 mb-6">
    <input
      type="text"
      placeholder="Buscar por nombre o código..."
      className="flex-1 border rounded-xl p-2 px-4"
      value={filters.query}
      onChange={(e) => setFilters({ ...filters, query: e.target.value })}
    />
    <select className="border rounded-xl p-2" value={filters.status}
      onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
      <option value="">Filtrar por estado</option>
      <option value="Activo">Activo</option>
      <option value="Archivado">Archivado</option>
    </select>
    <select className="border rounded-xl p-2" value={filters.period}
      onChange={(e) => setFilters({ ...filters, period: e.target.value })}>
      <option value="">Filtrar por período</option>
      <option value="2024-1">2024-1</option>
      <option value="2024-2">2024-2</option>
      <option value="2023-2">2023-2</option>
    </select>
  </div>
);

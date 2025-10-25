
export const Pagination = ({ currentPage, totalPages, onPageChange }: any) => (
  <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
    <p>Mostrando página {currentPage} de {totalPages}</p>
    <div className="flex gap-2">
      <button
        className="px-3 py-1 border rounded-lg disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Anterior
      </button>
      <button
        className="px-3 py-1 border rounded-lg disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Siguiente
      </button>
    </div>
  </div>
);

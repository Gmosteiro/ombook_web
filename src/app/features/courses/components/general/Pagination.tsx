export const Pagination = ({ currentPage, totalPages, onPageChange }: any) => {

  const handlePrevious = () => {
    onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    onPageChange(currentPage + 1);
  };

  return (
    <div className="flex justify-between items-center mt-8 text-sm text-gray-600">
      <p>Mostrando página {currentPage} de {totalPages}</p>
      <div className="flex gap-2">
        <button
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium shadow-sm transition hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        <button
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium shadow-sm transition hover:bg-blue-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          onClick={handleNext}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

import { render, screen, fireEvent } from '@testing-library/react';
import BulkDeleteCourses from '../components/BulkDeleteCourses';

describe('Eliminación masiva de cursos', () => {
    it('elimina varios cursos y actualiza el listado', async () => {
        render(<BulkDeleteCourses />);
        fireEvent.click(screen.getByRole('button', { name: /eliminar seleccionados/i }));
        expect(await screen.findByText(/cursos eliminados/i)).toBeInTheDocument();
    });
});
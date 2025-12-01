import { render, screen, fireEvent } from '@testing-library/react';
import BulkCreateCourses from '../components/BulkCreateCourses';

describe('Alta individual y masiva de cursos', () => {
    it('crea cursos manualmente', async () => {
        render(<BulkCreateCourses />);
        fireEvent.click(screen.getByRole('button', { name: /crear curso/i }));
        expect(await screen.findByText(/curso creado/i)).toBeInTheDocument();
    });

    it('importa cursos por CSV', async () => {
        render(<BulkCreateCourses />);
        fireEvent.change(screen.getByLabelText(/importar csv/i), { target: { files: [new File([''], 'cursos.csv')] } });
        fireEvent.click(screen.getByRole('button', { name: /importar/i }));
        expect(await screen.findByText(/cursos importados/i)).toBeInTheDocument();
    });
});
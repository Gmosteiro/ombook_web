import { render, screen, fireEvent } from '@testing-library/react';
import BulkEnrollUnenroll from '../components/BulkEnrollUnenroll';

describe('Matriculación y desmatriculación masiva por CSV', () => {
    it('matricula estudiantes por CSV', async () => {
        render(<BulkEnrollUnenroll />);
        fireEvent.change(screen.getByLabelText(/importar csv/i), { target: { files: [new File([''], 'matricula.csv')] } });
        fireEvent.click(screen.getByRole('button', { name: /matricular por csv/i }));
        expect(await screen.findByText(/estudiantes matriculados/i)).toBeInTheDocument();
    });

    it('desmatricula estudiantes por CSV', async () => {
        render(<BulkEnrollUnenroll />);
        fireEvent.change(screen.getByLabelText(/importar csv/i), { target: { files: [new File([''], 'cursos-baja.csv')] } });
        fireEvent.click(screen.getByRole('button', { name: /desmatricular por csv/i }));
        expect(await screen.findByText(/estudiantes desmatriculados/i)).toBeInTheDocument();
    });
});
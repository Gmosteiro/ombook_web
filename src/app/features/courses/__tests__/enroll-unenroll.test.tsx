import { render, screen, fireEvent } from '@testing-library/react';
import EnrollUnenroll from '../components/EnrollUnenroll';

describe('Matriculación y desmatriculación individual', () => {
    it('matricula a un estudiante', async () => {
        render(<EnrollUnenroll />);
        fireEvent.click(screen.getByRole('button', { name: /matricular/i }));
        expect(await screen.findByText(/estudiante matriculado/i)).toBeInTheDocument();
    });

    it('desmatricula a un estudiante', async () => {
        render(<EnrollUnenroll />);
        fireEvent.click(screen.getByRole('button', { name: /desmatricular/i }));
        expect(await screen.findByText(/estudiante desmatriculado/i)).toBeInTheDocument();
    });
});
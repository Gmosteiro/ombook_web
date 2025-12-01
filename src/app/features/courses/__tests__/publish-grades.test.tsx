import { render, screen, fireEvent } from '@testing-library/react';
import PublishGrades from '../components/PublishGrades';

describe('Publicación de calificaciones finales', () => {
    it('publica calificaciones individuales', async () => {
        render(<PublishGrades />);
        fireEvent.click(screen.getByRole('button', { name: /publicar calificación/i }));
        expect(await screen.findByText(/calificación publicada/i)).toBeInTheDocument();
    });

    it('publica calificaciones por CSV', async () => {
        render(<PublishGrades />);
        fireEvent.change(screen.getByLabelText(/importar csv/i), { target: { files: [new File([''], 'calificaciones.csv')] } });
        fireEvent.click(screen.getByRole('button', { name: /publicar por csv/i }));
        expect(await screen.findByText(/calificaciones publicadas/i)).toBeInTheDocument();
    });
});
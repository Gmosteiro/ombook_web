import { render, screen, fireEvent } from '@testing-library/react';
import UploadAssignment from '../components/UploadAssignment';

describe('Subida de tarea dentro del plazo', () => {
    it('permite subir tarea antes del límite', async () => {
        render(<UploadAssignment deadline={Date.now() + 10000} />);
        fireEvent.change(screen.getByLabelText(/subir archivo/i), { target: { files: [new File([''], 'tarea.pdf')] } });
        fireEvent.click(screen.getByRole('button', { name: /subir/i }));
        expect(await screen.findByText(/tarea subida/i)).toBeInTheDocument();
    });
});
import { render, screen, fireEvent } from '@testing-library/react';
import BulkCreateUsers from '../components/BulkCreateUsers';

describe('Alta de usuarios', () => {
    it('crea usuario individualmente', async () => {
        render(<BulkCreateUsers />);
        fireEvent.click(screen.getByRole('button', { name: /crear usuario/i }));
        expect(await screen.findByText(/usuario creado/i)).toBeInTheDocument();
    });

    it('importa usuarios por CSV', async () => {
        render(<BulkCreateUsers />);
        fireEvent.change(screen.getByLabelText(/importar csv/i), { target: { files: [new File([''], 'usuarios.csv')] } });
        fireEvent.click(screen.getByRole('button', { name: /importar/i }));
        expect(await screen.findByText(/usuarios importados/i)).toBeInTheDocument();
    });
});
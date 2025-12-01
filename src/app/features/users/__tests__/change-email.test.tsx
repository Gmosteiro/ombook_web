import { render, screen, fireEvent } from '@testing-library/react';
import ChangeEmail from '../components/ChangeEmail';

describe('Cambio de correo electrónico', () => {
    it('permite cambiar el correo', async () => {
        render(<ChangeEmail />);
        fireEvent.change(screen.getByLabelText(/nuevo correo/i), { target: { value: 'nuevo@email.com' } });
        fireEvent.click(screen.getByRole('button', { name: /cambiar correo/i }));
        expect(await screen.findByText(/correo actualizado/i)).toBeInTheDocument();
    });
});
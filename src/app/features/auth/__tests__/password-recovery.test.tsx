import { render, screen, fireEvent } from '@testing-library/react';
import PasswordRecovery from '../components/PasswordRecovery';

describe('Recuperación de contraseña', () => {
    it('envía email de recuperación', async () => {
        render(<PasswordRecovery />);
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@email.com' } });
        fireEvent.click(screen.getByRole('button', { name: /recuperar contraseña/i }));
        expect(await screen.findByText(/correo enviado/i)).toBeInTheDocument();
    });
});
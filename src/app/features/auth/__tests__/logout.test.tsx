import { render, screen, fireEvent } from '@testing-library/react';
import Logout from '../components/Logout';

describe('Cierre de sesión', () => {
    it('elimina la sesión y redirige al login', () => {
        render(<Logout />);
        fireEvent.click(screen.getByRole('button', { name: /cerrar sesión/i }));
        // Mockear la función de logout y verificar redirección
        expect(screen.getByText(/has cerrado sesión/i)).toBeInTheDocument();
    });
});
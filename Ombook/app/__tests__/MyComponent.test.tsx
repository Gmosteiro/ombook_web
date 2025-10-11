import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Login from '../features/auth/login/Login';

jest.mock('react-router-dom', () => ({
    Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

describe('Login', () => {
    test('renderiza el formulario de login y permite ingresar credenciales', () => {
        render(<Login />);

        const emailInput = screen.getByLabelText(/email|correo/i);
        const passwordInput = screen.getByLabelText(/contraseña|password/i);
        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: '123456' } });
        expect((emailInput as HTMLInputElement).value).toBe('test@example.com');
        expect((passwordInput as HTMLInputElement).value).toBe('123456');

        const loginButton = screen.getByRole('button', { name: /iniciar sesión|login/i });
        expect(loginButton).toBeInTheDocument();
    });
});

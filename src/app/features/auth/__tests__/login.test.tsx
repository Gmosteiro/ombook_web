jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    Form: ({ children, ...props }: { children?: React.ReactNode }) => <form {...props}>{children}</form>
}));
jest.mock('../../common/utils/Utils', () => ({
    API_URL: 'https://www.ombook.lat/api'
}));
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router';
import Login from '../components/Login';

describe('Inicio de sesión', () => {
    it('muestra mensaje de bienvenida si login es exitoso', () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );
        expect(screen.getByText(/bienvenido de nuevo a tu cuenta/i)).toBeInTheDocument();
    });

    it('muestra error con credenciales inválidas', () => {
        render(
            <MemoryRouter>
                <Login actionData={{ error: 'Credenciales inválidas' }} />
            </MemoryRouter>
        );
        expect(screen.getByText(/credenciales inválidas/i)).toBeInTheDocument();
    });
});
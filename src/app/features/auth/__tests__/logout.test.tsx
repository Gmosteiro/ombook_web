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
import Logout from '../components/Logout';

describe('Cierre de sesión', () => {
    it('muestra el botón de cerrar sesión', () => {
        render(
            <MemoryRouter>
                <Logout />
            </MemoryRouter>
        );
        expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument();
    });
});
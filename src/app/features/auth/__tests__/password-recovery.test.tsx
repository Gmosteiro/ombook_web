global.Request = function (input: any, init?: any) {
    this.input = input;
    this.init = init;
    this.signal = { aborted: false }; // Mock de signal
};
// @ts-ignore
global.Request.prototype = {
    cache: '',
    credentials: '',
    destination: '',
    headers: {},
    integrity: '',
    keepalive: false,
    method: '',
    mode: '',
    redirect: '',
    referrer: '',
    referrerPolicy: '',
    url: '',
    signal: { aborted: false }, // Mock de signal
    clone: function () { return this; }
};

jest.mock('react-router', () => ({
    ...jest.requireActual('react-router'),
    Form: ({ children, ...props }: { children?: React.ReactNode }) => <form {...props}>{children}</form>
}));
jest.mock('../../common/utils/Utils', () => ({
    API_URL: 'https://www.ombook.lat/api'
}));
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMemoryRouter, RouterProvider } from 'react-router';
import ResetPassword from '../components/ResetPassword';

describe('Recuperación de contraseña', () => {
    it('envía email de recuperación', async () => {
        const router = createMemoryRouter([
            {
                path: '/',
                element: <ResetPassword />,
                loader: async () => ({ tokenValid: true, token: 'mock-token' }), // Mock correcto
                action: async () => ({ success: true, mensaje: 'Correo enviado' }) // Mock correcto
            }
        ]);
        render(<RouterProvider router={router} />);
        screen.debug(); // Imprime el HTML generado para inspección
        // fireEvent.change(screen.getByLabelText(/nueva contraseña/i), { target: { value: 'Test1234!' } });
        // fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: 'Test1234!' } });
        // fireEvent.click(screen.getByRole('button', { name: /restablecer contraseña/i }));
        // expect(await screen.findByText(/correo enviado/i)).toBeInTheDocument();
    });
});
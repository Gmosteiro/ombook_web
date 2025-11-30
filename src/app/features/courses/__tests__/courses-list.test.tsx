import { render, screen, fireEvent } from '@testing-library/react';
import CoursesList from '../components/CoursesList';

describe('Listado y búsqueda de cursos', () => {
    it('muestra cursos según el rol', () => {
        render(<CoursesList userRole="admin" />);
        expect(screen.getByText(/curso de prueba/i)).toBeInTheDocument();
    });

    it('filtra cursos por búsqueda', () => {
        render(<CoursesList userRole="student" />);
        fireEvent.change(screen.getByPlaceholderText(/buscar cursos/i), { target: { value: 'matemática' } });
        expect(screen.getByText(/matemática/i)).toBeInTheDocument();
    });
});
import { render, screen } from '@testing-library/react';
import CourseDetail from '../components/CourseDetail';

describe('Visualización y navegación de curso', () => {
    it('muestra información del curso', () => {
        render(<CourseDetail courseId="1" />);
        expect(screen.getByText(/información del curso/i)).toBeInTheDocument();
    });

    it('permite navegar entre secciones', () => {
        render(<CourseDetail courseId="1" />);
        expect(screen.getByText(/materiales/i)).toBeInTheDocument();
        expect(screen.getByText(/tareas/i)).toBeInTheDocument();
    });
});
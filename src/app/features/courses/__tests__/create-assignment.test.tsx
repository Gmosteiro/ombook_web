import { render, screen, fireEvent } from '@testing-library/react';
import CreateAssignment from '../components/CreateAssignment';

describe('Creación de tareas para un curso', () => {
    it('crea una nueva tarea', async () => {
        render(<CreateAssignment />);
        fireEvent.click(screen.getByRole('button', { name: /crear tarea/i }));
        expect(await screen.findByText(/tarea creada/i)).toBeInTheDocument();
    });
});
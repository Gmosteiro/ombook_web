import { render, screen, fireEvent } from '@testing-library/react';
import DeadlineWarning from '../components/DeadlineWarning';

describe('Aviso masivo de proximidad de plazo', () => {
    it('envía aviso masivo de proximidad de plazo', async () => {
        render(<DeadlineWarning />);
        fireEvent.click(screen.getByRole('button', { name: /enviar avisos/i }));
        expect(await screen.findByText(/avisos enviados/i)).toBeInTheDocument();
    });
});
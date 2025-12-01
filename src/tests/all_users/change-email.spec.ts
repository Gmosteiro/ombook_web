import { test } from '@playwright/test';
import { login } from './helpers';
import { ESTUDIANTE_USER } from '../playwright.constants';

test('test', async ({ page }) => {
    await login(page, ESTUDIANTE_USER.mail, ESTUDIANTE_USER.password);

    await page.getByRole('button', { name: 'Abrir menú de usuario' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Mi Perfil' }).click();
    await page.getByRole('button', { name: 'Editar' }).click();
    await page.getByRole('button', { name: 'Acciones' }).click();
    await page.getByRole('button', { name: 'Cambiar Correo' }).click();
    await page.getByRole('textbox', { name: 'Nuevo correo electrónico' }).click();
    await page.getByRole('textbox', { name: 'Nuevo correo electrónico' }).fill('test@test.com');
    await page.getByRole('textbox', { name: 'Nuevo correo electrónico' }).press('Tab');
    await page.getByRole('textbox', { name: 'Contraseña actual' }).fill(ESTUDIANTE_USER.password);
    await page.getByRole('button', { name: 'Solicitar cambio de correo' }).click();
    await page.getByText('Solicitud de cambio de correo').click();
});
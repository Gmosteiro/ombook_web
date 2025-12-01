import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('https://www.ombook.lat/login/');
    await page.getByText('Correo electrónicoContraseñ').click();
    await page.getByRole('textbox', { name: 'Correo electrónico' }).click();
    await page.getByRole('textbox', { name: 'Correo electrónico' }).fill('gastonmosteiro@hotmail.com');
    await page.getByRole('textbox', { name: 'Correo electrónico' }).press('Tab');
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('Test.1234');
    await page.getByRole('textbox', { name: 'Contraseña' }).press('Enter');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.getByRole('heading', { name: '¡Bienvenido a Ombook Gaston' }).click();
});
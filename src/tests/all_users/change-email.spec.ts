import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    await page.goto('http://localhost:3000/login/');
    await page.getByRole('textbox', { name: 'Correo electrónico' }).click();
    await page.getByRole('textbox', { name: 'Correo electrónico' }).fill('gastonmosteiro@hotmail.com');
    await page.getByRole('textbox', { name: 'Contraseña' }).click();
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('Test.1234');
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
    await page.getByRole('button', { name: 'Abrir menú de usuario' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Mi Perfil' }).click();
    await page.getByRole('button', { name: 'Editar' }).click();
});
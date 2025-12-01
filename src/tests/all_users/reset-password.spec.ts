import { test } from '@playwright/test';
import { login } from './helpers';
import { PROFESOR_USER } from '../playwright.constants';

test('test', async ({ page }) => {
    await login(page, PROFESOR_USER.mail, PROFESOR_USER.password);
    await page.getByRole('button', { name: 'Abrir menú de usuario' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Mi Perfil' }).click();
    await page.getByRole('button', { name: 'Editar' }).click();
    await page.getByRole('button', { name: 'Acciones' }).click();
    await page.getByRole('button', { name: 'Cambiar Contraseña' }).click();
    await page.getByRole('textbox', { name: 'Contraseña Actual' }).click();
    await page.getByRole('textbox', { name: 'Contraseña Actual' }).fill(PROFESOR_USER.password);
    await page.getByRole('textbox', { name: 'Contraseña Actual' }).press('Tab');
    await page.getByRole('textbox', { name: 'Nueva Contraseña', exact: true }).fill(PROFESOR_USER.password + '1');
    await page.getByRole('textbox', { name: 'Confirmar Nueva Contraseña' }).click();
    await page.getByRole('textbox', { name: 'Confirmar Nueva Contraseña' }).fill(PROFESOR_USER.password + '1');
    await page.getByRole('button', { name: 'Cambiar Contraseña' }).click();
    await page.locator('div').filter({ hasText: /^Contraseña actualizada correctamente\.$/ }).click();
});
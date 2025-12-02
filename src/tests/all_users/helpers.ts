import { Page } from '@playwright/test';
import { WEB_PAGE } from '../playwright.constants';

export async function login(page: Page, email: string, password: string) {
    await page.goto(`${WEB_PAGE}/login/`);
    await page.getByText('Correo electrónicoContraseñ').click();
    await page.getByRole('textbox', { name: 'Correo electrónico' }).click();
    await page.getByRole('textbox', { name: 'Correo electrónico' }).fill(email);
    await page.getByRole('textbox', { name: 'Correo electrónico' }).press('Tab');
    await page.getByRole('textbox', { name: 'Contraseña' }).fill(password);
    await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
}